import dotenv from 'dotenv';
import { fetchGithubTrending, fetchGithubTrendingAlternative } from './src/githubService.js';
import { getExistingRepositories, filterNewRepositories } from './src/notionService.js';

// 加载环境变量
dotenv.config();

/**
 * 测试脚本：仅获取并显示 GitHub 热门仓库，不保存到 Notion
 */
async function test() {
  console.log('=== 测试 GitHub API ===\n');
  
  try {
    console.log('方法 1: 使用 GitHub Search API (搜索过去7天活跃的高star仓库)');
    const repos1 = await fetchGithubTrending(10);
    console.log(`✓ 成功获取 ${repos1.length} 个仓库\n`);
    
    repos1.forEach((repo, index) => {
      console.log(`${index + 1}. ${repo.name}`);
      console.log(`   ⭐ ${repo.stars} | 🍴 ${repo.forks} | 💬 ${repo.language}`);
      console.log(`   ${repo.description}`);
      console.log(`   🔗 ${repo.url}\n`);
    });
    
  } catch (error) {
    console.error('方法 1 失败:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  try {
    console.log('方法 2: 使用 GitHub Trending API (自动选择最佳数据源)');
    const repos2 = await fetchGithubTrendingAlternative(10);
    console.log(`✓ 成功获取 ${repos2.length} 个热榜仓库\n`);
    
    repos2.forEach((repo, index) => {
      console.log(`${index + 1}. ${repo.name}`);
      console.log(`   ⭐ ${repo.stars} (今日 +${repo.starsToday}) | 🍴 ${repo.forks} | 💬 ${repo.language}`);
      console.log(`   ${repo.description}`);
      console.log(`   🔗 ${repo.url}\n`);
    });
    
  } catch (error) {
    console.error('方法 2 失败:', error.message);
  }
  
  // 测试去重功能（如果配置了 Notion）
  if (process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID) {
    console.log('\n' + '='.repeat(60) + '\n');
    
    try {
      console.log('测试去重功能: 检查 Notion 数据库中的重复数据\n');
      
      // 获取25个热榜仓库
      const allRepos = await fetchGithubTrendingAlternative(25);
      console.log(`✓ 获取了 ${allRepos.length} 个热榜仓库\n`);
      
      // 过滤重复的
      const newRepos = await filterNewRepositories(allRepos);
      
      if (newRepos.length < allRepos.length) {
        console.log('已过滤的重复仓库:');
        const existingRepos = await getExistingRepositories();
        allRepos.forEach((repo, index) => {
          if (existingRepos.has(repo.name)) {
            console.log(`  ✗ ${repo.name} (已存在)`);
          }
        });
      }
      
      console.log('\n新仓库列表（前10个）:');
      newRepos.slice(0, 10).forEach((repo, index) => {
        console.log(`${index + 1}. ${repo.name}`);
        console.log(`   ⭐ ${repo.stars} (今日 +${repo.starsToday})`);
        console.log(`   ${repo.url}\n`);
      });
      
    } catch (error) {
      console.error('去重测试失败:', error.message);
      console.log('提示: 如果是第一次运行或 Notion 未配置，这是正常的');
    }
  } else {
    console.log('\n⚠️  未配置 Notion，跳过去重测试');
  }
}

test();

