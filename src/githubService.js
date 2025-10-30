import axios from 'axios';

/**
 * 获取 GitHub 热门仓库 (近期高活跃度的热门项目)
 * @param {number} limit - 返回的仓库数量
 * @returns {Promise<Array>} 仓库列表
 */
export async function fetchGithubTrending(limit = 10) {
  try {
    // 计算过去7天的日期
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const dateString = lastWeek.toISOString().split('T')[0];
    
    // 使用 GitHub Search API 搜索过去7天活跃且高 star 的仓库
    // 搜索条件：过去7天有更新 + star数>500，按star排序
    // 注意：GitHub API 有速率限制，未认证的请求每小时 60 次
    const response = await axios.get('https://api.github.com/search/repositories', {
      params: {
        q: `pushed:>=${dateString} stars:>500`,
        sort: 'stars',
        order: 'desc',
        per_page: limit
      },
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Trending-Notion-Bot',
        // 如果配置了 GitHub Token，使用它以获得更高的速率限制
        ...(process.env.GITHUB_TOKEN && {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
        })
      }
    });
    
    // 格式化数据
    const repositories = response.data.items.map(repo => ({
      name: repo.full_name,
      description: repo.description || '暂无描述',
      stars: repo.stargazers_count,
      starsToday: repo.stargazers_count, // 新仓库的话，所有 stars 都是"今日"获得的
      language: repo.language || '未知',
      url: repo.html_url,
      author: repo.owner.login,
      authorAvatar: repo.owner.avatar_url,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      defaultBranch: repo.default_branch || 'main'
    }));
    
    return repositories;
  } catch (error) {
    console.error('获取 GitHub 数据失败:', error.message);
    if (error.response) {
      console.error('API 响应状态:', error.response.status);
      console.error('API 响应数据:', error.response.data);
    }
    throw error;
  }
}

/**
 * 获取仓库的 README 内容
 * @param {string} owner - 仓库所有者
 * @param {string} repo - 仓库名称
 * @param {string} branch - 分支名称
 * @returns {Promise<string>} README 内容
 */
export async function fetchReadme(owner, repo, branch = 'main') {
  try {
    const headers = {
      'Accept': 'application/vnd.github.v3.raw',
      'User-Agent': 'GitHub-Trending-Notion-Bot',
      ...(process.env.GITHUB_TOKEN && {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
      })
    };
    
    // 尝试常见的 README 文件名
    const readmeFiles = ['README.md', 'Readme.md', 'readme.md', 'README', 'README.txt'];
    
    for (const filename of readmeFiles) {
      try {
        const response = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/contents/${filename}`,
          { headers, timeout: 10000 }
        );
        
        if (response.data) {
          // 如果返回的是 base64 编码的内容
          if (response.data.content) {
            return Buffer.from(response.data.content, 'base64').toString('utf-8');
          }
          // 如果直接返回文本（使用 raw accept header）
          if (typeof response.data === 'string') {
            return response.data;
          }
        }
      } catch (err) {
        // 文件不存在，尝试下一个
        continue;
      }
    }
    
    console.warn(`  ⚠ 未找到 README 文件: ${owner}/${repo}`);
    return '';
    
  } catch (error) {
    console.warn(`  ⚠ 获取 README 失败: ${error.message}`);
    return '';
  }
}

/**
 * 为仓库列表获取 README 内容
 * @param {Array} repositories - 仓库列表
 * @returns {Promise<Array>} 包含 README 的仓库列表
 */
export async function enrichRepositoriesWithReadme(repositories) {
  console.log(`\n开始获取 ${repositories.length} 个仓库的 README...\n`);
  
  const enrichedRepos = [];
  
  for (let i = 0; i < repositories.length; i++) {
    const repo = repositories[i];
    const [owner, repoName] = repo.name.split('/');
    
    console.log(`[${i + 1}/${repositories.length}] 获取 README: ${repo.name}`);
    
    try {
      const readme = await fetchReadme(owner, repoName, repo.defaultBranch);
      
      // 限制 README 长度，避免超过 API 限制
      const truncatedReadme = readme.substring(0, 8000);
      
      enrichedRepos.push({
        ...repo,
        readme: truncatedReadme,
        hasReadme: readme.length > 0
      });
      
      if (readme.length > 0) {
        console.log(`  ✓ 获取成功 (${readme.length} 字符)`);
      }
      
      // 添加延迟避免 API 速率限制
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`  ✗ 获取失败: ${error.message}`);
      enrichedRepos.push({
        ...repo,
        readme: '',
        hasReadme: false
      });
    }
  }
  
  console.log('\nREADME 获取完成!\n');
  return enrichedRepos;
}

/**
 * 获取 GitHub Trending 仓库
 * 使用 OSS Insight API (PingCAP 官方，稳定可靠)
 * @param {number} limit - 返回的仓库数量
 * @param {string} language - 编程语言筛选（可选，默认 'All'）
 * @param {string} period - 时间范围（past_24_hours, past_week, past_month）
 * @returns {Promise<Array>} 仓库列表
 */
export async function fetchGithubTrendingAlternative(limit = 10, language = 'All', period = 'past_24_hours') {
  try {
    console.log(`正在从 OSS Insight API 获取数据... (language: ${language}, period: ${period})`);

    // 使用新的 OSS Insight Trending API 端点
    const endpoint = 'https://api.ossinsight.io/q/trending-repos';

    const response = await axios.get(endpoint, {
      params: {
        language: language,
        period: period
      },
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      }
    });

    console.log('✓ 成功: OSS Insight API');

    // 新 API 返回格式: { data: [...] }
    const data = response.data.data || [];

    if (data.length === 0) {
      throw new Error('OSS Insight 返回数据为空');
    }

    const repositories = data
      .slice(0, limit)
      .map(item => ({
        name: item.repo_name,
        description: item.description || '暂无描述',
        stars: parseInt(item.stars || 0),
        starsToday: parseInt(item.stars || 0),
        language: item.language || '未知',
        url: `https://github.com/${item.repo_name}`,
        author: item.repo_name.split('/')[0],
        authorAvatar: '',
        forks: parseInt(item.forks || 0),
        defaultBranch: 'main',
        totalScore: parseFloat(item.total_score || 0)
      }));

    console.log(`  获取到 ${repositories.length} 个仓库`);

    return repositories;

  } catch (error) {
    console.error('获取 GitHub Trending 数据失败:', error.message);
    if (error.response) {
      console.error('  HTTP状态:', error.response.status);
      console.error('  错误详情:', JSON.stringify(error.response.data).substring(0, 200));
    }
    throw error;
  }
}

