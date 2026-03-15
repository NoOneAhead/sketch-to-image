// src/api/services.js

import axios from 'axios';

// 后端 API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * 检查后端服务健康状态
 * @returns {Promise<boolean>}
 */
export async function healthCheck() {
  try {
    const response = await axios.get('http://localhost:5000/health');
    return response.status === 200 && response.data.status === 'ok';
  } catch (error) {
    console.error('健康检查失败:', error);
    return false;
  }
}

/**
 * 获取可用的风格列表
 * @returns {Promise<Array>}
 */
export async function getStyles() {
  // 暂时硬编码一些风格，或者你可以从后端获取
  return [
    { id: 'realistic', name: '写实' },
    { id: 'anime', name: '动漫' },
    { id: 'oil_painting', name: '油画' },
    { id: 'cyberpunk', name: '赛博朋克' },
    { id: 'watercolor', name: '水彩' },
  ];
}

/**
 * 获取可用的图片尺寸列表
 * @returns {Promise<Array>}
 */
export async function getImageSizes() {
  // 暂时硬编码一些尺寸，或者你可以从后端获取
  return ['1920x1920', '1024x1792', '1792x1024', '2K'];
}

/**
 * 从文本生成图片
 * @param {string} prompt - 提示词
 * @param {string} style - 风格
 * @param {string} size - 尺寸
 * @returns {Promise<Object>}
 */
export async function generateImage(prompt, style, size) {
  try {
    const response = await axios.post(`${API_BASE_URL}/images/generate`, {
      prompt,
      style,
      size,
    });
    return response.data.data;
  } catch (error) {
    console.error('从文本生成图片失败:', error);
    throw new Error(error.response?.data?.error || '生成图片失败');
  }
}

/**
 * 从草图生成图片 (通过豆包视觉识别)
 * @param {string} sketch_base64 - Base64 编码的草图
 * @param {string} user_description - 用户的补充描述
 * @param {string} style - 风格
 * @param {string} size - 尺寸
 * @returns {Promise<Object>}
 */
export async function generateImageFromSketch(sketch_base64, user_description, style, size) {
  try {
    const response = await axios.post(`${API_BASE_URL}/images/generate-from-sketch-v3`, {
      sketch_base64,
      user_description,
      style,
      size,
    });
    return response.data.data;
  } catch (error) {
    console.error('从草图生成图片失败:', error);
    throw new Error(error.response?.data?.error || '生成图片失败');
  }
}

/**
 * 仅识别草图特征
 * @param {string} sketch_base64 - Base64 编码的草图
 * @returns {Promise<Object>}
 */
export async function recognizeSketchFeatures(sketch_base64) {
  try {
    const response = await axios.post(`${API_BASE_URL}/images/recognize-sketch`, {
      sketch_base64,
    });
    return response.data.data;
  } catch (error) {
    console.error('识别草图失败:', error);
    throw new Error(error.response?.data?.error || '识别草图失败');
  }
}
