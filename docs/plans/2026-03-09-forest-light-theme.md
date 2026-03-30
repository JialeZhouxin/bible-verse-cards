# 浅绿清新森林主题 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将当前前端视觉升级为“浅绿清新 + 森林感”主题，保证中文显示稳定、移动端可读性与交互一致性不回退。

**Architecture:** 采用“设计令牌优先”的改造方式：先重构 `:root` 主题变量，再逐层映射到页面背景、卡片、按钮和弹窗，避免散落硬编码。通过最小结构调整（可选装饰层）增加森林氛围，不改动现有核心业务流程（抽卡、保存、分享、历史）。

**Tech Stack:** HTML5, CSS3 (Custom Properties, Gradient, Media Query), 原生 JavaScript, Node.js（用于中文文案校验脚本）

---

### Task 1: 建立森林主题设计令牌基线

**Files:**
- Modify: `src/styles.css`
- Reference: `index.html`

**Step 1: 写“失败前置检查”（基线记录）**

运行：
```bash
rg "--bg-main|--accent|--paper|--line" "E:/02_Projects/litter/heart/src/styles.css"
```
预期：看到当前暖色变量，尚未出现森林绿系变量命名（例如 `--forest-*`）。

**Step 2: 最小实现主题变量重构**

在 `:root` 中新增并替换为浅绿系变量（示例命名，最终以实现为准）：
- `--forest-bg-main`
- `--forest-bg-secondary`
- `--forest-paper`
- `--forest-accent`
- `--forest-line`
- `--forest-text-primary`

并保持现有变量对外语义不变（兼容原组件引用），避免大范围选择器改写。

**Step 3: 运行检查确认变量已接管**

运行：
```bash
rg "forest|#([0-9a-fA-F]{6})" "E:/02_Projects/litter/heart/src/styles.css"
```
预期：主色值以浅绿系为主，关键组件不再依赖旧暖橙主色。

---

### Task 2: 页面背景升级为“轻森林氛围”

**Files:**
- Modify: `src/styles.css`

**Step 1: 写“失败前置检查”**

运行：
```bash
rg "body\s*\{|radial-gradient|linear-gradient" "E:/02_Projects/litter/heart/src/styles.css"
```
预期：当前背景仍偏暖色纸感。

**Step 2: 最小实现森林背景层**

更新 `body` 背景为多层渐变：
- 顶部浅绿漫射光（radial）
- 侧向叶影层（低透明度 radial/linear）
- 底层浅青绿主渐变（linear）

要求：
- 不使用高饱和深绿，保持“清新可读”优先
- 保留文本对比度 AA 级别可读

**Step 3: 验证背景是否生效**

运行：
```bash
rg "rgba\(|linear-gradient|radial-gradient" "E:/02_Projects/litter/heart/src/styles.css"
```
预期：存在 3 层以上渐变且色相落在浅绿/青绿区间。

---

### Task 3: 卡片与筛选区视觉统一（浅绿纸卡）

**Files:**
- Modify: `src/styles.css`

**Step 1: 写“失败前置检查”**

运行：
```bash
rg "filter-btn|card-container|history-section|modal-content" "E:/02_Projects/litter/heart/src/styles.css"
```
预期：按钮高亮与边框仍沿用旧暖色风格。

**Step 2: 最小实现组件映射**

更新以下组件到统一森林语义：
- `.filter-section`, `.history-section`, `.card-container`, `.modal-content`：纸卡浅绿底 + 低饱和边框
- `.filter-btn` 与 `.filter-btn.active`：默认浅绿描边，激活为叶绿渐变
- `.btn`, `.btn-secondary`：主次按钮对比明确，hover 仅做轻位移和阴影
- `.level-1/2/3`：同色系分层（浅->中），避免突兀红橙

**Step 3: 验证未引入视觉回归风险**

运行：
```bash
rg "#([0-9a-fA-F]{6})" "E:/02_Projects/litter/heart/src/styles.css"
```
预期：高饱和暖色值显著减少，组件层级仍可区分。

---

### Task 4: 夜间模式与新主题兼容

**Files:**
- Modify: `src/styles.css`
- Reference: `src/main.js`

**Step 1: 写“失败前置检查”**

运行：
```bash
rg "data-theme='dark'|themeToggleBtn" "E:/02_Projects/litter/heart/src/styles.css" "E:/02_Projects/litter/heart/src/main.js"
```
预期：存在暗色变量和切换逻辑。

**Step 2: 最小实现暗色森林映射**

在 `:root[data-theme='dark']` 中将变量映射到深墨绿/灰绿，不改 JS 切换逻辑。

要求：
- 文本亮度足够（避免暗绿底+灰字）
- 主题切换按钮文案继续保持中文

**Step 3: 验证切换逻辑零改动**

运行：
```bash
rg "themeToggleBtn|localStorage|data-theme" "E:/02_Projects/litter/heart/src/main.js"
```
预期：JS 文件无功能性改动需求，仅依赖 CSS 变量即可生效。

---

### Task 5: 三档真机视口微调（360/390/430）

**Files:**
- Modify: `src/styles.css`

**Step 1: 写“失败前置检查”**

运行：
```bash
rg "@media" "E:/02_Projects/litter/heart/src/styles.css"
```
预期：已有基础响应式规则，但未针对三档森林主题细调。

**Step 2: 最小实现分档调参**

为以下断点添加或微调规则：
- `max-width: 360px`：缩小标题、卡片内边距、按钮最小高度
- `361px-390px`：平衡字重与行高，避免折行挤压
- `391px-430px`：增强留白与层次，避免空旷

**Step 3: 验证无布局断裂**

运行：
```bash
npm run build
```
预期：构建通过，无 CSS 语法错误。

---

### Task 6: 中文显示与可用性回归验证

**Files:**
- Verify: `index.html`
- Verify: `src/ui/render.js`
- Run: `scripts/check-ui-chinese.js`

**Step 1: 中文文案校验**

运行：
```bash
node "E:/02_Projects/litter/heart/scripts/check-ui-chinese.js"
```
预期：`PASS`，未检测到英文 UI 文案回退。

**Step 2: 编码与入口校验**

运行：
```bash
rg "charset=\"UTF-8\"|lang=\"zh-CN\"|app.bundle.js|main.js" "E:/02_Projects/litter/heart/index.html"
```
预期：UTF-8、中文语言标识、双入口加载策略完整。

**Step 3: 手工验收清单**

按以下顺序手工检查：
1. 直接双击 `index.html`（`file://`）页面中文不乱码。
2. 点击“抽取卡牌/保存回答/分享/清空”全流程可用。
3. 切换“夜间护眼/暖色模式（或新文案）”视觉正常。
4. 在 360x800、390x844、430x932 三档下文字不截断、按钮不重叠。

---

### Task 7: 文档同步（最小必要）

**Files:**
- Modify: `README.md`（如存在主题截图或描述）

**Step 1: 更新主题说明**

补充“浅绿清新森林主题”说明，强调：
- 中文优先显示
- 三档移动端调参
- 夜间主题兼容

**Step 2: 最终验证**

运行：
```bash
git -C "E:/02_Projects/litter/heart" diff -- "README.md" "src/styles.css" "index.html"
```
预期：改动集中在样式与文档，业务逻辑无额外复杂化（KISS/YAGNI）。

---

## 验收标准（Definition of Done）

1. 默认主题为浅绿清新，页面具备明显森林氛围但不影响阅读。  
2. 所有前端可见文案保持中文且无乱码。  
3. 抽卡、保存、分享、历史、清空流程行为与改造前一致。  
4. 夜间模式与新主题共存，无对比度问题。  
5. 360/390/430 三档视口无明显布局问题。  

## 原则落地说明

- **KISS:** 只改样式层，不重写业务流程。  
- **YAGNI:** 不引入新依赖和复杂主题引擎。  
- **DRY:** 通过 CSS 变量集中管理配色与阴影。  
- **SOLID（前端层面）:** 样式与行为分离，JS 逻辑保持单一职责。  
