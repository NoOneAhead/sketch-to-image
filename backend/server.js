const express = require('express');
const cors = require('cors');
const app = express();

// 环境变量
require('dotenv').config();
const PORT = process.env.PORT || 5000;

// ============ CORS 配置 ============
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://sketch-to-image-liart.vercel.app'  // 替换为你的前端地址
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ============ 中间件 ============
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============ 健康检查 ============
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ============ API 路由 ============
const imageRoutes = require('./routes/images');
app.use('/api/images', imageRoutes);

// ============ 错误处理 ============
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// ============ 启动服务器 ============
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
