# 🎨 智能草图转图像系统

一个基于人工智能的创新应用，可以将你手绘的草图转换成高质量的AI生成图像。使用先进的计算机视觉和生成式AI技术，让创意无限可能。

## ✨ 主要功能

### 1. **草图绘制** 📝
- 直观的在线画布编辑器
- 可调节笔刷大小（1-20px）
- 自定义笔刷颜色
- 实时绘制预览
- 一键清空画布

### 2. **AI识别特征** 🔍
- 自动识别草图中的物体和场景
- 生成详细的图像描述
- 展示识别置信度
- 支持用户编辑和完善描述

### 3. **智能图像生成** 🖼️
- 多种艺术风格选择：
  - 📸 写实风格
  - 🎭 卡通风格
  - 🎨 水彩风格
  - 🖌️ 油画风格
  - ✨ 奇幻风格
  - 🤖 赛博朋克风格
- 多种分辨率选项：
  - 1920×1920（标准）
  - 2K（推荐）
  - 4K（高清）
- 图像下载功能

## 🎯 使用流程

```
1️⃣ 绘制草图 → 2️⃣ 识别特征 → 3️⃣ 生成图像
```

三个步骤可随时切换，流程灵活，用户体验友好。

## 🚀 快速开始

### 前置条件
- Node.js 18+ 
- npm 或 yarn
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 本地开发安装

#### 1. 克隆项目
```bash
git clone https://github.com/YOUR_USERNAME/sketch-to-image.git
cd sketch-to-image
```

#### 2. 安装依赖
```bash
# 安装前端依赖
npm install

# 如果需要，安装后端依赖
cd server
npm install
cd ..
```

#### 3. 配置环境变量

创建 `.env.local` 文件（前端）：
```env
VITE_API_URL=http://localhost:5000
```

创建 `server/.env` 文件（后端）：
```env
PORT=5000
DOUBAO_API_KEY=your_api_key_here
```

> 获取 `DOUBAO_API_KEY`：访问 [豆包官网](https://www.doubao.com) 申请 API 密钥

#### 4. 启动开发服务器

**终端1 - 启动后端：**
```bash
cd server
npm start
```

**终端2 - 启动前端：**
```bash
npm run dev
```

#### 5. 访问应用
打开浏览器访问：[http://localhost:5173](http://localhost:5173)

## 🌐 线上部署

### 使用 Vercel + Render 部署（推荐）

#### 前端部署到 Vercel

1. 将代码推送到 GitHub
2. 访问 [vercel.com](https://vercel.com)
3. 导入你的 GitHub 仓库
4. 配置环境变量：
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
5. 点击 Deploy

#### 后端部署到 Render

1. 访问 [render.com](https://render.com)
2. 创建新的 Web Service
3. 连接你的 GitHub 仓库
4. 配置构建和启动命令：
   - Build Command: `npm install`
   - Start Command: `npm start`
5. 添加环境变量（DOUBAO_API_KEY）
6. 点击 Deploy

详细步骤见 [部署指南](./DEPLOYMENT.md)

## 📋 项目结构

```
sketch-to-image/
├── src/                          # 前端源代码
│   ├── components/
│   │   ├── SketchEditor.jsx      # 草图编辑器组件
│   │   └── App.jsx               # 主应用组件
│   ├── api/
│   │   └── services.js           # API 调用服务
│   ├── styles/
│   │   ├── App.css               # 应用样式
│   │   └── SketchEditor.css      # 编辑器样式
│   └── main.jsx                  # 入口文件
├── server/                       # 后端源代码
│   ├── server.js                 # 服务器主文件
│   ├── routes/
│   │   └── image.js              # 图像处理路由
│   ├── services/
│   │   ├── doubaoService.js      # 豆包 API 服务
│   │   └── doubaoVisionService.js # 豆包视觉识别服务
│   └── package.json
├── package.json                  # 前端依赖配置
└── README.md                     # 项目文档
```

## 🛠️ 技术栈

### 前端
- **React 18** - UI 框架
- **Vite** - 构建工具
- **CSS3** - 样式处理
- **Fetch API** - HTTP 请求

### 后端
- **Node.js** - 运行时环境
- **Express.js** - Web 框架
- **CORS** - 跨域资源共享
- **豆包 API** - AI 模型服务

## 🔑 API 集成

### 豆包 (Doubao) API

本项目使用豆包的两个主要 API：

1. **图像理解 API** - 识别草图中的物体和场景
2. **图像生成 API** - 根据描述生成高质量图像

[豆包官方文档](https://www.doubao.com/docs)

## 📸 功能截图

### 步骤 1: 绘制草图
- 清晰的画布编辑界面
- 实时笔刷预览
- 调节笔刷参数

### 步骤 2: 识别特征
- AI 自动识别物体
- 显示识别详情
- 用户可编辑描述

### 步骤 3: 生成图像
- 选择艺术风格
- 选择图像分辨率
- 下载生成的图像

## ⚙️ 配置选项

### 笔刷大小
- 范围：1-20 像素
- 实时调整

### 笔刷颜色
- 支持所有 RGB 颜色
- 颜色选择器选择

### 图像风格
- 写实、卡通、水彩、油画、奇幻、赛博朋克

### 图像分辨率
- 1920×1920（标准）
- 2K（推荐）
- 4K（高清）

## 🐛 故障排除

### 问题1：后端无法连接
**解决方案：**
- 检查后端服务是否正在运行
- 确认 `VITE_API_URL` 环境变量设置正确
- 检查防火墙设置

### 问题2：图像识别失败
**解决方案：**
- 确保 `DOUBAO_API_KEY` 有效
- 检查 API 配额是否充足
- 查看浏览器控制台错误信息

### 问题3：CORS 错误
**解决方案：**
- 确保后端已启用 CORS
- 检查 `server.js` 中的 CORS 配置

### 问题4：Canvas 绘制无反应
**解决方案：**
- 刷新页面
- 清除浏览器缓存
- 尝试使用其他浏览器

## 📝 环境变量说明

### 前端 (.env.local)
```env
# API 服务器地址
VITE_API_URL=http://localhost:5000  # 开发环境
VITE_API_URL=https://api.example.com # 生产环境
```

### 后端 (.env)
```env
# 服务器端口
PORT=5000

# 豆包 API 密钥
DOUBAO_API_KEY=your_api_key_here

# 可选：其他配置
NODE_ENV=development
```

## 🎓 学习资源

- [React 官方文档](https://react.dev)
- [Vite 官方文档](https://vitejs.dev)
- [Express.js 官方文档](https://expressjs.com)
- [豆包 API 文档](https://www.doubao.com/docs)

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 贡献步骤：
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 👨‍💻 作者

**Your Name** - [@YourGitHub](https://github.com/NoOneAhead)


## 🙏 致谢

感谢以下项目和服务的支持：
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [Express.js](https://expressjs.com)
- [豆包 AI](https://www.doubao.com)

## 📊 项目统计

[![GitHub stars](https://img.shields.io/github/stars/NoOneAhead/sketch-to-image?style=flat-square)](https://github.com/NoOneAhead/sketch-to-image/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/NoOneAhead/sketch-to-image?style=flat-square)](https://github.com/NoOneAhead/sketch-to-image/network)
[![GitHub issues](https://img.shields.io/github/issues/NoOneAhead/sketch-to-image?style=flat-square)](https://github.com/NoOneAhead/sketch-to-image/issues)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](./LICENSE)

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**

**🚀 祝你使用愉快！**
"""
