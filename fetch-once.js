import { main } from './src/main.js';

/**
 * 单次执行脚本（用于 GitHub Actions 或手动运行）
 */
async function fetchOnce() {
  try {
    await main({
      fetchCount: 25,   // 获取 25 个热门仓库
      processCount: 10  // 处理最多 10 个新仓库
    });
    process.exit(0);
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fetchOnce();

