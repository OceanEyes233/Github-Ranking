import cron from 'node-cron';
import dotenv from 'dotenv';
import { fetchGithubTrendingAlternative, enrichRepositoriesWithReadme } from './src/githubService.js';
import { enrichRepositoriesWithMarketing } from './src/aiService.js';
import { saveToNotion } from './src/notionService.js';

// 加载环境变量
dotenv.config();

/**
 * 主函数：获取 GitHub 热门仓库并保存到 Notion
 */
async function main() {
  try {
    console.log('开始获取 GitHub 热门仓库...');
    console.log('时间:', new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
    console.log('');
    
    // 步骤 1: 获取 GitHub 今日热榜 (Trending) Top 10
    // 自动尝试多个数据源，确保能够获取到数据
    const repositories = await fetchGithubTrendingAlternative(10);
    console.log(`✓ 成功获取 ${repositories.length} 个热门仓库\n`);
    
    // 步骤 2: 获取每个仓库的 README 内容
    const reposWithReadme = await enrichRepositoriesWithReadme(repositories);
    
    // 步骤 3: 使用 AI 生成营销内容（基于 README 深度分析）
    const enrichedRepositories = await enrichRepositoriesWithMarketing(reposWithReadme);
    
    // 步骤 4: 保存到 Notion
    if (process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID) {
      console.log('正在保存到 Notion 数据库...\n');
      await saveToNotion(enrichedRepositories);
      console.log('\n✓ 已成功保存到 Notion 数据库');
    } else {
      console.log('⚠ 未配置 Notion，跳过保存到 Notion');
      console.log('\n热门仓库列表:');
      enrichedRepositories.forEach((repo, index) => {
        console.log(`\n${index + 1}. ${repo.name}`);
        console.log(`   一句话简介: ${repo.oneLiner}`);
        console.log(`   用户群体: ${repo.audience}`);
        console.log(`   标签: ${repo.tags}`);
        console.log(`   链接: ${repo.url}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('任务执行完成!\n');
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    console.error(error.stack);
  }
}

// 立即执行一次（用于测试）
console.log('=== GitHub 热门仓库追踪器启动 ===\n');
await main();

// 设置定时任务：每天早上 6:00 运行
// cron 表达式: 分 时 日 月 周
// '0 6 * * *' 表示每天 6:00
cron.schedule('0 6 * * *', async () => {
  console.log('\n=== 定时任务触发 ===');
  await main();
}, {
  timezone: 'Asia/Shanghai' // 设置时区为中国时区
});

console.log('定时任务已设置: 每天早上 6:00 (北京时间) 运行');
console.log('脚本将保持运行状态...\n');

