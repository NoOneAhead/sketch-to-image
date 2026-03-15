import express from 'express';
import doubaoService from '../services/doubaoService.js';
import doubaoVisionService from '../services/doubaoVisionService.js';

const router = express.Router();

/**
 * POST /api/images/recognize-sketch
 * 第一步：识别草图特征（使用豆包视觉）
 */
router.post('/recognize-sketch', async (req, res) => {
  try {
    const { sketch_base64 } = req.body;

    if (!sketch_base64) {
      return res.status(400).json({
        success: false,
        error: '必须提供 sketch_base64 参数',
      });
    }

    console.log(`\n🔍 识别草图特征（豆包视觉 Seed-2.0-mini）`);
    console.log(`   草图大小: ${sketch_base64.length} bytes`);

    // 调用豆包视觉识别服务
    const analysis = await doubaoVisionService.recognizeSketchFeatures(sketch_base64);

    res.json({
      success: true,
      data: {
        raw_analysis: analysis.raw_analysis,
        structured_analysis: analysis.structured_analysis,
      },
    });
  } catch (error) {
    console.error('❌ 识别失败:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/images/generate-from-sketch-v3
 * 基于识别结果生成图片（豆包视觉版本）
 */
router.post('/generate-from-sketch-v3', async (req, res) => {
  try {
    const { sketch_base64, user_description = '', style = 'realistic', size = '2K' } = req.body;

    if (!sketch_base64) {
      return res.status(400).json({
        success: false,
        error: '必须提供 sketch_base64 参数',
      });
    }

    console.log(`\n🎨 基于草图生成图片 (v3 - 豆包视觉)`);
    console.log(`   第一步: 分析草图和生成提示词...`);

    // 步骤 1: 分析草图并生成提示词
    const analysisResult = await doubaoVisionService.analyzeAndGeneratePrompt(
      sketch_base64,
      user_description
    );

    const { final_prompt, structured_analysis, raw_analysis } = analysisResult;

    console.log(`\n   第二步: 调用豆包生成图像...`);

    // 步骤 2: 调用豆包生成图像
    const result = await doubaoService.generateImageWithStyle(final_prompt, style, size);

    console.log(`✅ 图片生成成功`);

    res.json({
      success: true,
      data: {
        ...result,
        analysis: {
          raw: raw_analysis,
          structured: structured_analysis,
          final_prompt: final_prompt,
        },
      },
    });
  } catch (error) {
    console.error('❌ 生成失败:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/images/generate
 * 基于文字提示生成图片
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, style = 'realistic', size = '1920x1920' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '必须提供 prompt 参数',
      });
    }

    console.log(`\n🎨 生成图片`);
    console.log(`   提示词: ${prompt}`);
    console.log(`   风格: ${style}`);
    console.log(`   尺寸: ${size}`);

    const result = await doubaoService.generateImageWithStyle(prompt, style, size);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('❌ 生成失败:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
