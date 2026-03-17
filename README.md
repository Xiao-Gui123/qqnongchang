# QQ 农场种菜推荐助手 (Mobile First)

这是一个专门为 QQ 农场玩家设计的种菜推荐工具，旨在帮助玩家合理规划种植时间，最大化收益。

## 🌟 核心功能

- **智能推荐**：基于当前时间，结合土地等级和化肥使用情况，推荐最适合种植的作物。
- **倒推规划**：设定目标收获时间（如 18:00），系统自动计算种植方案。
- **作物百科**：收录所有作物时长（4/8/12/24h）及季数逻辑。
- **灵活配置**：支持普通/黑/金土地（10%/20% 时间缩短）及化肥催熟计算。
- **移动优先**：专为移动端设计的 UI，操作顺滑。

## 🛠️ 技术栈

- **前端框架**: React + TypeScript
- **状态管理**: Zustand (持久化存储)
- **样式**: Tailwind CSS
- **构建工具**: Vite

## 🚀 部署到 Cloudflare Pages

本项目非常适合部署在 Cloudflare Pages 上。

### 1. 关联 GitHub
将此仓库上传到 GitHub 后，在 Cloudflare Pages 控制台中选择该仓库。

### 2. 构建设置
- **框架预设 (Framework preset)**: `Vite`
- **构建命令 (Build command)**: `npm run build`
- **输出目录 (Build output directory)**: `dist`
- **根目录 (Root directory)**: `/`

### 3. 环境变量 (可选)
通常不需要额外配置。

## 📦 本地开发

1. 安装依赖:
   ```bash
   npm install
   ```

2. 启动开发服务器:
   ```bash
   npm run dev
   ```

3. 构建项目:
   ```bash
   npm run build
   ```
