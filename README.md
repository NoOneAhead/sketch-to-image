AI创意生成器（sketch-to-image）

一款基于AI的草图生成工具，支持手绘草图快速转化为创意图片，采用「前端Vercel部署+后端Render部署+阿里云域名绑定」架构，国内可正常访问，无需复杂配置即可上手使用。

🎯 项目简介

AI创意生成器（sketch-to-image）核心功能是「手绘草图→AI创意生成」，用户只需绘制简单的线条草图，选择风格、输入描述，即可快速生成高质量、有创意的图片，适配个人创意设计、手账制作、产品原型预览等场景。

✅ 核心优势：

- 极简操作：手绘草图即可生成，无需专业设计能力

- 多风格支持：涵盖超写实、卡通、赛博朋克、水彩等多种风格

- 国内可访问：基于Vercel+Render+阿里云域名，搭配优化配置，国内访问稳定

- 开源可扩展：代码结构清晰，可轻松扩展新风格、新功能

🌐 在线访问

直接访问部署好的在线版本，无需本地部署：

https://qiansuo.top

🚀 快速使用

1. 访问 https://qiansuo.top，进入手绘页面；

2. 使用左侧手绘工具，绘制简单草图（如杯子、人物、风景等）；

3. 选择生成风格，输入创意描述（如「超写实风格，透明玻璃材质，光影细腻」）；

4. 点击「生成图片」，等待3-10秒，即可获得AI生成的创意作品；

5. 生成完成后，可下载作品、重新绘制或调整参数再次生成。

🔧 本地部署（可选）

若需本地开发或二次开发，可按以下步骤部署：

前置依赖

- Node.js 16+

- npm / yarn

- Git

- 火山方舟 ARK_API_KEY（用于AI生成，需自行申请）

步骤1：克隆代码

git clone https://gitee.com/NoOneAhead/sketch-to-image.git
cd sketch-to-image

步骤2：部署后端（Node.js/Express）

# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
# 新建 .env 文件，添加以下内容
ARK_API_KEY=你的火山方舟API密钥
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
PORT=5000

# 启动本地后端服务
npm run dev
# 启动成功后，后端地址：http://localhost:5000

步骤3：部署前端（Vite/React/Vue）

# 回到项目根目录，进入前端目录
cd ../frontend

# 安装依赖
npm install

# 配置环境变量
# 新建 .env 文件，添加以下内容
VITE_API_URL=http://localhost:5000

# 启动本地前端服务
npm run dev
# 启动成功后，访问：http://localhost:5173

📌 注意事项

- .env 文件包含敏感信息（API密钥），已添加到 .gitignore，请勿提交到仓库；

- 线上部署后，修改环境变量需重新部署对应服务（Vercel/Render）；

- 火山方舟API有调用额度限制，若生成失败，可检查API额度或更换密钥；

✨ 功能扩展建议

- 新增风格库：添加更多小众风格（如古风、像素、肌理风）；

- 草图辅助：增加网格线、形状辅助、图层管理功能；

- 作品管理：添加收藏、批量下载、分享功能；

- 参数优化：增加创意度调节、分辨率调节功能。

📞 反馈与支持

若使用过程中遇到问题，或有功能建议，可通过以下方式反馈：

- Gitee仓库：https://gitee.com/NoOneAhead/sketch-to-image（提交Issues）

感谢使用 AI创意生成器，祝您创作愉快！ 🎨
