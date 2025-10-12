import { Client } from '@notionhq/client';

/**
 * 初始化 Notion 客户端
 */
function getNotionClient() {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    throw new Error('NOTION_API_KEY 环境变量未设置');
  }
  return new Client({ auth: apiKey });
}

/**
 * 验证仓库数据是否完整
 * @param {Object} repo - 仓库信息
 * @returns {Object} 验证结果 { valid: boolean, missing: Array<string> }
 */
function validateRepositoryData(repo) {
  const requiredFields = {
    'name': '名称',
    'oneLiner': '一句话简介',
    'value': '使用价值',
    'audience': '用户群体',
    'url': 'Github链接',
    'tags': '标签分类',
    'xiaohongshu': '小红书推广文案',
    'wechat': '公众号推广文案'
  };
  
  const missing = [];
  
  for (const [field, displayName] of Object.entries(requiredFields)) {
    const value = repo[field];
    
    // 检查字段是否存在且不为空
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missing.push(displayName);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing: missing
  };
}

/**
 * 批量验证仓库数据
 * @param {Array} repositories - 仓库列表
 * @returns {Object} 验证报告
 */
function validateAllRepositories(repositories) {
  const report = {
    total: repositories.length,
    valid: 0,
    invalid: 0,
    details: []
  };
  
  repositories.forEach((repo, index) => {
    const validation = validateRepositoryData(repo);
    
    if (validation.valid) {
      report.valid++;
    } else {
      report.invalid++;
      report.details.push({
        index: index + 1,
        name: repo.name || '未知',
        missing: validation.missing
      });
    }
  });
  
  return report;
}

/**
 * 保存仓库数据到 Notion 数据库（带数据完整性验证）
 * @param {Array} repositories - 仓库列表（包含营销内容）
 */
export async function saveToNotion(repositories) {
  const notion = getNotionClient();
  const databaseId = process.env.NOTION_DATABASE_ID;
  
  if (!databaseId) {
    throw new Error('NOTION_DATABASE_ID 环境变量未设置');
  }
  
  // 步骤 1: 验证所有数据
  console.log('📋 开始验证数据完整性...\n');
  const validationReport = validateAllRepositories(repositories);
  
  // 显示验证报告
  console.log(`验证结果：`);
  console.log(`  总数: ${validationReport.total} 条`);
  console.log(`  ✓ 完整: ${validationReport.valid} 条`);
  console.log(`  ✗ 不完整: ${validationReport.invalid} 条\n`);
  
  // 如果有不完整的数据，显示详情
  if (validationReport.invalid > 0) {
    console.log('⚠️  发现不完整的记录：\n');
    validationReport.details.forEach(detail => {
      console.log(`  [${detail.index}] ${detail.name}`);
      console.log(`      缺失字段: ${detail.missing.join(', ')}`);
    });
    console.log('\n❌ 这些记录将被跳过，不会写入 Notion\n');
  }
  
  // 步骤 2: 过滤出完整的记录
  const validRepositories = repositories.filter(repo => {
    const validation = validateRepositoryData(repo);
    return validation.valid;
  });
  
  if (validRepositories.length === 0) {
    console.log('❌ 没有完整的记录可以保存！');
    return;
  }
  
  console.log(`开始保存 ${validRepositories.length} 条完整记录到 Notion...\n`);
  
  const today = new Date().toISOString().split('T')[0];
  let successCount = 0;
  let failCount = 0;
  
  try {
    // 步骤 3: 逐个插入验证通过的数据
    for (const repo of validRepositories) {
      // 构建属性对象
      const properties = {
        '名称': {
          title: [
            {
              text: {
                content: repo.name.substring(0, 100) // Notion title 限制
              }
            }
          ]
        },
        '日期': {
          date: {
            start: today
          }
        }
      };
      
      // 一句话简介
      if (repo.oneLiner) {
        properties['一句话简介'] = {
          rich_text: [
            {
              text: {
                content: repo.oneLiner.substring(0, 2000)
              }
            }
          ]
        };
      }
      
      // 使用价值
      if (repo.value) {
        properties['使用价值'] = {
          rich_text: [
            {
              text: {
                content: repo.value.substring(0, 2000)
              }
            }
          ]
        };
      }
      
      // 用户群体
      if (repo.audience) {
        properties['用户群体'] = {
          rich_text: [
            {
              text: {
                content: repo.audience.substring(0, 2000)
              }
            }
          ]
        };
      }
      
      // Github链接
      if (repo.url) {
        properties['Github链接'] = {
          url: repo.url
        };
      }
      
      // 标签分类 (支持单选或多选)
      if (repo.tags) {
        // 如果你的数据库字段是 Select (单选)
        // properties['标签分类'] = {
        //   select: {
        //     name: repo.tags.split(',')[0].trim() // 取第一个标签
        //   }
        // };
        
        // 如果你的数据库字段是 Multi-select (多选)，使用下面这个：
        properties['标签分类'] = {
          multi_select: repo.tags.split(',').map(tag => ({ name: tag.trim() }))
        };
      }
      
      // 小红书推广文案
      if (repo.xiaohongshu) {
        properties['小红书推广文案'] = {
          rich_text: [
            {
              text: {
                content: repo.xiaohongshu.substring(0, 2000)
              }
            }
          ]
        };
      }
      
      // 公众号推广文案
      if (repo.wechat) {
        properties['公众号推广文案'] = {
          rich_text: [
            {
              text: {
                content: repo.wechat.substring(0, 2000)
              }
            }
          ]
        };
      }
      
      try {
        await notion.pages.create({
          parent: { database_id: databaseId },
          properties: properties
        });
        
        successCount++;
        console.log(`✓ [${successCount}/${validRepositories.length}] 已添加: ${repo.name}`);
        
      } catch (saveError) {
        failCount++;
        console.error(`✗ [失败] ${repo.name}: ${saveError.message}`);
      }
      
      // 添加延迟以避免速率限制
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // 显示最终统计
    console.log('\n' + '='.repeat(60));
    console.log('保存完成统计：');
    console.log(`  ✓ 成功: ${successCount} 条`);
    if (failCount > 0) {
      console.log(`  ✗ 失败: ${failCount} 条`);
    }
    if (validationReport.invalid > 0) {
      console.log(`  ⊗ 跳过（不完整）: ${validationReport.invalid} 条`);
    }
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ 保存过程出错:', error.message);
    if (error.body) {
      console.error('错误详情:', JSON.stringify(error.body, null, 2));
    }
    throw error;
  }
}

/**
 * 创建 Notion 数据库（辅助函数）
 * 注意：需要先在 Notion 中创建一个页面，并将该页面的 ID 作为 parentPageId
 * @param {string} parentPageId - 父页面 ID
 */
export async function createNotionDatabase(parentPageId) {
  const notion = getNotionClient();
  
  try {
    const response = await notion.databases.create({
      parent: {
        type: 'page_id',
        page_id: parentPageId
      },
      title: [
        {
          type: 'text',
          text: {
            content: 'GitHub 热门仓库'
          }
        }
      ],
      properties: {
        '名称': {
          title: {}
        },
        '描述': {
          rich_text: {}
        },
        '⭐ Stars': {
          number: {
            format: 'number'
          }
        },
        '今日新增': {
          number: {
            format: 'number'
          }
        },
        '语言': {
          select: {}
        },
        'URL': {
          url: {}
        },
        '作者': {
          rich_text: {}
        },
        'Forks': {
          number: {
            format: 'number'
          }
        },
        '日期': {
          date: {}
        }
      }
    });
    
    console.log('数据库创建成功!');
    console.log('数据库 ID:', response.id);
    return response.id;
  } catch (error) {
    console.error('创建数据库失败:', error.message);
    throw error;
  }
}

