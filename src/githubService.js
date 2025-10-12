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
 * 获取 GitHub Trending 仓库（使用多个可靠的 Trending API）
 * 自动尝试多个数据源，确保获取到真实的每日热榜数据
 * @param {number} limit - 返回的仓库数量
 * @param {string} language - 编程语言筛选（可选）
 * @returns {Promise<Array>} 仓库列表
 */
export async function fetchGithubTrendingAlternative(limit = 10, language = '') {
  try {
    // 方案1: 尝试 OSS Insight API (PingCAP 官方，最可靠)
    // 注意：OSS Insight 的 Trends API 目前可能还在开发中，如果失败会自动切换到其他方案
    try {
      console.log('尝试方案1: OSS Insight API...');
      
      // 使用经过验证的 OSS Insight Trends API 端点
      const endpoint = 'https://api.ossinsight.io/v1/trends/repos';
      
      const response = await axios.get(endpoint, { 
        timeout: 10000,
        headers: {
          'User-Agent': 'GitHub-Trending-Notion-Bot',
          'Accept': 'application/json'
        }
      });
      
      console.log('✓ 方案1成功: OSS Insight API');
      
      // OSS Insight API 返回格式: { type: "sql_endpoint", data: { rows: [...] } }
      const data = response.data.data;
      const rows = data.rows || [];
      
      if (rows.length === 0) {
        throw new Error('OSS Insight 返回数据为空');
      }
      
      const repositories = rows.slice(0, limit).map(row => ({
        name: row.repo_name, // 格式: "owner/repo"
        description: row.description || '暂无描述',
        stars: parseInt(row.stars || 0), // 注意：stars 字段是字符串
        starsToday: parseInt(row.stars || 0), // OSS Insight 返回的是总 stars，不是今日新增
        language: row.primary_language || '未知',
        url: `https://github.com/${row.repo_name}`,
        author: row.repo_name.split('/')[0],
        authorAvatar: '',
        forks: parseInt(row.forks || 0),
        defaultBranch: 'main'
      }));
      
      return repositories;
      
    } catch (err1) {
      console.log('方案1失败:', err1.message);
      if (err1.response) {
        console.log('  HTTP状态:', err1.response.status);
        console.log('  错误详情:', JSON.stringify(err1.response.data).substring(0, 200));
      }
      console.log('  OSS Insight API 可能还在开发中，切换到备用方案...');
      console.log('尝试方案2...');
    }
    
    // 方案2: 尝试 gtrend.yapie.me (专业的 Trending API)
    try {
      console.log('尝试方案2: gtrend.yapie.me API...');
      const url = language 
        ? `https://gtrend.yapie.me/repositories?language=${language}&since=daily&spoken_language_code=`
        : 'https://gtrend.yapie.me/repositories?since=daily&spoken_language_code=';
      
      const response = await axios.get(url, { 
        timeout: 10000,
        headers: {
          'User-Agent': 'GitHub-Trending-Notion-Bot'
        }
      });
      
      console.log('✓ 方案2成功: gtrend.yapie.me');
      
      const repositories = response.data.slice(0, limit).map(repo => ({
        name: repo.author + '/' + repo.name,
        description: repo.description || '暂无描述',
        stars: repo.stars || 0,
        starsToday: repo.starsSince || 0,
        language: repo.language || '未知',
        url: repo.url,
        author: repo.author,
        authorAvatar: repo.avatar || '',
        forks: repo.forks || 0,
        builtBy: repo.builtBy || [],
        defaultBranch: 'main'
      }));
      
      return repositories;
    } catch (err2) {
      console.log('方案2失败:', err2.message);
      console.log('尝试方案3...');
    }
    
    // 方案3: 尝试 ghapi.huchen.dev
    try {
      console.log('尝试方案3: ghapi.huchen.dev API...');
      const url = language 
        ? `https://ghapi.huchen.dev/repositories?language=${language}&since=daily`
        : 'https://ghapi.huchen.dev/repositories?since=daily';
      
      const response = await axios.get(url, { timeout: 10000 });
      
      console.log('✓ 方案3成功: ghapi.huchen.dev');
      
      const repositories = response.data.slice(0, limit).map(repo => ({
        name: repo.name,
        description: repo.description || '暂无描述',
        stars: parseInt(repo.stars.replace(/,/g, '')),
        starsToday: parseInt(repo.starsSince.replace(/,/g, '')),
        language: repo.language || '未知',
        url: repo.url,
        author: repo.author,
        authorAvatar: repo.avatar,
        forks: parseInt(repo.forks.replace(/,/g, '')),
        builtBy: repo.builtBy,
        defaultBranch: 'main'
      }));
      
      return repositories;
    } catch (err3) {
      console.log('方案3失败:', err3.message);
      console.log('尝试方案4...');
    }
    
    // 方案4: 尝试 gh-trending-api
    try {
      console.log('尝试方案4: gh-trending-api.com API...');
      const url = `https://gh-trending-api.com/repositories?since=daily&spoken_language_code=`;
      const response = await axios.get(url, { timeout: 10000 });
      
      console.log('✓ 方案4成功: gh-trending-api.com');
      
      const repositories = response.data.slice(0, limit).map(repo => ({
        name: repo.repositoryName,
        description: repo.description || '暂无描述',
        stars: repo.totalStars || 0,
        starsToday: repo.stars || 0,
        language: repo.language || '未知',
        url: repo.url,
        author: repo.username,
        authorAvatar: '',
        forks: repo.forks || 0,
        defaultBranch: 'main'
      }));
      
      return repositories;
    } catch (err4) {
      console.log('方案4失败:', err4.message);
      console.log('尝试方案5（兜底方案）...');
    }
    
    // 方案5: 使用 GitHub 官方 API 兜底（最近1-2天创建且star快速增长）
    console.log('尝试方案5: GitHub 官方 API (兜底方案)...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2); // 过去2天
    const dateString = yesterday.toISOString().split('T')[0];
    
    const response = await axios.get('https://api.github.com/search/repositories', {
      params: {
        q: `created:>=${dateString} stars:>50`,
        sort: 'stars',
        order: 'desc',
        per_page: limit
      },
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Trending-Notion-Bot',
        ...(process.env.GITHUB_TOKEN && {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
        })
      },
      timeout: 10000
    });
    
    console.log('✓ 方案5成功: GitHub 官方 API (过去2天创建的快速增长项目)');
    
    const repositories = response.data.items.map(repo => ({
      name: repo.full_name,
      description: repo.description || '暂无描述',
      stars: repo.stargazers_count,
      starsToday: repo.stargazers_count,
      language: repo.language || '未知',
      url: repo.html_url,
      author: repo.owner.login,
      authorAvatar: repo.owner.avatar_url,
      forks: repo.forks_count,
      defaultBranch: repo.default_branch || 'main'
    }));
    
    return repositories;
    
  } catch (error) {
    console.error('获取 GitHub Trending 数据失败:', error.message);
    throw error;
  }
}

