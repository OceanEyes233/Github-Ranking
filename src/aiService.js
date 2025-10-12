import axios from 'axios';

/**
 * 使用 OpenAI API 生成营销内容（基于 README 深度分析）
 * @param {Object} repo - 仓库信息（包含 README）
 * @returns {Promise<Object>} 生成的营销内容
 */
export async function generateMarketingContent(repo) {
  const apiKey = process.env.OPENAI_API_KEY;
  const apiBase = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1';
  const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  
  if (!apiKey) {
    console.warn('  ⚠ 未配置 OPENAI_API_KEY，使用默认内容');
    return generateDefaultContent(repo);
  }
  
  try {
    // 构建包含 README 的 prompt
    const readmeSection = repo.hasReadme 
      ? `\nREADME 内容摘要：\n${repo.readme.substring(0, 4000)}\n`
      : '';
    
    const prompt = `你是一位资深的技术产品分析师和营销专家。请深度分析以下 GitHub 开源项目，生成专业的营销内容。

## 项目基本信息
- 仓库名称：${repo.name}
- 简短描述：${repo.description}
- 编程语言：${repo.language}
- Stars 数：${repo.stars}
- Forks 数：${repo.forks}
${readmeSection}

## 分析要求

请按照以下步骤进行深度分析，并以 JSON 格式返回结果：

1. **一句话简介** (oneLiner)
   - 20字以内
   - 高度概括项目的核心价值
   - 让人一眼就懂这是什么

2. **使用价值** (value)
   - 150-200字
   - 基于 README 内容深度分析项目的核心功能
   - 明确指出适合在哪些领域和项目中使用
   - 说明能解决什么具体问题
   - 强调技术优势和实际应用场景
   - 如果没有 README，基于项目名称和描述推断

3. **用户群体** (audience)
   - 50-80字
   - 基于使用价值，精准定位目标用户
   - 特别关注：创业者（技术创业者、产品创业者）和工程开发人员（前端、后端、全栈、AI 工程师等）
   - 说明什么类型的创业者或开发者最需要这个工具
   - 例如："适合构建 SaaS 产品的技术创业者"、"开发 AI 应用的全栈工程师"

4. **标签分类** (tags)
   - 根据使用价值和用户群体，提取 3-5 个关键标签
   - 用逗号分隔，如：AI工具,开发效率,开源框架
   - 标签要便于分类和检索

5. **小红书推广文案** (xiaohongshu)
   - 150-200字
   - 基于使用价值和用户群体，采用小红书的行文风格
   - 轻松活泼，使用适当的 emoji
   - 突出实用性和易用性
   - 分点列举核心功能
   - 加入话题标签（#开发工具 #AI 等）
   - 面向技术创业者和开发者，但语气要亲和

6. **公众号推广文案** (wechat)
   - 200-250字
   - 基于使用价值和用户群体，采用公众号的专业风格
   - 正式严谨，突出技术深度
   - 分析项目的技术价值和商业价值
   - 适合分享给团队或技术社区
   - 强调对创业项目或技术团队的实际帮助

## 返回格式

\`\`\`json
{
  "oneLiner": "项目核心价值的一句话概括",
  "value": "深度分析的使用价值，包含适用领域和场景",
  "audience": "精准的用户群体定位，强调创业者和开发者类型",
  "tags": "标签1,标签2,标签3",
  "xiaohongshu": "小红书风格的推广文案",
  "wechat": "公众号风格的推广文案"
}
\`\`\`

请务必返回有效的 JSON 格式。`;

    const response = await axios.post(
      `${apiBase}/chat/completions`,
      {
        model: model,
        messages: [
          {
            role: 'system',
            content: '你是一位资深的技术产品分析师和营销专家，擅长深度分析开源项目的技术价值和商业价值，并能用不同风格的语言精准触达目标用户群体。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 300000 // 5分钟超时（300秒 = 300,000毫秒）
      }
    );
    
    const content = response.data.choices[0].message.content;
    
    // 尝试解析 JSON 响应
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        oneLiner: result.oneLiner || repo.description.substring(0, 50),
        value: result.value || generateDefaultValue(repo),
        audience: result.audience || generateDefaultAudience(repo),
        tags: result.tags || repo.language || '开发工具',
        xiaohongshu: result.xiaohongshu || generateDefaultXiaohongshu(repo),
        wechat: result.wechat || generateDefaultWechat(repo)
      };
    } else {
      throw new Error('AI 响应格式不正确');
    }
    
  } catch (error) {
    console.error(`AI 生成失败 (${repo.name}):`, error.message);
    console.log('使用默认内容...');
    return generateDefaultContent(repo);
  }
}

/**
 * 生成默认的营销内容（当 AI 不可用时）
 */
function generateDefaultContent(repo) {
  return {
    oneLiner: repo.description.substring(0, 50) || `${repo.language} 项目`,
    value: generateDefaultValue(repo),
    audience: generateDefaultAudience(repo),
    tags: repo.language || '开发工具',
    xiaohongshu: generateDefaultXiaohongshu(repo),
    wechat: generateDefaultWechat(repo)
  };
}

function generateDefaultValue(repo) {
  const lang = repo.language || '多种语言';
  return `这是一个使用 ${lang} 开发的开源项目，目前已获得 ${repo.stars} 个 Stars。${repo.description || '提供了实用的功能和优秀的代码实现。'}适合学习和在项目中使用。`;
}

function generateDefaultAudience(repo) {
  const audiences = {
    'JavaScript': '前端开发者、Node.js 开发者',
    'TypeScript': '前端开发者、全栈工程师',
    'Python': 'Python 开发者、数据科学家',
    'Java': 'Java 开发者、后端工程师',
    'Go': 'Go 开发者、云原生工程师',
    'Rust': 'Rust 开发者、系统程序员',
    'C++': 'C++ 开发者、游戏开发者',
    'Swift': 'iOS 开发者、macOS 开发者',
    'Kotlin': 'Android 开发者、后端工程师'
  };
  return audiences[repo.language] || '软件开发者、技术爱好者';
}

function generateDefaultXiaohongshu(repo) {
  const emojis = ['🔥', '✨', '💡', '🚀', '⭐', '👍'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  return `${emoji} 发现一个超棒的开源项目！\n\n${repo.name}\n${repo.description}\n\n已经有 ${repo.stars} 个 Star 啦！${repo.language ? `使用 ${repo.language} 开发，` : ''}代码质量很高，值得学习和使用～\n\n#GitHub #开源项目 #${repo.language || '编程'}`;
}

function generateDefaultWechat(repo) {
  return `【GitHub 热门项目推荐】\n\n项目名称：${repo.name}\n\n${repo.description}\n\n该项目使用 ${repo.language || '多种技术'} 开发，目前在 GitHub 上已获得 ${repo.stars} 个 Stars 和 ${repo.forks} 个 Forks，是一个活跃且优质的开源项目。\n\n项目特点：代码结构清晰、文档完善、社区活跃。无论是学习还是在实际项目中使用，都是不错的选择。\n\n推荐给对 ${repo.language || '软件开发'} 感兴趣的开发者关注。`;
}

/**
 * 批量生成营销内容（带进度显示和超时控制）
 * @param {Array} repositories - 仓库列表
 * @returns {Promise<Array>} 包含营销内容的仓库列表
 */
export async function enrichRepositoriesWithMarketing(repositories) {
  console.log(`\n开始为 ${repositories.length} 个仓库生成营销内容...\n`);
  
  const enrichedRepos = [];
  
  for (let i = 0; i < repositories.length; i++) {
    const repo = repositories[i];
    console.log(`[${i + 1}/${repositories.length}] 正在处理: ${repo.name}`);
    
    try {
      // 为每个仓库处理添加5分钟超时控制
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('处理超时（5分钟）')), 300000)
      );
      
      const marketingPromise = generateMarketingContent(repo);
      
      const marketing = await Promise.race([marketingPromise, timeoutPromise]);
      
      enrichedRepos.push({
        ...repo,
        ...marketing
      });
      
      console.log(`  ✓ 生成完成\n`);
      
      // 添加延迟以避免 API 速率限制
      if (process.env.OPENAI_API_KEY && i < repositories.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      if (error.message.includes('超时')) {
        console.error(`  ✗ 处理超时: ${error.message}`);
      } else {
        console.error(`  ✗ 处理失败: ${error.message}`);
      }
      // 即使失败也添加默认内容
      enrichedRepos.push({
        ...repo,
        ...generateDefaultContent(repo)
      });
    }
  }
  
  console.log('营销内容生成完成!\n');
  return enrichedRepos;
}
