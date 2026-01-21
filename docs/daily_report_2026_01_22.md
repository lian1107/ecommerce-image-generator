# Daily Development Report - E-commerce Image Generator
**Date**: 2026-01-22
**Status**: Critical Logic Updates & Core Engine Refinement

##我自己的思考色彩还原、产品保持一致

## 🚀 Today's Key Updates & Solved Problems

We focused on the "Brain" of the application—the AI logic and Prompt Engineering architecture—to ensure commercial-grade output quality.

### 1. The "Flaw Inversion" Protocol (Defect Elimination)
*   **Problem**: The AI was too honest. It saw a scratched old watch sample and wrote "scratched surface" in the prompt, causing the generated image to also look damaged.
*   **Solution**: Implemented a **Reverse Psychology** logic in `ProductInsightEngine`.
    *   **Logic**: Detect "Scratches" -> Output "**Pristine, Flawless Surface**".
    *   **Logic**: Detect "Dust" -> Output "**Polished, Clean Finish**".
    *   **Logic**: Detect "Wear" -> Output "**Brand New, Mint Condition**".
*   **Result**: Inputting a battered sample now produces a brand-new looking product image.

### 2. V3.0 Color Fidelity Architecture (Color Accuracy)
*   **Problem**: Even with "Color Correction" on, the AI's "artistic license" often changed specific brand colors (e.g., specific Teal became generic Green).
*   **Solution**:
    *   **New Architecture**: Added an 11th layer to the prompt builder: **`COLOR_FIDELITY`**.
    *   **High Weight**: Assigned a massive weight of **1.45** (higher than Style or Scene).
    *   **Critical Instructions**: Injects commands like "CRITICAL: Exact color reproduction" and specific hex/color names from the analysis.
    *   **Data Flow**: Fixed `productStore` to correctly save and pass the `colorPalette` from AI analysis.

### 3. Smart Prompt Deduplication (Conflict Resolution)
*   **Problem**: Prompts were contradictory and repetitive (e.g., "16k resolution" AND "8k resolution" AND "Studio Lighting" AND "Natural Sunlight" appeared together).
*   **Solution**:
    *   **Source Control**: Restricted `ProductInsightEngine` to ONLY describe the subject, banning it from hallucinating lighting or resolution.
    *   **Conflict Logic**: Implemented a "Conflict Map" in `PromptBuilder`.
        *   If "16k" exists, it blocks "8k/4k".
        *   If "Natural Sunlight" exists, it blocks "Studio Lighting".
*   **Result**: Prompts are now clean, logical, and surgically precise.

### 4. "Ghost Data" Elimination (State Management)
*   **Problem**: Deleting a product image (e.g., Watch) and uploading a new one (e.g., Remote) didn't clear the old analysis data, leading to mismatched prompts.
*   **Solution**:
    *   **Auto-Reset**: Removing the last image now wipes all AI-derived data (Features, Prompts, Colors).
    *   **Force Analysis**: Uploading a new "primary" image now forces a fresh AI analysis loop, ignoring stale cache.

### 5. API Logic Stabilization
*   **Problem**: OpenRouter API calls failed due to incorrect model prefixes.
*   **Solution**: Implemented strict model name normalization (`google/gemini...`) in `geminiClient`.

---

## 🔮 Future Roadmap: What's Next?

### Phase 1: Interactive Editing (Immediate Focus)
*   **Canvas Editor Integration**: 
    *   Allow users to post-edit generated images.
    *   **Remove Background**: One-click background removal (using remove.bg or local AI).
    *   **Text Overlay**: Add marketing copy/logos directly on top of the generated image.
    *   **Composition Control**: Drag-and-drop the product to change its position before generation (ControlNet integration?).

### Phase 2: Advanced "Deep Vision" Controls
*   **Optical Lab UI**: 
    *   Expose the "Physical Camera" parameters (Lens, Aperture/Bokeh) to the UI.
    *   Allow users to manually select "50mm Portrait Lens" or "24mm Wide Angle".
*   **Negative Constraint Manager**:
    *   Allow users to define "Brand Taboos" (e.g., "Never show red background", "Never use cartoon style") that persist across sessions.

### Phase 3: Workflow Automation
*   **Batch Generation**: 
    *   "Generate 4 Variations for each of these 10 products".
*   **Marketing Set Workflow**:
    *   Auto-generate a full set (1 Main, 1 Detail, 1 Lifestyle) from a single click.

---

## 📂 Documentation Structure
A new documentation folder structure is recommended to keep track of these complex logic flows:

*   `docs/architecture/prompt_engine_v3.md`: Explaining the 11-layer weight system.
*   `docs/architecture/deep_vision_flow.md`: How the "Flaw Inversion" works.
*   `docs/api/openrouter_integration.md`: API specifics for future reference.
