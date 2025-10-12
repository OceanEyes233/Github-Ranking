# GitHub Actions 部署指南

使用 GitHub Actions 可以**完全免费**地让脚本每天自动运行，无需本地电脑或服务器！

## 🎯 优势

- ✅ 完全免费
- ✅ 无需保持电脑开机
- ✅ 自动运行，无需维护
- ✅ 可以手动触发
- ✅ 有运行日志

## 📋 部署步骤

### 1. 将项目推送到 GitHub

```bash
# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 创建 GitHub 仓库后，添加远程仓库
git remote add origin https://github.com/你的用户名/仓库名.git

# 推送到 GitHub
git push -u origin main
```

### 2. 配置 GitHub Secrets

在 GitHub 仓库页面：

1. 点击 `Settings` （设置）
2. 在左侧菜单点击 `Secrets and variables` → `Actions`
3. 点击 `New repository secret` 添加以下密钥：

#### 需要添加的 Secrets:

| Secret 名称 | 值 | 必需？ |
|------------|-----|--------|
| `GH_TOKEN` | GitHub Personal Access Token | 可选（推荐） |
| `NOTION_API_KEY` | Notion Integration Token | 必需 |
| `NOTION_DATABASE_ID` | Notion 数据库 ID | 必需 |

### 3. 获取各个 Token

#### GitHub Token (GH_TOKEN)

1. 访问 https://github.com/settings/tokens
2. 点击 `Generate new token` → `Generate new token (classic)`
3. 勾选权限：
   - `public_repo` （访问公共仓库）
4. 点击 `Generate token`
5. 复制 token，添加到 GitHub Secrets

**注意**：这个 token 是用来调用 GitHub API 获取热门仓库的，不是仓库的访问权限。

#### Notion API Key

1. 访问 https://www.notion.so/my-integrations
2. 点击 `+ New integration`
3. 填写名称，创建
4. 复制 `Internal Integration Token`
5. 添加到 GitHub Secrets

#### Notion Database ID

1. 在 Notion 中创建数据库（参考主 README）
2. 连接你的 Integration 到数据库：
   - 打开数据库页面
   - 点击右上角 `...` → `Connections`
   - 选择你的 Integration
3. 从 URL 获取数据库 ID：
   ```
   https://www.notion.so/workspace/DATABASE_ID?v=...
                                   ^^^^^^^^^^^
   ```
4. 添加到 GitHub Secrets

### 4. 启用 GitHub Actions

1. 推送代码后，访问仓库的 `Actions` 标签
2. 如果看到提示，点击 `I understand my workflows, go ahead and enable them`
3. 你应该能看到工作流：`每日获取 GitHub 热门仓库`

### 5. 测试运行

**手动触发测试**：

1. 在 `Actions` 标签页
2. 点击左侧的 `每日获取 GitHub 热门仓库`
3. 点击右侧的 `Run workflow` 按钮
4. 点击绿色的 `Run workflow` 确认
5. 等待几秒，刷新页面
6. 点击新出现的运行记录查看日志

如果成功，你应该能看到：
- ✓ 成功获取仓库列表
- ✓ 保存到 Notion 数据库

### 6. 验证定时任务

工作流会在每天 **北京时间早上 6:00** 自动运行。

**查看下次运行时间**：
- 在工作流页面可以看到 cron 表达式
- `0 22 * * *` 表示 UTC 22:00（北京时间早上 6:00）

## 📝 工作流配置说明

### 文件位置
```
.github/workflows/daily-fetch.yml
```

### 触发方式

```yaml
on:
  schedule:
    - cron: '0 22 * * *'  # 每天 UTC 22:00（北京时间 6:00）
  workflow_dispatch:      # 允许手动触发
```

### 修改运行时间

编辑 `.github/workflows/daily-fetch.yml`：

```yaml
schedule:
  - cron: '0 14 * * *'  # UTC 14:00 = 北京时间 22:00
```

**常用时间对照表**（UTC → 北京时间）：

| UTC | 北京时间 | Cron 表达式 |
|-----|---------|------------|
| 22:00 | 06:00 | `0 22 * * *` |
| 00:00 | 08:00 | `0 0 * * *` |
| 02:00 | 10:00 | `0 2 * * *` |
| 06:00 | 14:00 | `0 6 * * *` |
| 10:00 | 18:00 | `0 10 * * *` |
| 14:00 | 22:00 | `0 14 * * *` |

**提示**：北京时间 = UTC + 8小时

## 🔍 查看运行日志

1. 访问仓库的 `Actions` 标签
2. 点击任意运行记录
3. 点击 `fetch-and-save` 作业
4. 展开各个步骤查看详细日志

## ❗ 常见问题

### 工作流没有自动运行

**可能原因**：

1. **仓库不活跃**
   - GitHub 会暂停不活跃仓库的定时任务
   - 解决：手动触发一次或提交代码

2. **默认分支不是 main**
   - 工作流需要在默认分支
   - 解决：检查仓库设置

3. **Actions 未启用**
   - 解决：在 `Settings` → `Actions` → `General` 中启用

### Secret 配置错误

错误信息：`Unauthorized` 或 `Could not find database`

**检查**：
1. Secret 名称拼写是否正确（区分大小写）
2. Token 是否有效
3. Notion Integration 是否已连接到数据库

### API 速率限制

错误信息：`API rate limit exceeded`

**解决**：
1. 确保配置了 `GH_TOKEN`
2. 减少运行频率
3. 使用备用 API（修改代码使用 `fetchGithubTrendingAlternative`）

### 时区问题

如果运行时间不对：
- 记住 GitHub Actions 使用 UTC 时间
- 北京时间 = UTC + 8
- 使用在线工具转换：https://www.timeanddate.com/worldclock/converter.html

## 🔄 更新工作流

修改代码后：

```bash
git add .
git commit -m "更新工作流配置"
git push
```

GitHub Actions 会自动使用最新的代码。

## 📊 监控运行状态

### 启用邮件通知

GitHub 会在工作流失败时自动发送邮件通知。

**配置**：
1. `Settings` → `Notifications`
2. 确保勾选了 `Actions`

### 添加状态徽章

在 README.md 中添加：

```markdown
![GitHub Actions](https://github.com/你的用户名/仓库名/workflows/每日获取%20GitHub%20热门仓库/badge.svg)
```

显示效果：![Status Badge](https://img.shields.io/badge/build-passing-brightgreen)

## 💡 高级用法

### 运行多次

每天运行两次（早上和晚上）：

```yaml
schedule:
  - cron: '0 22 * * *'  # 北京时间早上 6:00
  - cron: '0 10 * * *'  # 北京时间晚上 18:00
```

### 只在工作日运行

```yaml
schedule:
  - cron: '0 22 * * 1-5'  # 周一到周五
```

### 保存结果到仓库

修改工作流，添加步骤：

```yaml
- name: 保存结果
  run: |
    mkdir -p results
    echo "$(date): 任务完成" >> results/history.txt
    git config user.name github-actions
    git config user.email github-actions@github.com
    git add results/
    git commit -m "保存运行结果 $(date)"
    git push
```

## 🎉 总结

使用 GitHub Actions，你可以：
- ✅ 零成本运行脚本
- ✅ 无需维护服务器
- ✅ 自动化收集数据
- ✅ 随时查看历史记录

完美适合个人项目和学习用途！

## 🆘 需要帮助？

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Cron 表达式生成器](https://crontab.guru/)
- 查看项目 Issues

---

**上一步**: [README.md](README.md)
**下一步**: 开始使用！🚀


