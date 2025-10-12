# 快速开始指南

## 第一步：安装依赖

```bash
npm install
```

## 第二步：测试 GitHub API

不需要任何配置，直接测试：

```bash
npm test
```

这会显示两种方法获取的 GitHub 热门仓库。如果成功，继续下一步。

## 第三步：配置环境变量（可选）

### 只想看数据，不保存到 Notion

如果你只想每天获取数据并在控制台查看，不需要配置任何环境变量！

直接运行：
```bash
npm start
```

### 想保存数据到 Notion

1. **复制配置文件**
   ```bash
   copy config.example.env .env
   ```
   (Linux/Mac 用户使用 `cp config.example.env .env`)

2. **配置 Notion API Key**
   
   - 访问 [Notion Integrations](https://www.notion.so/my-integrations)
   - 点击 "+ New integration"
   - 创建后复制 Token
   - 粘贴到 `.env` 文件的 `NOTION_API_KEY=` 后面

3. **创建并配置数据库**

   **选项 A: 手动创建（推荐）**
   - 在 Notion 中创建一个新的数据库
   - 添加以下列：
     - 名称 (Title)
     - 描述 (Text)
     - ⭐ Stars (Number)
     - 今日新增 (Number)
     - 语言 (Select)
     - URL (URL)
     - 作者 (Text)
     - Forks (Number)
     - 日期 (Date)
   - 点击数据库右上角 "..." → "Connections" → 选择你的 Integration
   - 从 URL 复制数据库 ID 到 `.env` 文件

   **选项 B: 使用脚本创建**
   ```bash
   npm run setup
   ```
   按照提示输入页面 ID，会自动创建数据库

## 第四步：运行

```bash
npm start
```

脚本会：
1. 立即运行一次获取数据
2. 设置定时任务，每天早上 6:00 自动运行

## 持久化运行（生产环境）

使用 PM2 让脚本在后台持续运行：

```bash
# 全局安装 PM2
npm install -g pm2

# 启动
pm2 start index.js --name github-trending

# 查看状态
pm2 status

# 查看日志
pm2 logs github-trending

# 停止
pm2 stop github-trending
```

## 常见问题

### 如何修改运行时间？

编辑 `index.js`，找到：
```javascript
cron.schedule('0 6 * * *', async () => {
```

修改 cron 表达式：
- `0 6 * * *` = 每天 6:00
- `0 */6 * * *` = 每 6 小时
- `0 9,18 * * *` = 每天 9:00 和 18:00

### GitHub API 速率限制？

如果遇到速率限制，在 `.env` 中配置 `GITHUB_TOKEN`：

1. 访问 [GitHub Settings](https://github.com/settings/tokens)
2. 生成一个 Token（勾选 public_repo）
3. 添加到 `.env` 文件

### 如何只运行一次？

创建 `run-once.js`:
```javascript
import { fetchGithubTrending } from './src/githubService.js';
import { saveToNotion } from './src/notionService.js';

const repos = await fetchGithubTrending(10);
await saveToNotion(repos);
console.log('完成!');
```

运行：
```bash
node run-once.js
```

## 下一步

- 查看 [README.md](README.md) 了解更多配置选项
- 修改 `src/githubService.js` 自定义获取逻辑
- 修改 `src/notionService.js` 自定义保存格式

祝你使用愉快！ 🎉


