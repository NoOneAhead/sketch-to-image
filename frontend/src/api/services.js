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
    const response = await axios.get(`${API_BASE_URL}/health`);
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
 * 从草图生成图片（适配v3接口）
 * @param {string} sketchBase64 - 草图Base64
 * @param {string} userDescription - 用户描述
 * @param {string} style - 选中的风格
 * @param {string} size - 图片尺寸
 * @param {Array<string>} selectedStyles - 风格数组
 * @returns {Promise<Object>} 生成结果
 */
export const generateImageFromSketch = async (
  sketchBase64,
  userDescription = '',
  style = 'realistic',
  size = '2K'
) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/images/generate-from-sketch-v3`, {
      sketch_base64: sketchBase64,
      user_description: userDescription,
      style: style,
      size: size
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000 // 图生图耗时较长，超时设为60秒
    });

    if (!response.data || !response.data.image_url) {
      throw new Error('后端返回格式异常，未找到image_url');
    }

    return response.data;
  } catch (error) {
    let errorMsg = '图生图生成失败';
    if (error.response) {
      errorMsg += `: ${error.response.status} - ${error.response.data.message}`;
    } else if (error.request) {
      errorMsg += ': 后端服务未响应，请检查服务是否启动';
    } else {
      errorMsg += `: ${error.message}`;
    }
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
};