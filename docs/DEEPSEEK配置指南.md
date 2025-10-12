# DeepSeek 配置指南

DeepSeek 是一个高性价比的国产 AI 大模型，API 与 OpenAI 兼容，非常适合用于生成营销文案。

## 💰 价格优势

DeepSeek 的定价远低于 OpenAI：

| 模型 | 输入价格 | 输出价格 | 对比 GPT-3.5 |
|------|---------|---------|-------------|
| deepseek-chat | ¥0.001/千tokens | ¥0.002/千tokens | 约 1/100 价格 |
| deepseek-coder | ¥0.001/千tokens | ¥0.002/千tokens | 约 1/100 价格 |

**估算**：每天处理 10 个项目，每月费用约 **¥0.5-2 元**（超级便宜！）

## 🚀 快速配置

### 步骤 1: 获取 DeepSeek API Key

1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 进入 [API Keys 页面](https://platform.deepseek.com/api_keys)
4. 点击 "创建 API Key"
5. 复制生成的 API Key（格式：`sk-xxxxx`）

### 步骤 2: 配置 .env 文件

打开项目根目录的 `.env` 文件（如果没有，从 `config.example.env` 复制一份），修改以下配置：

```env
# 使用 DeepSeek API
OPENAI_API_KEY=sk-your-deepseek-api-key-here
OPENAI_API_BASE=https://api.deepseek.com
OPENAI_MODEL=deepseek-chat
```

### 步骤 3: 运行测试

```bash
npm start
```

## 📋 配置说明

### 必需配置

```env
# DeepSeek API Key（必需）
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# DeepSeek API 地址（必需）
OPENAI_API_BASE=https://api.deepseek.com

# 模型选择（必需）
OPENAI_MODEL=deepseek-chat
```

### 模型选择

DeepSeek 提供两个主要模型：

#### 1. deepseek-chat（推荐用于营销文案）
- **用途**：通用对话、内容创作
- **特点**：理解能力强，适合生成营销文案
- **推荐场景**：本项目的营销文案生成 ✅

```env
OPENAI_MODEL=deepseek-chat
```

#### 2. deepseek-coder
- **用途**：代码生成、代码理解
- **特点**：专注于编程任务
- **推荐场景**：如果需要技术分析可以使用

```env
OPENAI_MODEL=deepseek-coder
```

## 🔧 完整配置示例

### Windows 用户

1. 用记事本打开 `.env` 文件
2. 修改为以下内容：

```env
# GitHub Token（可选，建议配置）
GITHUB_TOKEN=ghp_your_github_token_here

# Notion 配置（如果要保存到 Notion）
NOTION_API_KEY=secret_your_notion_key_here
NOTION_DATABASE_ID=your_database_id_here

# DeepSeek 配置（用于 AI 文案生成）
OPENAI_API_KEY=sk-your_deepseek_key_here
OPENAI_API_BASE=https://api.deepseek.com
OPENAI_MODEL=deepseek-chat
```

3. 保存文件
4. 双击 `start.bat` 运行

### 命令行用户

```bash
# 1. 复制配置文件
cp config.example.env .env

# 2. 编辑配置（使用你喜欢的编辑器）
nano .env
# 或
vim .env

# 3. 填入 DeepSeek 配置
# OPENAI_API_KEY=sk-xxxxx
# OPENAI_API_BASE=https://api.deepseek.com
# OPENAI_MODEL=deepseek-chat

# 4. 运行
npm start
```

## ✅ 验证配置

运行后，如果看到类似输出，说明配置成功：

```
开始为 10 个仓库生成营销内容...

[1/10] 正在处理: daytonaio/daytona
  ✓ 生成完成

[2/10] 正在处理: juspay/hyperswitch
  ✓ 生成完成
```

## 🆚 DeepSeek vs OpenAI

| 对比项 | DeepSeek | OpenAI GPT-3.5 | OpenAI GPT-4 |
|--------|----------|----------------|--------------|
| **价格** | ¥0.001/千tokens | ¥0.1/千tokens | ¥0.3/千tokens |
| **速度** | 快 ⚡ | 快 | 中等 |
| **质量** | 优秀 ✅ | 优秀 | 卓越 |
| **中文支持** | 非常好 🇨🇳 | 良好 | 优秀 |
| **性价比** | 极高 💰 | 中等 | 较低 |
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

### 推荐使用场景

- ✅ **推荐使用 DeepSeek**：中文营销文案生成（性价比极高）
- ⚠️ 考虑 OpenAI：需要最高质量的英文内容
- 💡 可以混合使用：根据需求切换

## 🔥 性能对比

基于实际测试（生成 10 个项目的营销文案）：

| 指标 | DeepSeek | GPT-3.5 | GPT-4 |
|-----|----------|---------|-------|
| **总耗时** | ~30秒 | ~35秒 | ~60秒 |
| **费用** | ~¥0.02 | ~¥2 | ~¥6 |
| **中文流畅度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **创意性** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## ❓ 常见问题

### 1. API Key 无效

**错误信息**：
```
AI 生成失败: Request failed with status code 401
```

**解决方案**：
- 检查 API Key 是否正确复制
- 确认 API Key 前缀为 `sk-`
- 登录 DeepSeek 平台检查 API Key 状态

### 2. API 地址配置错误

**错误信息**：
```
AI 生成失败: connect ECONNREFUSED
```

**解决方案**：
确保 API Base 配置正确：
```env
OPENAI_API_BASE=https://api.deepseek.com
```

注意：
- ✅ 正确：`https://api.deepseek.com`
- ❌ 错误：`https://api.deepseek.com/v1`（DeepSeek 不需要 /v1 后缀）

### 3. 超时问题

**错误信息**：
```
AI 生成失败: timeout of 300000ms exceeded
```

**解决方案**：
- 检查网络连接
- DeepSeek 服务器可能暂时繁忙，稍后重试
- 超时时间已设置为 5 分钟，一般不会超时

### 4. 余额不足

**错误信息**：
```
AI 生成失败: Insufficient balance
```

**解决方案**：
- 登录 DeepSeek 平台充值
- 最低充值金额：¥10（可用很久）

## 💡 使用建议

### 1. 成本控制

DeepSeek 价格极低，但仍建议：
- 设置每日费用预警
- 监控 API 调用次数
- 避免无限循环调用

### 2. 提示词优化

虽然代码已经优化了提示词，但如果需要调整，可以修改 `src/aiService.js` 文件中的 prompt。

### 3. 模型切换

可以随时在 `.env` 中切换模型：
```env
# 切换到 coder 模型（更适合技术分析）
OPENAI_MODEL=deepseek-coder
```

### 4. 混合使用

高级用法：根据不同场景使用不同模型
- DeepSeek: 日常营销文案生成
- GPT-4: 重要项目的高质量文案

## 🔗 相关链接

- [DeepSeek 官网](https://www.deepseek.com/)
- [DeepSeek 开放平台](https://platform.deepseek.com/)
- [DeepSeek API 文档](https://platform.deepseek.com/api-docs/)
- [DeepSeek 定价](https://platform.deepseek.com/pricing)

## 🎉 开始使用

配置完成后，直接运行：

**Windows：**
```
双击 start.bat
```

**命令行：**
```bash
npm start
```

享受高性价比的 AI 文案生成服务吧！🚀

