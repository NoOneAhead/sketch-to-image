import { useState } from 'react';

/**
 * 通用异步处理 Hook：封装 loading/error/data 状态 + 异步执行逻辑
 * @param {Function} asyncFn - 异步函数
 * @returns {Object} { loading, error, data, execute }
 */
export const useAsync = (asyncFn) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const execute = async (...args) => {
    try {
      setLoading(true);
      setError('');
      const result = await asyncFn(...args);
      setData(result);
      return result;
    } catch (err) {
      const errorMsg = err.message || '操作失败，请重试';
      setError(errorMsg);
      console.error('异步操作失败:', err);
      throw err; // 抛出错误供上层处理
    } finally {
      setLoading(false);
    }
  };

  // 重置状态
  const reset = () => {
    setLoading(false);
    setError('');
    setData(null);
  };

  return { loading, error, data, execute, reset };
};