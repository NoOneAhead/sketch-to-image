import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import imageRoutes from './routes/image.js';
import { createServer } from 'http';

// 加载环境变量（支持自定义 .env 文件路径）
dotenv.config({ path: '.env' });

// 初始化 Express 应用
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ========== 核心配置优化 ==========
// 1. CORS 白名单从环境变量读取（更灵活）
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000,https://sketch-to-image-liart.vercel.app').split(',');

// 2. CORS 配置增强（生产环境严格校验）
const corsOptions = {
  origin: function (origin, callback) {
    // 开发环境允许所有来源（方便调试）| 生产环境严格校验白名单
    if (NODE_ENV === 'development') return callback(null, true);
    
    // 允许无 origin 请求（Postman/移动端）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      const errMsg = `CORS 策略拒绝来自 ${origin} 的请求，仅允许: ${allowedOrigins.join(', ')}`;
      callback(new Error(errMsg), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 显式允许常用方法
  allowedHeaders: ['Content-Type', 'Authorization'], // 显式允许常用请求头
  maxAge: 86400 // 预检请求缓存时间（24小时，减少OPTIONS请求）
};

// ========== 中间件 ==========
// CORS 中间件
app.use(cors(corsOptions));

// 请求体解析（按环境调整限制，生产环境更严格）
const bodyLimit = NODE_ENV === 'production' ? '20mb' : '50mb';
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ limit: bodyLimit, extended: true }));

// 增强版日志中间件（区分环境，生产环境简化输出）
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleString();
  if (NODE_ENV === 'development') {
    console.log(`\n📊 [${timestamp}] ${req.method} ${req.path}`);
    console.log(`   来源: ${req.headers.origin || '未知'}`);
    console.log(`   IP: ${req.ip}`);
  } else {
    // 生产环境仅输出关键日志（便于日志采集）
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  }
  next();
});

// ========== 路由 ==========
// 业务路由
app.use('/images', imageRoutes);

// 健康检查（增强返回信息）
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: '豆包视觉识别服务 (Seed-2.0-mini)',
    environment: NODE_ENV,
    port: PORT,
    uptime: process.uptime() // 服务运行时长（秒）
  });
});

// 404 处理（补充未匹配路由的响应）
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `接口 ${req.method} ${req.path} 不存在`,
    timestamp: new Date().toISOString()
  });
});

// ========== 错误处理 ==========
// 全局错误处理（区分环境返回错误信息）
app.use((err, req, res, next) => {
  // 统一错误日志格式
  console.error(`\n❌ [${new Date().toLocaleString()}] 错误:`, err.stack || err.message);
  
  // 生产环境隐藏详细错误信息
  const errorMsg = NODE_ENV === 'production' 
    ? '服务器内部错误，请稍后重试' 
    : err.message;

  res.status(err.statusCode || 500).json({
    success: false,
    error: errorMsg,
    timestamp: new Date().toISOString(),
    // 开发环境返回额外调试信息
    ...(NODE_ENV === 'development' && { path: req.path, method: req.method })
  });
});

// ========== 服务器启动 & 优雅关闭 ==========
const server = createServer(app);

// 启动服务器
server.listen(PORT, () => {
  console.log(`\n🚀 服务器启动成功！`);
  console.log(`📡 地址: http://localhost:${PORT}`);
  console.log(`📝 环境: ${NODE_ENV}`);
  console.log(`🎨 模型: Doubao-Seed-2.0-mini`);
  console.log(`🔒 CORS 白名单: ${allowedOrigins.join(', ')}`);
  console.log(`✅ 服务就绪！\n`);
});

// 优雅关闭（处理 SIGINT/SIGTERM 信号，避免强制退出）
const gracefulShutdown = (signal) => {
  console.log(`\n⚠️  收到 ${signal} 信号，开始优雅关闭服务器...`);
  server.close((err) => {
    if (err) {
      console.error('❌ 服务器关闭失败:', err);
      process.exit(1);
    }
    console.log('✅ 服务器已安全关闭');
    process.exit(0);
  });
};

// 监听终止信号
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// 捕获未处理的 Promise 错误
process.on('unhandledRejection', (reason, promise) => {
  console.error(`\n❌ 未处理的 Promise 错误:`, promise);
  console.error(`原因:`, reason);
});