# 🛒 E-Commerce AI Image Generator

**AI驱动的电商产品图生成器** - 一键生成专业级商业摄影图片

[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Pinia](https://img.shields.io/badge/Pinia-2.x-FFD859)](https://pinia.vuejs.org/)

## ✨ 核心功能

### 🎯 智能产品分析
- **Product Insight Engine**: AI自动识别产品类别、材质、特征
- **缺陷反转协议**: 自动将旧样品描述为全新商品状态
- **色彩提取**: 自动分析产品主色调

### 🎨 专业级 Prompt 架构
- **11层权重系统**: Core Subject → Color Fidelity → Quality → Lighting → Scene...
- **智能去重**: 自动消除冲突关键词 (如 16K vs 8K)
- **Deep Vision DNA**: 物理相机参数 (镜头/光圈) + 品牌禁忌系统

### 🖼️ 多模式生成
- **快速生成**: 一键生成单张高质量图片
- **高级生成**: 自定义场景、光照、构图
- **营销套图**: Amazon/社媒模板，批量生成多张

### 🔗 多图融合
- **产品 + 场景**: 将产品融入背景图
- **产品 + 模特**: 生成模特使用产品的图片
- **一致性系统**: 跨多张图保持风格统一

### 🎯 色彩保真 (Reference Image API)
- **参考图像传递**: 产品原图作为视觉参考传入生成模型
- **行为指令**: 强制模型从参考图学习精准颜色
- **无冲突策略**: 文字Prompt不再描述颜色，避免信号冲突

---

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 pnpm

### 安装
```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/ecommerce-image-generator.git
cd ecommerce-image-generator

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### API 配置
1. 打开应用后点击右上角 **API 设置**
2. 选择 Provider:
   - **Google Native**: 直接使用 Google AI Studio API Key
   - **OpenRouter**: 使用 OpenRouter 统一入口
3. 输入 API Key
4. 测试连接

---

## 📖 使用教程

### 1. 上传产品图片
- 点击"上传产品图片"区域
- 支持 JPG/PNG/WebP 格式
- 建议使用清晰的产品正面图

### 2. AI 自动分析
- 系统自动识别产品类别和特征
- 提取产品材质、纹理、颜色信息
- 生成产品描述 Prompt

### 3. 选择生成设置
| 设置项 | 说明 |
|--------|------|
| **场景** | 纯白背景 / 生活场景 / 户外 / 节日氛围 |
| **光照** | 柔光箱 / 自然光 / 戏剧光 |
| **质量** | 标准 / 高清 / 超高清 (16K) |
| **比例** | 1:1 / 4:3 / 16:9 / 9:16 |
| **颜色校正** | ✅ 开启 (推荐) - 强制保持产品原色 |

### 4. 生成图片
- 点击"生成"按钮
- 等待 AI 生成（通常 10-30 秒）
- 预览结果，可下载或重新生成

### 5. 高级功能

#### 多图融合
1. 开启"图像融合"开关
2. 上传场景参考图 / 模特参考图
3. 选择融合模式
4. 生成融合效果图

#### 营销套图
1. 进入"营销企划"模块
2. 选择模板 (Amazon Listing / 社媒故事)
3. 自定义每个槽位的风格
4. 批量生成整套图片

---

## 🏗️ 技术架构

```
src/
├── agents/              # AI Agent 系统
│   ├── DirectorAgent    # 营销策略生成
│   ├── PlannerAgent     # 内容规划
│   └── VisionQAAgent    # 质量检测
├── services/
│   ├── geminiClient     # Gemini/OpenRouter API 封装
│   ├── promptBuilder    # 11层 Prompt 构建器
│   └── productInsightEngine  # 产品智能分析
├── stores/              # Pinia 状态管理
│   ├── generationStore  # 生成流程控制
│   ├── fusionStore      # 多图融合
│   └── consistencyStore # 一致性系统
└── components/          # Vue 组件库
```

---

## 🔧 配置说明

### 支持的模型
| Provider | 分析模型 | 生成模型 |
|----------|----------|----------|
| Google Native | gemini-3-flash-preview | gemini-3-pro-image-preview |
| OpenRouter | google/gemini-3-flash-preview | google/gemini-3-pro-image-preview |

### 环境变量 (可选)
```env
VITE_DEFAULT_API_KEY=your_api_key
VITE_DEFAULT_PROVIDER=google
```

---

## 📝 更新日志

### v1.2.0 (2026-01-22)
- ✨ 新增 Reference Image API 支持
- ✨ 颜色保真策略优化（行为指令替代颜色描述）
- 🐛 修复产品切换时的缓存数据残留问题
- 🐛 修复 Prompt 关键词冲突（16K/8K 重复）

### v1.1.0
- ✨ Deep Vision 2.0 (物理相机参数 + 品牌禁忌)
- ✨ 缺陷反转协议
- ✨ 11层权重 Prompt 架构

---

## 📄 License

MIT License - 自由使用，请保留原作者信息

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
