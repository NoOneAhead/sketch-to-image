import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import imageRoutes from './routes/image.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 定义允许的来源列表
const allowedOrigins = [
  'http://localhost:5173', // 你的前端应用运行在 5173 端口
  'http://localhost:3000', // 如果你有其他前端应用或者在开发过程中会用到
  'https://sketch-to-image-liart.vercel.app/'
];

// 中间件
app.use(cors({
  origin: function (origin, callback) {
    // 允许没有 origin 的请求 (例如，移动应用或 Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// 日志中间件
app.use((req, res, next) => {
  console.log(`\n📊 ${req.method} ${req.path}`);
  console.log(`   时间: ${new Date().toLocaleTimeString()}`);
  next();
});

// 路由
app.use('/api/images', imageRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: '豆包视觉识别服务 (Seed-2.0-mini)'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('❌ 错误:', err);
  res.status(500).json({
    success: false,
    error: err.message,
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`\n🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎨 视觉识别模型: Doubao-Seed-2.0-mini`);
  console.log(`✅ 就绪！\n`);
});
