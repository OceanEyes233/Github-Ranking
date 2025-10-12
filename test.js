import dotenv from 'dotenv';
import { fetchGithubTrending, fetchGithubTrendingAlternative } from './src/githubService.js';

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
}

test();


