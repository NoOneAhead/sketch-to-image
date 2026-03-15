// 在文件最顶部
import dotenv from 'dotenv';
dotenv.config();
import OpenAI from 'openai';

// 风格配置库
const STYLE_CONFIGS = {
  realistic: {
    name: '现实主义',
    emoji: '🎬',
    prompt: '高质量，照片级渲染，OC渲染，光线追踪，景深，超现实主义，质感真实',
  },
  anime: {
    name: '动漫风格',
    emoji: '🎌',
    prompt: '日本动漫风格，二次元，线条清晰，色彩鲜艳，表情丰富',
  },
  oil_painting: {
    name: '油画风格',
    emoji: '🖼️',
    prompt: '油画风格，笔触厚重，色彩深沉，光影效果，传统艺术',
  },
  cyberpunk: {
    name: '赛博朋克',
    emoji: '🌃',
    prompt: '赛博朋克风格，霓虹灯，科技感，未来主义，深蓝，紫红色调',
  },
  watercolor: {
    name: '水彩风格',
    emoji: '🎨',
    prompt: '水彩风格，色彩透明，笔触流畅，晕染效果，意境深远',
  },
  pixel_art: {
    name: '像素艺术',
    emoji: '👾',
    prompt: '8位像素艺术，复古风格，像素化，怀旧游戏感',
  },
  sketch: {
    name: '素描线稿',
    emoji: '✏️',
    prompt: '素描线稿风格，铅笔素描，线条细致，明暗层次丰富',
  },
  d3_model: {
    name: '3D模型',
    emoji: '🎯',
    prompt: '3D渲染风格，三维立体效果，高精度模型，专业渲染',
  },
  ink_painting: {
    name: '国画风格',
    emoji: '🖌️',
    prompt: '中国水墨画风格，笔墨意境，山水意境，留白艺术',
  },
  steampunk: {
    name: '蒸汽朋克',
    emoji: '⚙️',
    prompt: '蒸汽朋克风格，机械齿轮，复古工业，金属质感',
  },
};

class DoubaoService {
  constructor() {
    const apiKey = process.env.ARK_API_KEY;
    if (!apiKey) {
      throw new Error('❌ ARK_API_KEY 未配置，请在 .env 文件中设置');
    }

    this.openai = new OpenAI({
      baseURL: process.env.ARK_API_BASE || 'https://ark.cn-beijing.volces.com/api/v3',
      apiKey: apiKey,
    });

    this.model = process.env.DOUBAO_MODEL || 'doubao-seedream-5-0-260128';
    this.styleConfigs = STYLE_CONFIGS;

    console.log('✅ 豆包客户端已初始化');
    console.log(`   模型: ${this.model}`);
    console.log(`   支持风格数: ${Object.keys(this.styleConfigs).length}`);
  }

  /**
   * 获取所有支持的风格
   */
  getStyles() {
    return Object.entries(this.styleConfigs).map(([id, config]) => ({
      id,
      name: config.name,
      emoji: config.emoji,
    }));
  }

  /**
   * 格式化提示词
   * @param {string} userPrompt - 用户输入的提示词
   * @param {string} style - 艺术风格
   * @returns {string} 格式化后的提示词
   */
  formatPrompt(userPrompt, style) {
    const styleConfig = this.styleConfigs[style];
    if (!styleConfig) {
      console.warn(`⚠️ 未知风格: ${style}，使用默认风格`);
      return userPrompt;
    }

    // 组合用户提示词和风格描述
    return `${userPrompt}，${styleConfig.prompt}`;
  }

  /**
   * 生成单张图片
   * @param {string} prompt - 图片提示词
   * @param {string} size - 图片尺寸 (1920x1920, 2K, 4K)
   * @param {boolean} watermark - 是否添加水印
   * @returns {Promise<Object>} 生成结果
   */
  async generateImage(prompt, size = '2K', watermark = false) {
    try {
      // 验证输入
      if (!prompt || typeof prompt !== 'string') {
        throw new Error('❌ prompt 必须是非空字符串');
      }

      if (prompt.length > 2000) {
        throw new Error('❌ prompt 长度不能超过 2000 字符');
      }

      const validSizes = ['1920x1920', '2K', '4K'];
      if (!validSizes.includes(size)) {
        throw new Error(`❌ 无效的尺寸，支持: ${validSizes.join(', ')}`);
      }

      console.log(`\n🖼️ 豆包图片生成请求`);
      console.log(`   提示词: ${prompt.substring(0, 60)}${prompt.length > 60 ? '...' : ''}`);
      console.log(`   尺寸: ${size}`);
      console.log(`   水印: ${watermark ? '是' : '否'}`);

      const response = await this.openai.images.generate({
        model: this.model,
        prompt: prompt,
        size: size,
        response_format: 'url',
        extra_body: {
          watermark: watermark,
        },
      });

      if (!response.data || !response.data[0]) {
        throw new Error('❌ API 未返回有效的图片数据');
      }

      const imageUrl = response.data[0].url;
      console.log(`✅ 图片生成成功`);
      console.log(`   URL: ${imageUrl.substring(0, 80)}...`);

      return {
        image_url: imageUrl,
        model: this.model,
        size: size,
        watermark: watermark,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ 豆包 API 错误:', error.message);

      if (error.status === 401) {
        throw new Error('❌ API Key 无效或已过期 - 请检查 ARK_API_KEY');
      }
      if (error.status === 429) {
        throw new Error('⏱️ 请求过于频繁，请稍后重试（速率限制）');
      }
      if (error.code === 'ECONNREFUSED') {
        throw new Error('❌ 无法连接到豆包 API，请检查网络连接');
      }

      throw new Error(`图片生成失败: ${error.message}`);
    }
  }

  /**
   * 批量生成图片
   * @param {Array<string>} prompts - 提示词数组
   * @param {string} size - 图片尺寸
   * @param {boolean} watermark - 是否添加水印
   * @returns {Promise<Array>} 生成结果数组
   */
  async batchGenerateImages(prompts, size = '2K', watermark = false) {
    if (!Array.isArray(prompts) || prompts.length === 0) {
      throw new Error('❌ prompts 必须是非空数组');
    }

    if (prompts.length > 10) {
      throw new Error('❌ 单次最多生成 10 张图片');
    }

    console.log(`\n🎨 批量生成 ${prompts.length} 张图片...`);

    const results = [];
    for (let i = 0; i < prompts.length; i++) {
      try {
        console.log(`   [${i + 1}/${prompts.length}] 生成中...`);
        const result = await this.generateImage(prompts[i], size, watermark);
        results.push({
          index: i + 1,
          prompt: prompts[i],
          ...result,
          success: true,
        });

        // 避免速率限制，请求间隔 1 秒
        if (i < prompts.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`   [${i + 1}/${prompts.length}] 生成失败: ${error.message}`);
        results.push({
          index: i + 1,
          prompt: prompts[i],
          success: false,
          error: error.message,
        });
      }
    }

    const succeeded = results.filter((r) => r.success).length;
    console.log(`✅ 批量生成完成 - 成功: ${succeeded}/${prompts.length}`);

    return results;
  }

  /**
   * 根据风格生成图片
   * @param {string} userPrompt - 用户提示词
   * @param {string} style - 风格ID
   * @param {string} size - 图片尺寸
   * @returns {Promise<Object>} 生成结果
   */
  async generateImageWithStyle(userPrompt, style = 'realistic', size = '2K') {
    const formattedPrompt = this.formatPrompt(userPrompt, style);
    return this.generateImage(formattedPrompt, size);
  }

  /**
   * 获取模型信息
   */
  getModelInfo() {
    return {
      model: this.model,
      capabilities: {
        text_to_image: true,
        batch_generation: true,
        watermark_support: true,
        styles_count: Object.keys(this.styleConfigs).length,
      },
      supportedSizes: ['1920x1920', '2K', '4K'],
    };
  }
}

export default new DoubaoService();
