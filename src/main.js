import dotenv from 'dotenv';
import { fetchGithubTrendingAlternative, enrichRepositoriesWithReadme } from './githubService.js';
import { enrichRepositoriesWithMarketing } from './aiService.js';
import { saveToNotion, filterNewRepositories } from './notionService.js';

// 加载环境变量
dotenv.config();

/**
 * 主函数：获取 GitHub 热门仓库并保存到 Notion
 * @param {Object} options - 配置选项
 * @param {number} options.fetchCount - 获取仓库数量
 * @param {number} options.processCount - 处理新仓库数量
 */
export async function main(options = {}) {
  const {
    fetchCount = 100,
    processCount = 20
  } = options;

  try {
    console.log('开始获取 GitHub 热门仓库...');
    console.log('时间:', new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
    console.log('');

    // 步骤 1: 获取 GitHub 今日热榜 (Trending)
    let allRepositories = await fetchGithubTrendingAlternative(fetchCount);
    console.log(`✓ 成功获取 ${allRepositories.length} 个热门仓库\n`);

    // 步骤 2: 过滤掉已存在的仓库（如果配置了 Notion）
    let repositories = allRepositories;
    if (process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID) {
      repositories = await filterNewRepositories(allRepositories);

      if (repositories.length === 0) {
        console.log('✅ 今日热榜的所有仓库都已存在，无需处理新数据');
        return { success: true, processed: 0 };
      }

      // 如果过滤后不足目标数量，就保留所有新仓库
      if (repositories.length < processCount) {
        console.log(`⚠️  新仓库不足${processCount}个，将处理所有 ${repositories.length} 个新仓库`);
      } else {
        // 只取前 N 个
        repositories = repositories.slice(0, processCount);
        console.log(`📝 选取前 ${processCount} 个新仓库进行处理\n`);
      }
    } else {
      // 如果没有配置 Notion，直接取前 N 个
      repositories = repositories.slice(0, processCount);
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

    // 步骤 5: 保存到 Notion
    if (process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID) {
      console.log('\n正在保存到 Notion 数据库...');
      await saveToNotion(enrichedRepositories);
      console.log('✓ 已成功保存到 Notion 数据库');
    } else {
      console.log('\n⚠ 未配置 Notion，跳过保存');
    }

    console.log('\n' + '='.repeat(60));
    console.log('任务执行完成!\n');

    return { success: true, processed: enrichedRepositories.length };

  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    console.error(error.stack);
    throw error;
  }
}
