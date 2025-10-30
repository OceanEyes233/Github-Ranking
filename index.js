import cron from 'node-cron';
import { main } from './src/main.js';

// 立即执行一次（用于测试）
console.log('=== GitHub 热门仓库追踪器启动 ===\n');
await main({
  fetchCount: 100,  // 获取 100 个热门仓库
  processCount: 20  // 处理最多 20 个新仓库
});

// 设置定时任务：每天早上 6:00 运行
// cron 表达式: 分 时 日 月 周
// '0 6 * * *' 表示每天 6:00
cron.schedule('0 6 * * *', async () => {
  console.log('\n=== 定时任务触发 ===');
  await main({
    fetchCount: 100,
    processCount: 20
  });
}, {
  timezone: 'Asia/Shanghai' // 设置时区为中国时区
});

console.log('定时任务已设置: 每天早上 6:00 (北京时间) 运行');
console.log('脚本将保持运行状态...\n');

