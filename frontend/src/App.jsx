import { useState, useEffect } from 'react';
import {
  healthCheck,
} from './api/services';
import SketchEditor from './components/SketchEditor';
import './App.css';

export default function App() {
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState(false);
  const [mode] = useState('sketch'); 
  const [sketchImage, setSketchImage] = useState(null);

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

  // 处理草图
  const handleSketchGenerated = (sketchData) => {
    setSketchImage(sketchData);
  };


  return (
    <div className="app">
      <header className="header">
        <h1>🎨 绘创 AI - 草图创意生成器</h1>
        <div className="header-right">
          <span className={`status ${apiStatus ? 'ok' : 'error'}`}>
            {apiStatus ? '✅ 已连接' : '❌ 未连接'}
          </span>
        </div>
      </header>

      <main className="container">
        <div className="layout">
          {/* 中央/右侧：内容区 */}
          <section className="content-section">
            {/* 草图模式：显示编辑器 */}
            {mode === 'sketch' && (
              <div className="sketch-section">
                <SketchEditor onSketchGenerated={handleSketchGenerated} />

              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
