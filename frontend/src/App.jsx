import { useState, useEffect } from 'react';
import {
  healthCheck,
} from './api/services';
import SketchEditor from './components/SketchEditor';
import './App.css';

export default function App() {
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState(false);

  // 初始化
  useEffect(() => {
    const initialize = async () => {
      try {
        const isHealthy = await healthCheck();
        setApiStatus(isHealthy);
        if (isHealthy) {
        } else {
          setError('⚠️ 后端服务未启动');
        }
      } catch (err) {
        console.error('初始化失败:', err);
      }
    };

    initialize();
  }, []);

  return (
    <div className="app">
      <main className="container">
        <div className="layout">
            <SketchEditor />
            <div className="header">
              <span className={`status ${apiStatus ? 'ok' : 'error'}`}>
                {apiStatus ? '✅ 已连接' : '❌ 未连接'}
              </span>
            </div>
        </div>
      </main>
    </div>
  );
}
