import { useRef, useEffect, useState } from 'react';
import { generateImageFromSketch } from '../api/services';
import '../styles/SketchEditor.css';

export default function SketchEditor() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState('#000000');
  const [tool, setTool] = useState('pencil');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [canvasImage, setCanvasImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userDescription, setUserDescription] = useState('');
  const [style, setStyle] = useState('realistic');
  const [size, setSize] = useState('2K');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState('');
  const [step1Completed, setStep1Completed] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 初始化画布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setContext(ctx);
    saveHistory(ctx);
  }, []);

  // 保存历史记录（撤销）
  const saveHistory = (ctx) => {
    const canvas = canvasRef.current;
    const data = canvas.toDataURL('image/png');
    setHistory([...history.slice(0, historyIndex + 1), data]);
    setHistoryIndex(historyIndex + 1);
  };

  // 撤销
  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = history[historyIndex - 1];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      // 关键修复：重置混合模式，避免后续绘制变淡
      ctx.globalCompositeOperation = 'source-over';
      setHistoryIndex(historyIndex - 1);
    };
  };

  // 获取坐标（兼容手机）
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ev = e.touches ? e.touches[0] : e;
    return {
      x: (ev.clientX - rect.left) / scale,
      y: (ev.clientY - rect.top) / scale,
    };
  };

  // 不同笔刷的真实绘制逻辑
  const drawBrush = (ctx, pos) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = brushColor;
    ctx.fillStyle = brushColor;

    switch (tool) {
      case 'pencil': // 铅笔：硬边
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 1;
        ctx.stroke();
        break;

      case 'sketch': // 素描：颗粒
        ctx.lineWidth = brushSize * 1.2;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.4;
        for (let i = 0; i < 3; i++) {
          const rx = (Math.random() - 0.5) * 4;
          const ry = (Math.random() - 0.5) * 4;
          ctx.moveTo(pos.x + rx, pos.y + ry);
          ctx.lineTo(pos.x + rx, pos.y + ry);
          ctx.stroke();
        }
        break;

      case 'line': // 勾线：极细
        ctx.lineWidth = Math.max(1, brushSize * 0.4);
        ctx.lineCap = 'butt';
        ctx.globalAlpha = 1;
        ctx.stroke();
        break;

      case 'soft': // 软毛笔：圆润
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.85;
        ctx.stroke();
        break;

      case 'color': // 上色笔：实心
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'square';
        ctx.globalAlpha = 1;
        ctx.stroke();
        break;

      case 'crayon': // 蜡笔：纹理
        ctx.lineWidth = brushSize * 0.9;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.6;
        for (let i = 0; i < 6; i++) {
          const rx = (Math.random() - 0.5) * 3;
          const ry = (Math.random() - 0.5) * 3;
          ctx.moveTo(pos.x + rx, pos.y + ry);
          ctx.lineTo(pos.x + rx, pos.y + ry);
          ctx.stroke();
        }
        break;

      case 'ink': // 墨水笔
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 1;
        ctx.stroke();
        break;

      case 'spray': // 喷漆：大圆点、高浓度、边缘锐利
        ctx.globalAlpha = 0.8;
        for (let i = 0; i < 30; i++) {
          const r = Math.random() * brushSize * 2;
          const ang = Math.random() * Math.PI * 2;
          const x = pos.x + Math.cos(ang) * r;
          const y = pos.y + Math.sin(ang) * r;
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        // 关键修复：喷漆后重置混合模式和透明度
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        break;

      case 'inkjet': // 喷墨：小颗粒、低浓度、雾化扩散
        ctx.globalAlpha = 0.2;
        for (let i = 0; i < 40; i++) {
          const r = Math.random() * brushSize * 3;
          const ang = Math.random() * Math.PI * 2;
          const x = pos.x + Math.cos(ang) * r;
          const y = pos.y + Math.sin(ang) * r;
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
        // 关键修复：喷墨后重置混合模式和透明度
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        break;

      case 'eraser': // 橡皮擦
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.stroke();
        // 橡皮擦后重置混合模式
        ctx.globalCompositeOperation = 'source-over';
        break;

      default:
        ctx.stroke();
    }
  };

  // 绘制形状（修复：移除半透明，始终实线）
  const drawShape = (start, end, isPreview = false) => {
    const ctx = context;
    if (!ctx) return;
    
    ctx.save();
    // 关键修复：强制重置混合模式和透明度
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1; // 移除半透明，始终实线
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = brushColor;
    ctx.setLineDash([]); // 实线预览

    if (tool === 'circle') {
      const rx = Math.abs(end.x - start.x);
      const ry = Math.abs(end.y - start.y);
      const r = Math.max(rx, ry);
      ctx.beginPath();
      ctx.arc(start.x, start.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (tool === 'rect') {
      ctx.beginPath();
      ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
      ctx.stroke();
    }

    if (tool === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.lineTo(start.x * 2 - end.x, end.y);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
    if (!isPreview) saveHistory(ctx);
  };

  // 预览形状（修复：实线预览，无半透明）
  const drawPreview = (start, end) => {
    const canvas = canvasRef.current;
    const ctx = context;
    if (!ctx || !start || !end || historyIndex < 0) return;

    // 先恢复上一步画面，避免预览残留
    const img = new Image();
    img.src = history[historyIndex];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      // 关键修复：强制重置混合模式和透明度
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      drawShape(start, end, true); // 实线预览，无半透明
    };
  };

  // 开始绘制
  const startDraw = (e) => {
    e.preventDefault();
    const pos = getPos(e);
    setIsDrawing(true);
    setStartPos(pos);
    setCurrentPos(pos);
    // 形状工具不初始化路径，避免额外画线
    if (!['circle', 'rect', 'triangle'].includes(tool)) {
      context.beginPath();
      context.moveTo(pos.x, pos.y);
    }
    // 关键修复：开始绘制前重置混合模式
    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 1;
  };

  // 绘制中
  const onDraw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    setCurrentPos(pos);
    const ctx = context;
    // 形状工具不绘制中间线条，只预览
    if (['circle', 'rect', 'triangle'].includes(tool)) {
      drawPreview(startPos, pos);
      return;
    }
    ctx.lineTo(pos.x, pos.y);
    drawBrush(ctx, pos);
  };

  // 鼠标移动（更新鼠标位置，用于预览和光标样式）
  const onMouseMove = (e) => {
    setMousePos(getPos(e));
  };

  // 结束绘制（修复：橡皮擦后正常保存历史）
  const endDraw = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const pos = getPos(e);
    if (['circle', 'rect', 'triangle'].includes(tool)) {
      drawShape(startPos, pos, false);
    } else {
      saveHistory(context);
      // 关键修复：结束绘制后重置混合模式，避免影响后续操作
      context.globalCompositeOperation = 'source-over';
      context.globalAlpha = 1;
    }
  };

  // 清空画布（修复：不再渐变变淡，直接清空）
  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = context;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 关键修复：清空后重置混合模式和透明度
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    saveHistory(ctx);
  };

  // 完成绘制
  const handleGetSketch = () => {
    setCanvasImage(canvasRef.current.toDataURL('image/png'));
    setStep1Completed(true);
    setError('');
  };

  // 生成图片
  const handleGenerateImage = async () => {
    if (!canvasImage) { setError('请先绘制'); return; }
    setLoading(true);
    try {
      const res = await generateImageFromSketch(canvasImage, userDescription, style, size);
      setGeneratedImage(res);
    } catch (err) {
      setError(err.message || '生成失败');
    }
    setLoading(false);
  };

  return (
    <div className="sketch-editor">
      <div className="editor-header">
        <p className="tip">🎨 AI专业速写板（Pad/PC双端）</p>
      </div>

      <div className="sketch-steps-container">
          <div className="tool-group">
            <div className="tool-grid">
              <button className={`tool-btn ${tool === 'pencil' && 'active'}`} onClick={() => setTool('pencil')}>✏️ 铅笔</button>
              <button className={`tool-btn ${tool === 'sketch' && 'active'}`} onClick={() => setTool('sketch')}>✏️ 素描</button>
              <button className={`tool-btn ${tool === 'line' && 'active'}`} onClick={() => setTool('line')}>🖌️ 勾线</button>
              <button className={`tool-btn ${tool === 'soft' && 'active'}`} onClick={() => setTool('soft')}>🖌️ 软毛</button>
              <button className={`tool-btn ${tool === 'color' && 'active'}`} onClick={() => setTool('color')}>🎨 上色</button>
              <button className={`tool-btn ${tool === 'crayon' && 'active'}`} onClick={() => setTool('crayon')}>🖍️ 蜡笔</button>
              <button className={`tool-btn ${tool === 'ink' && 'active'}`} onClick={() => setTool('ink')}>🖌️ 墨水</button>
              <button className={`tool-btn ${tool === 'spray' && 'active'}`} onClick={() => setTool('spray')}>💨 喷漆</button>
              <button className={`tool-btn ${tool === 'inkjet' && 'active'}`} onClick={() => setTool('inkjet')}>🌫️ 喷墨</button>
              <button className={`tool-btn ${tool === 'eraser' && 'active'}`} onClick={() => setTool('eraser')}>🧽 橡皮擦</button>
              <button className={`tool-btn ${tool === 'circle' && 'active'}`} onClick={() => setTool('circle')}>⚫ 圆形</button>
              <button className={`tool-btn ${tool === 'rect' && 'active'}`} onClick={() => setTool('rect')}>⬜ 矩形</button>
              <button className={`tool-btn ${tool === 'triangle' && 'active'}`} onClick={() => setTool('triangle')}>🔺 三角</button>
              <button className="tool-btn undo" onClick={handleUndo}>↩️ 撤销</button>
              <button className="tool-btn clear" onClick={handleClear}>🗑️ 清空</button>
            </div>

            <div className="tool-settings">
              <div>
                <label>笔宽：</label>
                <input type="range" min="1" max="40" value={brushSize} onChange={(e) => setBrushSize(e.target.value)} />
                <span>{brushSize}px</span>
              </div>
              <div>
                <label>颜色：</label>
                <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} />
              </div>
            </div>
          </div>

          <div 
            style={{ 
              transformOrigin: '0 0',
              position: 'relative'
            }}
          >
            {/* 自定义鼠标光标：圆形，大小随笔宽变化（形状工具也显示） */}
            <div
              style={{
                position: 'absolute',
                left: `${mousePos.x}px`,
                top: `${mousePos.y}px`,
                width: `${brushSize}px`,
                height: `${brushSize}px`,
                borderRadius: '50%',
                border: '1px solid #000',
                pointerEvents: 'none',
                transform: 'translate(-50%, -50%)',
                zIndex: 10
              }}
            />
            <canvas
              ref={canvasRef}
              className="sketch-canvas"
              onMouseDown={startDraw}
              onMouseMove={(e) => {
                onMouseMove(e);
                onDraw(e);
              }}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={onDraw}
              onTouchEnd={endDraw}
              style={{ 
                touchAction: 'none',
                cursor: 'none' // 始终隐藏默认光标，显示自定义圆形
              }}
            />
          </div>

          <button className="btn-confirm" onClick={handleGetSketch}>✅ 完成绘制</button>

        <div className={`step-panel step-2 ${!step1Completed ? 'disabled' : ''}`}>
          <h4 className="step-title">🎨 生成图像</h4>
          <textarea
            value={userDescription}
            onChange={(e) => setUserDescription(e.target.value)}
            placeholder="输入补充描述..."
            rows={3}
            style={{ width: '100%' }}
          />
          <select value={style} onChange={(e) => setStyle(e.target.value)} style={{margin: '8px 0' }}>
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

          <button className="btn-generate" onClick={handleGenerateImage} disabled={loading}>
            {loading ? '生成中...' : '🚀 生成图片'}
          </button>
          {generatedImage && <img src={generatedImage.image_url} style={{ width: '100%', marginTop: 16 }} />}
          {error && <div className="error">{error}</div>}
        </div>
      </div>
    </div>
  );
}