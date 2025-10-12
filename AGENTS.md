# GitHub Trending Notion 项目规则

## 项目概述
这是一个自动获取 GitHub 热门仓库并保存到 Notion 的自动化工具。

## 技术栈
- Node.js (ES Modules)
- Axios (HTTP 客户端)
- Notion API
- GitHub API
- OpenAI/DeepSeek API

## 代码规范
- 使用 ES6+ 语法
- 优先使用 async/await
- 所有异步函数都要有错误处理
- 函数需要 JSDoc 注释
- 导出的函数名使用驼峰命名

## 文件结构
- `index.js`: 主入口，定时任务
- `fetch-once.js`: 单次执行脚本
- `src/githubService.js`: GitHub API 相关
- `src/notionService.js`: Notion API 相关
- `src/aiService.js`: AI 内容生成相关

## 环境变量
所有敏感信息都通过 .env 文件配置，不要硬编码 API keys。

## 错误处理
- 网络请求要有超时设置
- API 调用要有重试机制或降级方案
- 失败时要有清晰的错误日志

