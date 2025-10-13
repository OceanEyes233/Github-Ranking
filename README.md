# GitHub 热门仓库追踪器

[![Made with Cursor](https://img.shields.io/badge/Made%20with-Cursor-blue?style=flat&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMiAxMkwxMiAyMkwyMiAxMkwxMiAyWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4=)](https://cursor.com)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

每天自动获取 GitHub 热门仓库并保存到 Notion 数据库。

> 🤖 本项目完全使用 [Cursor](https://cursor.com) AI 编辑器开发

## 功能特点

- ✨ 自动获取 GitHub 过去一天的热门仓库 Top 10
- 🤖 AI 自动生成营销推广文案（一句话简介、使用价值、用户群体、小红书/公众号文案等）
- 📊 将数据保存到 Notion 数据库
- ⏰ 定时任务：每天早上 6:00 自动运行
- 🌏 支持中国时区（Asia/Shanghai）
- 🎯 支持 OpenAI API 或使用默认文案

## 安装

```bash
npm install
```

## 配置

### 1. 创建环境变量文件

复制 `.env.example` 为 `.env`:

```bash
cp .env.example .env
```

### 2. 配置 GitHub Token（可选但推荐）

1. 访问 [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 勾选 `public_repo` 权限
4. 生成 token 并复制到 `.env` 文件的 `GITHUB_TOKEN`

> 💡 配置 GitHub Token 可以提高 API 速率限制（从 60/小时 提升到 5000/小时）

### 3. 配置 AI API（可选，用于生成营销文案）

如果你想使用 AI 自动生成营销文案（一句话简介、使用价值、用户群体、小红书/公众号推广文案等）：

#### 方案 A：使用 DeepSeek（推荐，超高性价比 💰）

1. 访问 [DeepSeek API Keys](https://platform.deepseek.com/api_keys)
2. 注册并创建 API Key
3. 在 `.env` 文件中配置：
   ```env
   OPENAI_API_KEY=sk-your-deepseek-key
   OPENAI_API_BASE=https://api.deepseek.com
   OPENAI_MODEL=deepseek-chat
   ```

**价格**：约 ¥0.02/天，每月不到 1 元！🎉

**详细说明**：查看 [DEEPSEEK配置指南.md](docs/DEEPSEEK配置指南.md)

#### 方案 B：使用 OpenAI

1. 访问 [OpenAI API Keys](https://platform.openai.com/api-keys)
2. 登录并创建 API Key
3. 复制 API Key 到 `.env` 文件的 `OPENAI_API_KEY`

**价格**：约 $0.02/天（使用 gpt-3.5-turbo）

---

如果不配置，脚本会使用默认的文案模板（免费但质量较低）。

**更多说明**：
- [DeepSeek 配置指南](docs/DEEPSEEK配置指南.md) ⭐ 推荐
- [营销文案生成说明](docs/营销文案生成说明.md)

### 4. 配置 Notion（如果需要保存到 Notion）

#### 步骤 1: 创建 Notion Integration

1. 访问 [Notion Integrations](https://www.notion.so/my-integrations)
2. 点击 "+ New integration"
3. 填写名称（如 "GitHub Trending Bot"）
4. 选择工作区并创建
5. 复制 "Internal Integration Token" 到 `.env` 文件的 `NOTION_API_KEY`

#### 步骤 2: 创建 Notion 数据库

1. 在 Notion 中创建一个新页面
2. 添加一个数据库（Database - Full page）
3. 创建以下列（字段名必须完全匹配）：
   - **名称** (Title) - 必需
   - **一句话简介** (Text)
   - **使用价值** (Text)
   - **用户群体** (Text)
   - **Github链接** (URL)
   - **标签分类** (Select 或 Multi-select)
   - **小红书推广文案** (Text)
   - **公众号推广文案** (Text)
   - **日期** (Date) - 必需

> 💡 **注意**：如果你的"标签分类"字段是 Multi-select（多选），需要修改 `src/notionService.js` 第 95-108 行的代码。详见 [营销文案生成说明.md](营销文案生成说明.md)

#### 步骤 3: 连接 Integration 到数据库

1. 打开数据库页面
2. 点击右上角 "..." → "Connections"
3. 选择你刚创建的 Integration

#### 步骤 4: 获取数据库 ID

从数据库 URL 中获取 ID：
```
https://www.notion.so/workspace/DATABASE_ID?v=...
                              ^^^^^^^^^^^
```

将 `DATABASE_ID` 复制到 `.env` 文件的 `NOTION_DATABASE_ID`

<!-- ## 运行

### 测试 GitHub API（推荐先运行测试）

在配置 Notion 之前，可以先测试 GitHub API 是否正常工作：

```bash
npm test
```

这将显示两种方法获取的热门仓库列表，不会保存到 Notion。 -->

### 设置 Notion 数据库（可选的辅助脚本）

如果你想通过脚本自动创建 Notion 数据库：

```bash
npm run setup
```

按照提示输入 Notion 页面 ID，脚本会自动创建数据库并返回数据库 ID。

### 开发模式（立即运行一次并启动定时任务）

```bash
npm start
```

### 使用 PM2 持久化运行（推荐生产环境）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start index.js --name github-trending

# 查看日志
pm2 logs github-trending

# 停止应用
pm2 stop github-trending

# 设置开机自启
pm2 startup
pm2 save
```

## 定时任务说明

脚本使用 `node-cron` 实现定时任务：

- 定时表达式: `0 6 * * *`
- 运行时间: 每天早上 6:00（北京时间）
- 时区: Asia/Shanghai

如需修改运行时间，编辑 `index.js` 中的 cron 表达式：

```javascript
cron.schedule('0 6 * * *', async () => {
  // 分 时 日 月 周
  // 0  6  *  *  *  = 每天 6:00
});
```

常用的 cron 表达式示例：
- `0 6 * * *` - 每天 6:00
- `0 */6 * * *` - 每 6 小时
- `0 9,18 * * *` - 每天 9:00 和 18:00
- `0 6 * * 1-5` - 周一到周五 6:00

## 项目结构

```
.
├── index.js                  # 主入口文件
├── src/
│   ├── githubService.js      # GitHub API 服务
│   └── notionService.js      # Notion API 服务
├── package.json              # 依赖配置
├── .env.example              # 环境变量示例
├── .gitignore               # Git 忽略文件
└── README.md                # 说明文档
```

## 疑难解答

### GitHub API 速率限制

如果遇到 "API rate limit exceeded" 错误：
1. 配置 `GITHUB_TOKEN` 以获得更高的速率限制
2. 或者减少运行频率

### Notion API 错误

常见错误：
- `Could not find database`: 检查 `NOTION_DATABASE_ID` 是否正确
- `Unauthorized`: 检查 `NOTION_API_KEY` 是否正确
- `validation_error`: 确保数据库结构符合要求，且 Integration 已连接到数据库

### 时区问题

脚本默认使用 `Asia/Shanghai` 时区。如需更改：

```javascript
cron.schedule('0 6 * * *', async () => {
  // ...
}, {
  timezone: 'America/New_York' // 更改为你的时区
});
```

## 数据获取方案

`src/githubService.js` 提供了两种获取数据的方法：

1. **默认方法**（当前使用）: `fetchGithubTrendingAlternative` - 使用第三方 Trending API，自动尝试多个数据源
2. **备用方法**: `fetchGithubTrending` - 使用 GitHub 官方 Search API

当前配置使用默认方法（第三方 API），因为它更稳定且不受 GitHub API 速率限制影响。

如需切换到官方 API，修改 `index.js` 和 `fetch-once.js`:

```javascript
// 替换
import { fetchGithubTrendingAlternative, enrichRepositoriesWithReadme } from './src/githubService.js';
const repositories = await fetchGithubTrendingAlternative(10);

// 为
import { fetchGithubTrending, enrichRepositoriesWithReadme } from './src/githubService.js';
const repositories = await fetchGithubTrending(10);
```

## License

MIT

