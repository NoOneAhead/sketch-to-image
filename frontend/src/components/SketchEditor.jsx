import { useRef, useEffect, useState } from 'react';
import { recognizeSketchFeatures, generateImageFromSketch } from '../api/services';
import '../styles/SketchEditor.css';

export default function SketchEditor() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState('#000000');
  const [canvasImage, setCanvasImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userDescription, setUserDescription] = useState('');
  const [style, setStyle] = useState('realistic');
  const [size, setSize] = useState('2K');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState('');
  const [step1Completed, setStep1Completed] = useState(false);
  const [step2Completed, setStep2Completed] = useState(false);

  // 丰富的风格特征映射表
  const styleFeatureMap = {
    realistic: `超写实风格核心特征：
1. 光影：物理级真实光影，自然漫反射+精准高光，符合现实光源逻辑，阴影层次丰富（软阴影/硬阴影随光源距离变化）；
2. 材质：还原真实物体质感（金属反光/布料纹理/皮肤毛孔/玻璃通透感），纹理细节1:1复刻现实；
3. 色彩：自然色彩过渡，无饱和度溢出，符合环境色影响规律，色温/色调贴合场景氛围；
4. 构图：透视关系精准，近大远小符合人眼视觉，景深效果自然（前景清晰/背景虚化）；
5. 细节：像素级精细度，毛发/纹理/磨损痕迹等微观细节完整呈现，无模糊或简化。`,

    oil_painting: `油画风格核心特征：
1. 笔触：厚重肌理感笔触，可见明显的颜料堆叠效果，刮刀/画笔纹理交错，边缘有自然的颜料晕染；
2. 色彩：高饱和度+冷暖对比强烈，色彩层次丰富（多层罩染效果），暗部保留色彩层次不发黑；
3. 光影：戏剧化光影，高光区域提亮但保留笔触质感，阴影区域有色彩倾向（如蓝紫调阴影）；
4. 质感：画布纹理清晰可见（亚麻布/棉布纹理），颜料厚度带来的凹凸立体感；
5. 风格：兼具古典油画的厚重感与印象派的色彩表现力，笔触方向贴合物体结构走向。`,

    watercolor: `水彩风格核心特征：
1. 通透感：颜料半透明叠加效果，底层色彩可透过上层显现，无厚重覆盖感；
2. 晕染：湿画法自然晕染边缘，色彩过渡柔和，有自然的水痕/飞白效果；
3. 笔触：轻透的刷笔纹理，笔触边缘模糊，保留水分扩散的自然形态；
4. 色彩：低饱和度柔和色调，以透明水色为主，留白区域作为高光/透气点；
5. 纸张：可见水彩纸纹理（粗纹/细纹），边缘有自然的颜料沉淀效果，整体轻盈空灵。`,

    pencil_sketch: `铅笔素描风格核心特征：
1. 线条：明暗排线纹理（交叉排线/单向排线），线条密度对应明暗程度，轮廓线轻重有别；
2. 灰度：12级以上灰度层次，从纯白到深黑过渡自然，无断层；
3. 质感：铅笔粉末附着纸张的颗粒感，高光区域保留纸张本色，暗部无死黑；
4. 笔触：随物体结构变化的排线方向（如球体弧形排线/方体直线排线），有擦揉过渡效果；
5. 细节：轻笔触表现纹理（如布料纹路/皮肤肌理），重笔触强化轮廓，整体有手绘素描的呼吸感。`,

    cartoon: `卡通风格核心特征：
1. 线条：简洁硬朗的轮廓线（无模糊/无渐变），线条粗细一致或按层级区分；
2. 色彩：高饱和纯色块，无渐变/无阴影过渡，色彩对比强烈且明快；
3. 造型：夸张的比例（如大头小身/大眼睛），简化的细节（无复杂纹理）；
4. 阴影：扁平化色块阴影（无羽化），仅做位置区分不做体积表现；
5. 风格：二次元/美式卡通混合风格，轮廓清晰，画面干净，无多余杂色/纹理。`,

    '3d': `3D渲染风格核心特征：
1. 建模：多边形建模的精准轮廓，曲面细分带来的平滑质感，无手绘变形；
2. 材质：PBR物理材质（金属度/粗糙度/法线贴图），反射/折射符合物理规律；
3. 光影：全局光照（GI）效果，间接光反射自然，阴影有软硬度变化；
4. 渲染：光线追踪级渲染精度，抗锯齿无毛刺，景深/焦外虚化效果自然；
5. 细节：UV贴图纹理精准贴合模型，凹凸/置换贴图带来的立体纹理，环境光遮蔽（AO）增强体积感。`
  };

  // 初始化画布
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
    setAnalysis(null);
    setGeneratedImage(null);
    setError('');
    setStep1Completed(false);
    setStep2Completed(false);
  };

  const handleGetSketch = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');
    setCanvasImage(imageData);
    setStep1Completed(true);
    setError('');
  };

  const handleRecognizeSketch = async () => {
    if (!canvasImage) {
      setError('请先完成草图绘制');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('开始识别草图');
      const result = await recognizeSketchFeatures(canvasImage);
      console.log('草图识别完成');
      // 过滤识别结果，仅保留需要的字段（移除风格特征）
      const filteredAnalysis = {
        ...result,
        structured_analysis: {
          main_object: result.structured_analysis?.main_object || '(未识别)',
          composition: result.structured_analysis?.composition || '(未识别)',
          details: result.structured_analysis?.details || '(未识别)'
        }
      };
      setAnalysis(filteredAnalysis);
      setStep2Completed(true);
    } catch (err) {
      setError(err.message || '识别失败');
      console.error('识别失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!analysis) {
      setError('请先完成草图识别');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('开始生成图片');
      // ========== 关键修改1：构建最终的prompt（强制替换风格） ==========
      const finalPrompt = `
主体: ${analysis.structured_analysis.main_object}
构图: ${analysis.structured_analysis.composition}
细节: ${analysis.structured_analysis.details}
增强: ${analysis.structured_analysis.suggestions || '无'}
风格: ${styleFeatureMap[style]} 【强制要求：忽略草图原有风格，严格按照此风格特征生成】
质量要求: 高清、细节丰富、色彩协调、专业级别
用户补充描述: ${userDescription || '无'}
      `.trim();

      // ========== 关键修改2：传递finalPrompt给API ==========
      const result = await generateImageFromSketch(
        canvasImage,        // 草图图片
        finalPrompt,        // 替换为包含用户风格的完整prompt
        style,              // 风格名称（备用）
        size,               // 图片尺寸
        styleFeatureMap[style] // 风格特征（兜底）
      );
      console.log('图片生成完成');
      setGeneratedImage(result);
    } catch (err) {
      setError(err.message || '生成失败');
      console.error('生成失败:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sketch-editor">
      <div className="editor-header">
        <h3>🖌️ 智能草图转图生成</h3>
        <p className="tip">
          🎯 三步流程：绘制草图 → AI识别特征 → 生成高质量图像
        </p>
      </div>

      <div className="progress-steps">
        <div className={`step ${step1Completed ? 'done' : 'active'}`}>
          <div className="step-circle">1</div>
          <p>绘制草图</p>
        </div>
        <div className="step-line" />
        <div className={`step ${!step1Completed ? '' : step2Completed ? 'done' : 'active'}`}>
          <div className="step-circle">2</div>
          <p>识别特征</p>
        </div>
        <div className="step-line" />
        <div className={`step ${!step2Completed ? '' : 'active'}`}>
          <div className="step-circle">3</div>
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
          <h4 className="step-title">🔍 步骤2：识别草图特征</h4>
            <button
            className="btn-next"
            onClick={handleRecognizeSketch}
            disabled={!canvasImage || loading}
            >
            {loading ? '⏳ 识别中...' : '识别特征 →'}
            </button>

          {analysis && (
            <div className="analysis-panel">
              <div className="analysis-section">
                <div className="analysis-content">
                  <div className="analysis-item">
                    <strong>主要对象:</strong>
                    <p>{analysis.structured_analysis?.main_object || '(未识别)'}</p>
                  </div>
                  <div className="analysis-item">
                    <strong>构图特点:</strong>
                    <p>{analysis.structured_analysis?.composition || '(未识别)'}</p>
                  </div>
                  <div className="analysis-item">
                    <strong>细节特征:</strong>
                    <p>{analysis.structured_analysis?.details || '(未识别)'}</p>
                  </div>
                  <div className="raw-analysis">
                    <details>
                      <summary>📋 完整分析报告</summary>
                      <pre>{analysis.raw_analysis}</pre>
                    </details>
                  </div>
                </div>
              </div>

              <div className="generation-config">
                <h4>⚙️ 生成配置</h4>
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
                    <option value="realistic">逼真风格</option>
                    <option value="oil_painting">油画</option>
                    <option value="watercolor">水彩</option>
                    <option value="pencil_sketch">铅笔素描</option>
                    <option value="cartoon">卡通</option>
                    <option value="3d">3D 渲染</option>
                  </select>
                </div>
                <div className="config-item">
                  <label>图片尺寸</label>
                  <select value={size} onChange={(e) => setSize(e.target.value)}>
                    <option value="1920x1920">1920×1920 (标准)</option>
                    <option value="2K">2K (推荐)</option>
                    <option value="4K">4K (高清)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`step-panel step-3 ${!step2Completed ? 'disabled' : ''}`}>
          <h4 className="step-title">🎨 步骤3：生成高质量图像</h4>
            <button
            className="btn-next"
            onClick={handleGenerateImage}
            disabled={!step2Completed || loading}
            >
            {loading ? '⏳ 生成中...' : '生成图像 →'}
            </button>

          {generatedImage && (
            <div className="result-panel">
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
