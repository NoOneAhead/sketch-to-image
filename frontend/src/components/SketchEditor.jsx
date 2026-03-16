import { useRef, useEffect, useState } from 'react';
import { generateImageFromSketch } from '../api/services';
import '../styles/SketchEditor.css';

export default function SketchEditor() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState('#000000');
  const [canvasImage, setCanvasImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userDescription, setUserDescription] = useState('');
  const [style, setStyle] = useState('realistic'); // 选中的单个风格
  const [size, setSize] = useState('2K');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState('');
  const [step1Completed, setStep1Completed] = useState(false);

  // 画布初始化（保留）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setContext(ctx);
    }
  }, []);

  // 绘图方法（保留）
  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    context.beginPath();
    context.moveTo(pos.x, pos.y);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !context) return;
    const pos = getMousePos(e);
    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineTo(pos.x, pos.y);
    context.stroke();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    context.closePath();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setCanvasImage(null);
    setGeneratedImage(null);
    setError('');
    setStep1Completed(false);
  };

  const handleGetSketch = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');
    setCanvasImage(imageData);
    setStep1Completed(true);
    setError('');
  };

  // ========== 修复点2：规范生成逻辑，确保参数完整 ==========
  const handleGenerateImage = async () => {
    if (!canvasImage) {
      setError('请先完成草图绘制');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('开始生成图片，参数：', {
        canvasImage: canvasImage.substring(0, 50) + '...', // 脱敏打印
        userDescription,
        style,
        size,

      });

      // 调用生成接口（参数与后端对齐）
      const result = await generateImageFromSketch(
        canvasImage,
        userDescription,
        style,          // 单个风格
        size,           // 尺寸
      );
      setGeneratedImage(result);
    } catch (err) {
      // 精准捕获错误信息
      const errMsg = err.message || '生成失败，请检查后端服务';
      setError(errMsg);
      console.error('生成图片失败详情：', err);
    } finally {
      setLoading(false);
    }
  };

  // UI渲染（保留，无修改）
  return (
    <div className="sketch-editor">
      <div className="editor-header">
        <p className="tip">
          🎯 两步流程：绘制草图 → 生成高质量图像
        </p>
      </div>

      <div className="progress-steps">
        <div className={`step ${step1Completed ? 'done' : 'active'}`}>
          <div className="step-circle">1</div>
          <p>绘制草图</p>
        </div>
        <div className="step-line" />
        <div className={`step ${!step1Completed ? '' : 'active'}`}>
          <div className="step-circle">2</div>
          <p>生成图像</p>
        </div>
      </div>

      <div className="steps-container">
        <div className="step-panel step-1">
          <h4 className="step-title">✏️ 步骤1：绘制草图</h4>
          <div className="editor-toolbar">
            <div className="toolbar-item">
              <label>笔刷大小</label>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(e.target.value)}
                className="slider"
              />
              <span className="value">{brushSize}px</span>
            </div>

            <div className="toolbar-item">
              <label>笔刷颜色</label>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="color-picker"
              />
            </div>

            <div className="toolbar-buttons">
              <button className="btn-tool btn-clear" onClick={handleClear}>
                🗑️ 清空
              </button>
              <button className="btn-tool btn-save" onClick={handleGetSketch}>
                <span>✅</span> 完成绘制
              </button>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            className="sketch-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        <div className={`step-panel step-2 ${!step1Completed ? 'disabled' : ''}`}>
          <h4 className="step-title">🎨 步骤2：生成高质量图像</h4>
          
          <div className="generation-config">
            <div className="config-item">
              <label>补充描述（可选）</label>
              <textarea
                value={userDescription}
                onChange={(e) => setUserDescription(e.target.value)}
                placeholder="例如：添加更多细节、改变背景、调整表情等..."
                rows={3}
                style={{width: '100%', minWidth: '300px'}}
              />
            </div>
            <div className="config-item">
              <label>艺术风格</label>
              <select value={style} onChange={(e) => setStyle(e.target.value)}>
                <option value="realistic">现实主义</option>
                <option value="oil_painting">油画风格</option>
                <option value="watercolor">水彩风格</option>
                <option value="pencil_sketch">铅笔素描</option>
                <option value="cartoon">动漫风格</option>
                <option value="3d">3D渲染</option>
                <option value="cyberpunk">赛博朋克</option>
                <option value="pixel_art">像素艺术</option>
                <option value="ink_painting">国画风格</option>
                <option value="steampunk">蒸汽朋克</option>
              </select>
            </div>
            <div className="config-item">
              <label>图片尺寸</label>
              <select value={size} onChange={(e) => setSize(e.target.value)}>
                <option value="2K">2K (推荐)</option>
              </select>
            </div>
          </div>

          <button
            className="btn-next"
            onClick={handleGenerateImage}
            disabled={!step1Completed || loading}
            style={{marginTop: '16px'}}
          >
            {loading ? '⏳ 生成中...' : '生成图像 →'}
          </button>

          {generatedImage && (
            <div className="result-panel" style={{marginTop: '20px'}}>
              <div className="result-image">
                <h4>✅ 生成完成！</h4>
                <img src={generatedImage.image_url} alt="生成的图片" style={{maxWidth: '100%'}} />
                <button
                  className="btn-download"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = generatedImage.image_url;
                    link.download = 'generated-image.png';
                    link.click();
                  }}
                  style={{marginTop: '10px'}}
                >
                  📥 下载图片
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && <div className="error-message">❌ {error}</div>}
    </div>
  );
}