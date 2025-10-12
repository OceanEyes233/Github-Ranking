# DeepSeek 快速配置（1 分钟搞定）

## 🚀 三步配置

### 第 1 步：获取 DeepSeek API Key（30 秒）

1. 打开 [DeepSeek 开放平台](https://platform.deepseek.com/api_keys)
2. 注册/登录
3. 点击 "创建 API Key"
4. 复制生成的 Key（格式：`sk-xxxxxxxxxxxx`）

### 第 2 步：配置 .env 文件（20 秒）

用记事本打开项目根目录的 `.env` 文件（如果没有，从 `config.example.env` 复制），添加：

```env
OPENAI_API_KEY=sk-你的DeepSeek密钥
OPENAI_API_BASE=https://api.deepseek.com
OPENAI_MODEL=deepseek-chat
```

**完整示例：**
```env
# DeepSeek 配置
OPENAI_API_KEY=sk-abc123def456ghi789
OPENAI_API_BASE=https://api.deepseek.com
OPENAI_MODEL=deepseek-chat

# 如果要保存到 Notion，还需要配置：
NOTION_API_KEY=secret_your_notion_key
NOTION_DATABASE_ID=your_database_id
```

### 第 3 步：运行（10 秒）

**Windows 用户：**
双击 `start.bat`

**命令行用户：**
```bash
npm start
```

## ✅ 成功标志

看到类似输出，说明配置成功：

```
开始获取 GitHub 热门仓库...
✓ 成功获取 10 个热门仓库

开始为 10 个仓库生成营销内容...

[1/10] 正在处理: daytonaio/daytona
  ✓ 生成完成

[2/10] 正在处理: juspay/hyperswitch
  ✓ 生成完成
...
```

## 💰 费用说明

- **每天处理 10 个项目**：约 ¥0.02
- **每月费用**：约 ¥0.5-1 元
- **最低充值**：¥10（可用很久）

**对比 OpenAI**：DeepSeek 价格约为 GPT-3.5 的 1/100！

## ❓ 遇到问题？

### 问题 1：API Key 无效

```
AI 生成失败: 401 Unauthorized
```

**解决**：
- 检查 API Key 是否正确复制
- 确保没有多余的空格

### 问题 2：无法连接

```
AI 生成失败: connect ECONNREFUSED
```

**解决**：
- 确认 `OPENAI_API_BASE=https://api.deepseek.com`
- 检查网络连接

### 问题 3：余额不足

```
AI 生成失败: Insufficient balance
```

**解决**：
登录 [DeepSeek 平台](https://platform.deepseek.com/) 充值（最低 ¥10）

## 📝 完整配置模板

将以下内容复制到 `.env` 文件：

```env
# ========== DeepSeek AI 配置 ==========
OPENAI_API_KEY=sk-你的密钥
OPENAI_API_BASE=https://api.deepseek.com
OPENAI_MODEL=deepseek-chat

# ========== Notion 配置（可选）==========
NOTION_API_KEY=secret_你的Notion密钥
NOTION_DATABASE_ID=你的数据库ID

# ========== GitHub Token（可选）==========
GITHUB_TOKEN=ghp_你的GitHub令牌
```

## 🔗 相关文档

- [完整 DeepSeek 配置指南](DEEPSEEK配置指南.md) - 详细说明
- [营销文案生成说明](营销文案生成说明.md) - 了解 AI 功能
- [README](../README.md) - 项目主文档

## 🎉 就这么简单！

配置完成后，开始享受高性价比的 AI 文案生成服务吧！

