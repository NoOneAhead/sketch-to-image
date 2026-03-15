/**
 * 草图分析器 - 将草图转换为文字描述
 */
class SketchAnalyzer {
  /**
   * 分析草图并提取特征
   * @param {string} sketchBase64 - Base64 编码的草图图片
   * @returns {Promise<Object>} 分析结果
   */
  async analyzeSketch(sketchBase64) {
    try {
      // 移除 data:image/png;base64, 前缀
      const base64Data = sketchBase64.replace(/^data:image\/\w+;base64,/, '');

      console.log('🔍 分析草图特征...');
      console.log(`   图片大小: ${base64Data.length} bytes`);

      // 生成草图描述提示词
      const sketchPrompt = this.generateSketchPrompt(sketchBase64);

      return {
        success: true,
        sketch_base64: base64Data,
        prompt_suggestion: sketchPrompt,
        analysis: {
          has_clear_shapes: this.hasShapes(sketchBase64),
          complexity_level: this.estimateComplexity(sketchBase64),
          suggested_styles: ['realistic', 'oil_painting', 'sketch'],
        },
      };
    } catch (error) {
      console.error('❌ 草图分析失败:', error.message);
      throw new Error(`草图分析失败: ${error.message}`);
    }
  }

  /**
   * 生成草图提示词
   * @param {string} sketchBase64 - Base64 图片
   * @returns {string} 提示词
   */
  generateSketchPrompt(sketchBase64) {
    // 这里可以添加更复杂的图像处理逻辑
    // 目前返回一个通用提示
    return '根据提供的草图，生成高质量的最终图片，保持原草图的结构和布局，增强细节和纹理';
  }

  /**
   * 检测是否有清晰的图形
   * @param {string} sketchBase64 - Base64 图片
   * @returns {boolean}
   */
  hasShapes(sketchBase64) {
    // 简单检查：图片大小超过某个阈值表示有内容
    return sketchBase64.length > 5000;
  }

  /**
   * 估计复杂度
   * @param {string} sketchBase64 - Base64 图片
   * @returns {string} 复杂度等级
   */
  estimateComplexity(sketchBase64) {
    const size = sketchBase64.length;
    if (size < 10000) return 'simple';
    if (size < 50000) return 'medium';
    return 'complex';
  }

  /**
   * 合并用户描述和草图提示
   * @param {string} userDescription - 用户输入的描述
   * @param {string} sketchPrompt - 草图生成的提示
   * @returns {string} 合并后的提示词
   */
  mergePrompts(userDescription, sketchPrompt) {
    if (!userDescription.trim()) {
      return sketchPrompt;
    }

    return `${userDescription}。${sketchPrompt}`;
  }
}

export default new SketchAnalyzer();
