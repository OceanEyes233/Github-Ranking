import dotenv from 'dotenv';
import { fetchGithubTrendingAlternative, enrichRepositoriesWithReadme } from './src/githubService.js';
import { enrichRepositoriesWithMarketing } from './src/aiService.js';
import { saveToNotion, filterNewRepositories } from './src/notionService.js';

// 加载环境变量
dotenv.config();

/**
 * 单次执行脚本（用于 GitHub Actions 或手动运行）
 */
async function fetchOnce() {
  try {
    console.log('开始获取 GitHub 热门仓库...');
    console.log('时间:', new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
    console.log('');
    
    // 步骤 1: 获取 GitHub 今日热榜 (Trending)
    // 获取更多数据以便过滤后仍有足够的记录
    let allRepositories = await fetchGithubTrendingAlternative(25);
    console.log(`✓ 成功获取 ${allRepositories.length} 个热门仓库\n`);
    
    // 步骤 2: 过滤掉已存在的仓库（如果配置了 Notion）
    let repositories = allRepositories;
    if (process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID) {
      repositories = await filterNewRepositories(allRepositories);
      
      // 如果过滤后不足10条，就保留所有新仓库
      if (repositories.length < 10) {
        console.log(`⚠️  新仓库不足10个，将处理所有 ${repositories.length} 个新仓库`);
      } else {
        // 只取前10个
        repositories = repositories.slice(0, 10);
        console.log(`📝 选取前 10 个新仓库进行处理\n`);
      }
    } else {
      // 如果没有配置 Notion，直接取前10个
      repositories = repositories.slice(0, 10);
    }
    
    if (repositories.length === 0) {
      console.log('✅ 今日热榜的所有仓库都已存在，无需处理新数据');
      process.exit(0);
    }
    
    // 步骤 3: 获取每个仓库的 README 内容
    const reposWithReadme = await enrichRepositoriesWithReadme(repositories);
    
    // 步骤 4: 使用 AI 生成营销内容（基于 README 深度分析）
    const enrichedRepositories = await enrichRepositoriesWithMarketing(reposWithReadme);
    
    // 显示仓库列表
    console.log('热门仓库列表:');
    enrichedRepositories.forEach((repo, index) => {
      console.log(`\n${index + 1}. ${repo.name}`);
      console.log(`   一句话简介: ${repo.oneLiner}`);
      console.log(`   ⭐ ${repo.stars} | 🍴 ${repo.forks} | 💬 ${repo.language}`);
      console.log(`   用户群体: ${repo.audience}`);
      console.log(`   标签: ${repo.tags}`);
      console.log(`   ${repo.url}`);
    });
    
    // 保存到 Notion（如果配置了）
    if (process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID) {
      console.log('\n正在保存到 Notion 数据库...');
      await saveToNotion(enrichedRepositories);
      console.log('✓ 已成功保存到 Notion 数据库');
    } else {
      console.log('\n⚠ 未配置 Notion，跳过保存');
    }
    
    console.log('\n任务执行完成!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fetchOnce();

