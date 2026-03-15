import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 豆包视觉识别服务
 * 使用 Doubao-Seed-2.0-mini 模型进行图像分析
 */
class DoubaoVisionService {
  constructor() {
    const apiKey = process.env.ARK_API_KEY;
    
    if (!apiKey) {
      throw new Error('❌ 未找到 ARK_API_KEY 环境变量');
    }

    this.client = new OpenAI({
      baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
      apiKey: apiKey,
      timeout: 30 * 1000, // 30秒超时
    });

    this.model = 'doubao-seed-2-0-mini-260215';
    console.log(`✅ 豆包视觉识别服务已初始化（模型: ${this.model}）`);
  }

  /**
   * 清理 Base64 字符串（移除 data:image 前缀）
   * @param {string} base64Str - Base64 编码的图片字符串
   * @returns {string} 清理后的 Base64 字符串
   */
  cleanBase64(base64Str) {
    if (base64Str.startsWith('data:image')) {
      return base64Str.split(',')[1];
    }
    return base64Str;
  }

  /**
   * 将 Base64 字符串转换为数据 URL
   * @param {string} base64Str - Base64 编码的图片字符串
   * @returns {string} 数据 URL
   */
  base64ToDataUrl(base64Str) {
    const cleaned = this.cleanBase64(base64Str);
    return `data:image/png;base64,${cleaned}`;
  }

  /**
   * 识别草图特征 - 使用豆包视觉模型分析
   * @param {string} sketchBase64 - Base64 编码的草图
   * @returns {Promise<Object>} 识别结果
   */
  async recognizeSketchFeatures(sketchBase64) {
    try {
      console.log('\n🔍 开始识别草图特征（豆包视觉 Seed-2.0-mini）...');

      // 转换为数据 URL
      const imageUrl = this.base64ToDataUrl(sketchBase64);

      // 调用豆包 API
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
              {
                type: 'text',
                text: `你是一个专业的艺术指导。请仔细分析这张草图，并用JSON格式提供以下信息：

{
  "main_object": "草图中的主要对象是什么？（例如：人物、动物、建筑、风景等）",
  "composition": "描述草图的构图、布局和空间关系",
  "details": "草图中有哪些重要的细节特征？（例如：表情、姿态、纹理等）",
  "style": "草图的绘画风格是什么？（例如：简洁、复杂、写实、卡通等）",
  "suggestions": "为了生成高质量的最终图像，还需要补充哪些细节？",
  "recommended_styles": ["推荐风格1", "推荐风格2", "推荐风格3"],
  "quality_assessment": "评估草图的完整度和清晰度（1-10分）"
}

请确保返回有效的 JSON 格式，用中文回答。不要包含任何 markdown 格式标记。`,
              },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      // 提取响应内容
      const responseText = response.choices[0].message.content;
      console.log('✅ 识别完成');
      console.log(`📝 原始响应:\n${responseText}`);

      // 解析 JSON
      const structuredAnalysis = this.parseJsonResponse(responseText);

      return {
        success: true,
        raw_analysis: responseText,
        structured_analysis: structuredAnalysis,
      };
    } catch (error) {
      console.error('❌ 识别失败:', error.message);
      throw new Error(`草图识别失败: ${error.message}`);
    }
  }

  /**
   * 解析 JSON 响应
   * @param {string} responseText - API 返回的文本
   * @returns {Object} 解析后的 JSON 对象
   */
  parseJsonResponse(responseText) {
    try {
      // 尝试直接解析
      const result = JSON.parse(responseText);
      console.log('✅ JSON 解析成功');
      return result;
    } catch (error) {
      console.warn('⚠️  直接 JSON 解析失败，尝试提取 JSON 部分...');

      // 查找 JSON 块
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const result = JSON.parse(jsonMatch[0]);
          console.log('✅ JSON 提取成功');
          return result;
        } catch (parseError) {
          console.warn('⚠️  JSON 提取解析失败');
        }
      }

      // 如果仍然失败，返回默认结构
      console.warn('⚠️  无法解析 JSON，使用默认结构');
      return this.generateDefaultAnalysis(responseText);
    }
  }

  /**
   * 生成默认的分析结果
   * @param {string} responseText - API 返回的文本
   * @returns {Object} 默认分析结果
   */
  generateDefaultAnalysis(responseText) {
    return {
      main_object: '未知对象',
      composition: '构图清晰，层次分明',
      details: responseText.substring(0, 100) || '细节表现丰富',
      style: '现代风格',
      suggestions: '丰富细节和色彩',
      recommended_styles: ['逼真', '油画', '数字艺术'],
      quality_assessment: '待评估',
    };
  }

  /**
   * 生成最终的提示词
   * @param {Object} structuredAnalysis - 结构化的分析结果
   * @param {string} userDescription - 用户的补充描述
   * @returns {string} 用于生成图像的最终提示词
   */
  generateFinalPrompt(structuredAnalysis, userDescription = '') {
    const parts = [];

    // 主要对象
    if (structuredAnalysis.main_object) {
      parts.push(`主体: ${structuredAnalysis.main_object}`);
    }

    // 构图
    if (structuredAnalysis.composition) {
      parts.push(`构图: ${structuredAnalysis.composition}`);
    }

    // 细节
    if (structuredAnalysis.details) {
      parts.push(`细节: ${structuredAnalysis.details}`);
    }

    // 用户补充
    if (userDescription && userDescription.trim()) {
      parts.push(`补充: ${userDescription}`);
    }

    // 建议
    if (structuredAnalysis.suggestions) {
      parts.push(`增强: ${structuredAnalysis.suggestions}`);
    }

    // 推荐风格
    if (structuredAnalysis.recommended_styles && structuredAnalysis.recommended_styles.length > 0) {
      const styles = structuredAnalysis.recommended_styles.join('、');
      parts.push(`风格: ${styles}`);
    }

    // 质量提升
    parts.push('质量要求: 高清、细节丰富、色彩协调、专业级别');

    const finalPrompt = parts.join(', ');

    console.log('\n📝 生成的最终提示词:');
    console.log(`   ${finalPrompt}`);

    return finalPrompt;
  }

  /**
   * 完整流程：分析草图并生成提示词
   * @param {string} sketchBase64 - Base64 编码的草图
   * @param {string} userDescription - 用户的补充描述
   * @returns {Promise<Object>} 包含分析和提示词的结果
   */
  async analyzeAndGeneratePrompt(sketchBase64, userDescription = '') {
    try {
      // 第一步：识别草图特征
      const analysisResult = await this.recognizeSketchFeatures(sketchBase64);

      if (!analysisResult.success) {
        throw new Error('识别失败');
      }

      // 第二步：生成最终提示词
      const finalPrompt = this.generateFinalPrompt(
        analysisResult.structured_analysis,
        userDescription
      );

      return {
        success: true,
        raw_analysis: analysisResult.raw_analysis,
        structured_analysis: analysisResult.structured_analysis,
        final_prompt: finalPrompt,
      };
    } catch (error) {
      console.error('❌ 分析失败:', error.message);
      throw error;
    }
  }
}

// ✅ 导出单例
export default new DoubaoVisionService();
