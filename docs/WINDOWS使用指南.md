# Windows 使用指南

专为 Windows 用户准备的简化操作指南。

## 📦 安装

双击运行 `install.bat`

这会自动：
- 安装所有依赖包
- 创建 `.env` 配置文件

## 🧪 测试

双击运行 `test.bat`

查看能否成功获取 GitHub 热门仓库。

## ⚙️ 配置 Notion（可选）

如果你想将数据保存到 Notion：

### 方法 1: 手动配置

1. 用记事本打开 `.env` 文件

2. 获取 Notion API Key：
   - 访问：https://www.notion.so/my-integrations
   - 创建新的 Integration
   - 复制 Token 到 `NOTION_API_KEY=` 后面

3. 创建 Notion 数据库：
   - 在 Notion 中创建一个数据库
   - 添加以下列（字段名必须完全匹配）：
     * 名称 (Title)
     * 一句话简介 (Text)
     * 使用价值 (Text)
     * 用户群体 (Text)
     * Github链接 (URL)
     * 标签分类 (Select)
     * 小红书推广文案 (Text)
     * 公众号推广文案 (Text)
     * 日期 (Date)
   - 连接你的 Integration 到数据库（点击 ... → Connections）
   - 从 URL 复制数据库 ID 到 `NOTION_DATABASE_ID=` 后面

4. 配置 OpenAI（可选，用于生成高质量文案）：
   - 访问：https://platform.openai.com/api-keys
   - 创建 API Key
   - 复制到 `OPENAI_API_KEY=` 后面
   - 如果不配置，会使用默认文案（免费但质量较低）

### 方法 2: 使用脚本（推荐）

双击运行 `setup-notion.bat`，按提示操作。

## 🚀 启动

双击运行 `start.bat`

程序会：
- 立即执行一次数据获取
- 设置定时任务（每天早上 6:00）
- 保持运行状态

**重要**：不要关闭命令行窗口！关闭窗口会停止程序。

## 🔄 后台运行

如果想让程序在后台持续运行，即使关闭命令行窗口也不停止：

### 使用 PM2

1. 打开命令行（PowerShell 或 CMD），运行：
   ```
   npm install -g pm2
   ```

2. 启动程序：
   ```
   pm2 start index.js --name github-trending
   ```

3. 查看状态：
   ```
   pm2 status
   ```

4. 查看日志：
   ```
   pm2 logs github-trending
   ```

5. 停止程序：
   ```
   pm2 stop github-trending
   ```

### 设置开机自启（可选）

```
pm2 startup
pm2 save
```

## 🛠️ 常见问题

### 双击 .bat 文件闪退

右键 → 以管理员身份运行

### 提示"npm 不是内部或外部命令"

需要先安装 Node.js：
1. 访问 https://nodejs.org/
2. 下载并安装 LTS 版本
3. 重启电脑
4. 重新运行 `install.bat`

### GitHub API 请求失败

可能是网络问题或速率限制：
1. 检查网络连接
2. 在 `.env` 中配置 `GITHUB_TOKEN`（参考 README.md）

### Notion 保存失败

检查：
1. `.env` 中的 API Key 和数据库 ID 是否正确
2. Integration 是否已连接到数据库
3. 数据库列名是否与代码中一致

### 如何修改运行时间

1. 用记事本打开 `index.js`
2. 找到这一行：
   ```javascript
   cron.schedule('0 6 * * *', async () => {
   ```
3. 修改 `'0 6 * * *'`：
   - `0 8 * * *` = 每天 8:00
   - `0 */4 * * *` = 每 4 小时
   - `0 9,18 * * *` = 每天 9:00 和 18:00
4. 保存文件
5. 重新运行 `start.bat`

## 📝 使用流程总结

```
1. 双击 install.bat （安装）
   ↓
2. 双击 test.bat （测试）
   ↓
3. 编辑 .env （配置 Notion，可选）
   ↓
4. 双击 start.bat （启动）
   ↓
5. 查看结果！
```

## 💡 小贴士

- 程序运行时会在控制台显示日志
- 第一次运行会立即执行一次
- 之后每天早上 6 点自动执行
- 数据会保存到 Notion（如果配置了）
- 可以随时查看 Notion 数据库中的历史记录

## 🆘 需要帮助？

查看详细文档：
- [README.md](README.md) - 完整文档
- [QUICKSTART.md](QUICKSTART.md) - 快速入门

祝使用愉快！ 🎉

