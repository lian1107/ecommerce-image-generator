# 电商智能生图系统 (E-commerce AI Image Generator) - 项目全景文档

> 最后更新时间: 2026-01-19
> 当前版本: v2.1.0 (Marketing Set Release)

本文档旨在提供项目的全面技术概览，记录已开发功能详情、架构设计以及未来规划。

---

## 1. 项目概览

本项目是一个基于 **Vue 3 + TypeScript + Pinia** 的生产级电商 AI 生图应用。核心目标是利用 **Gemini 3 Pro** (通过 OpenRouter 或 Google API) 的多模态能力，解决电商场景下的"一致性"和"套图生成"痛点。

### 核心价值
*   **一致性控制**: 确保同一个产品在不同图片中长得一样。
*   **多图融合**: 将产品、模特、场景三者完美融合。
*   **营销工作流**: 一键生成成套的高转化率电商图（主图、场景图、细节图）。

---

## 2. 系统架构

### 2.1 目录结构与职责
```
src/
├── services/            
│   ├── geminiClient.ts  # [核心] API 客户端，处理多模态(图片+文本)请求，支持 OpenRouter/Google
│   ├── promptBuilder.ts # [核心] 10层分层提示词构建器 (Layered Prompt Architecture)
│   └── semanticEngine.ts # 语义分析，用于自动补全 Prompt
├── stores/              # 状态管理 (Pinia)
│   ├── apiStore.ts      # API Key 与 连接状态
│   ├── productStore.ts  # 产品基础信息
│   ├── settingsStore.ts # 全局生成设置 (尺寸、数量、质量)
│   ├── sceneStore.ts    # 场景选择逻辑
│   ├── modelStore.ts    # [v2.0] 模特管理与推荐
│   ├── fusionStore.ts   # [v2.0] 多图融合状态
│   ├── consistencyStore.ts # [v2.1] 一致性系统状态
│   └── marketingStore.ts   # [v2.1] 营销套图工作流
├── components/
│   ├── pages/           # 页面级组件 (AdvancedPage, QuickPage)
│   ├── marketing/       # 营销与 Slot 组件
│   ├── consistency/     # 一致性面板
│   └── fusion/          # 融合面板
```

### 2.2 核心服务逻辑
*   **GeminiClient**: 封装了 `generateImage` 和 `generateBatch`。支持传入 `referenceImages` (Base64) 用于一致性控制。
*   **PromptBuilder**: 采用"分层叠加"模式构建 Prompt。
    *   `CORE_SUBJECT` + `MODEL` + `FUSION` + `CONSISTENCY` + `SCENE` ... = `Final Prompt`
    *   权重控制：Prompt 中不同层级的权重不同，确保主体最清晰。

---

## 3. 功能模块详情 (Feature Deep Dive)

### ✅ 模块 1: 基础生图 (Basic Generation)
*   **状态**: 完成
*   **描述**: 输入产品信息 + 选择预设场景 -> 生成图片。
*   **特性**: 
    *   支持 6 大类场景 (Studio, Lifestyle, Outdoor...)。
    *   九层提示词自动组装。

### ✅ 模块 2: 一致性系统 (Consistency System)
*   **状态**: Phase 1 完成
*   **入口**: `AdvancedPage` -> `Consistency` Tab
*   **核心逻辑**:
    *   允许上传 3-5 张产品参考图。
    *   **Mode**: 支持 Style (风格), Character (角色/模特), Color (色调), Brand (品牌) 四种一致性模式。
    *   **实现**: 将图片转为 Base64 传入 API 的 `image_url` 列表，配合 "maintain consistency with reference images" 提示词。

### ✅ 模块 3: 多图融合 (Multi-Image Fusion)
*   **状态**: Phase 2 完成
*   **入口**: `AdvancedPage` -> `Fusion` Tab
*   **核心逻辑**:
    *   支持 **产品图 + 场景图 + 模特图** 三合一融合。
    *   实现了复杂的 Prompt 拼接逻辑，自动平衡三者的权重。
    *   支持 "Only Product" (纯产品融合) 和 "Product + Scene" 等多种模式。

### ✅ 模块 4: 营销套图工作流 (Marketing Set Workflow)
*   **状态**: Phase 3 完成 (最新)
*   **入口**: `AdvancedPage` -> `Marketing` Tab
*   **核心逻辑**:
    *   **Auto-Director (智能导演)**: 预设 "Amazon Listing", "Social Story" 等模版。
    *   **Slot System**: 每个模版包含若干 Slot (如 Main, Detail, Lifestyle)。
    *   **Focus Description**: 用户可为每个 Slot 指定 "Focus Point" (如: 拍拉链细节)。
    *   **Batch Generation**: 一键生成整套图片，自动应用一致性系统产生的参考图。

### ✅ 模块 5: 模特管理 (Model Management)
*   **状态**: 完成
*   **核心逻辑**:
    *   支持选择模特特征 (Gender, Age, Ethnicity)。
    *   根据产品类别自动推荐模特 (e.g., 卖口红推荐女性)。

---

## 4. 待开发规划 (Roadmap & Pending Items)

以下是我们探讨过但尚未完全开发或计划在未来版本实现的功能：

### 🛠️ 营销套图 Phase 2 (优化版)
*   [ ] **混合尺寸支持**: 目前全套图统一尺寸。未来支持 Slot 1 是方形 (1:1)，Slot 2 是竖屏 (9:16)。
*   [ ] **构图参考**: 允许上传一张"线稿"或"构图参考图"来控制构图 (ControlNet-like)。

### 🛠️ 一致性系统 Phase 2 (高级版)
*   [ ] **局部重绘 (Inpainting)**: 生成后发现手部有问题？支持在应用内直接框选重绘。
*   [ ] **更精细的角色控制**: 分离"脸部一致性"和"服装一致性"。
*   [ ] **参考图库**: 保存常用的参考图组（如"2026春季新品组"），不用每次重新上传。

### 🛠️ 画布编辑器 (Canvas Editor)
*   [ ] **类 Photoshop 简易编辑**: 支持在生图后添加文字、Logo、简单拼图。
*   [ ] **背景移除/替换**: 集成专门的 RemoveBG 工具。

### 🛠️ 系统工程
*   [ ] **用户系统**: 保存云端历史记录。
*   [ ] **队列管理**: 处理 API Rate Limit，支持后台排队生成。

---

## 5. 常用开发指令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 类型检查
npm run type-check
```

此文档旨在帮助后续开发者快速理解项目全貌。如有新功能添加，请及时更新。
