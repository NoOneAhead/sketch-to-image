import express from 'express';
const router = express.Router();
import doubaoService from '../services/doubaoService.js';

router.post('/generate-from-sketch-v3', async (req, res) => {
  try {
    const { sketch_base64, user_description, style, size } = req.body;

    if (!sketch_base64) {
      return res.status(400).json({ success: false, message: "缺少草图数据" });
    }

    // 调用图生图
    const imageUrl = await doubaoService.generateImageFromSketch({
      imageBase64: sketch_base64,
      prompt: user_description,
      style: style,
      size: size || "2K"
    });

    return res.json({
      success: true,
      image_url: imageUrl
    });

  } catch (err) {
    console.error("❌ 生成失败：", err);
    return res.status(500).json({
      success: false,
      message: err.message || "生成失败"
    });
  }
});

export default router;