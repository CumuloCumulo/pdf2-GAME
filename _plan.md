你是一个全栈开发工程师。请创建一个**前端+简单后端**应用。

## 需求规格
# Game Design Art Skill Deck Spec

## 应用概述
- 名称：Game Design Art Skill Deck
- 领域：游戏设计教育与专业发展
- 一句话描述：一款帮助游戏设计师系统学习和应用《游戏设计艺术》中专业技能的收集与训练应用
- 知识来源：《游戏设计艺术（第2版）》技能索引

## 数据源
- Skills 来源：Jesse Schell《游戏设计艺术》技能索引
- 条目数量：72种核心游戏设计技能
- 覆盖范围评估：全面覆盖游戏设计理论、实践、团队协作、测试方法论等关键领域
- 是否需要模型兜底：否 - 所有技能条目已结构化定义

## 核心功能清单
### 必须
- 图片上传：支持拍照/相册/拖拽，JPG/PNG/WEBP，最大 10MB
- AI 识别：调用多模态视觉模型，输出技能名称+分类+描述
- 图鉴卡片收藏：识别后生成卡牌，用户确认点亮
- 图鉴展示墙：7大分区展示全部可收集游戏设计技能

### 可选
1. 翻卡动画 - 识别结果翻卡呈现
2. 稀有度评分 - 按技能难度计分
3. 收集进度与成就 - 进度条、里程碑
4. 分享海报 - 生成技能分享卡片
5. 收藏推荐 - 推荐下一个学习目标

## 图鉴分区
| 层级 | 图标 | 名称 | 内容 | 数量 |
|------|------|------|------|------|
| 1 | 🎯 | 设计基础 | 游戏设计理论与方法论 | 12 |
| 1 | 🧠 | 心理与动机 | 玩家心理学与动机设计 | 8 |
| 1 | 🏗️ | 机制系统 | 游戏机制与系统设计 | 15 |
| 1 | 🎭 | 叙事角色 | 叙事设计与角色塑造 | 10 |
| 1 | 🌐 | 世界构建 | 游戏世界与空间设计 | 7 |
| 1 | 👥 | 社交系统 | 多人游戏与社区设计 | 8 |
| 1 | 🔍 | 测试评估 | 游戏测试与评估方法 | 12 |

## 稀有度与评分
| 等级 | 分值范围 | 色系 | 代表技能 |
|------|---------|------|-----------|
| 初级 | 10-20 | 绿色 | 设计术语标准 |
| 中级 | 21-40 | 蓝色 | 谜题设计原则 |
| 高级 | 41-60 | 紫色 | 不对称设计 |
| 专家 | 61-80 | 橙色 | 跨媒体IP设计 |
| 大师 | 81-100 | 金色 | 游戏社会影响分析 |

## 卡片 Schema
### 必填字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | 唯一标识 |
| name | string | 技能名称 |
| category | string | 所属分区 |
| description | string | 技能描述 |
| image_url | string | 用户原图（base64） |
| collected_at | timestamp | 收藏时间 |
| source | enum | 来源：skills / model / manual |
| score | number | 积分 |
| rarity | enum | 稀有度 |
| difficulty | number | 学习难度(1-5) |
| application | string | 使用场景描述 |

### 可选字段
- theory_depth: 理论深度评分
- practice_value: 实践价值评分
- case_studies: 关联案例
- expert_tips: 专家提示

## 数据库结构
```javascript
{
  id: 'game-design-lenses',
  name: '游戏设计透镜',
  category: '设计基础',
  description: '应用游戏设计透镜工具集评估和改进设计',
  difficulty: 3,
  rarity: '中级',
  score: 35,
  application: '系统性审视设计、发现问题、寻找改进方向'
}
```

## 识别策略
```
用户上传图片
    ↓
调用多模态视觉模型
    → 输入：图片 + 系统提示词（含技能上下文）
    → 输出：技能名称 + 特征
    ↓
Skills 匹配
    ├── 命中 → 数据库填充完整字段，source: "skills"
    └── 未命中 → 模型输出兜底，source: "model"
    ↓
卡片生成 → 展示 → 用户确认 → 点亮图鉴
```

## 收藏与成就机制
- 收集模式：图鉴点亮 - 收集即点亮，追求全收集
- 重复收集：可重复，累加积分
- 成就系统：
  - 新手设计师：收集10个技能
  - 资深设计师：收集30个技能
  - 设计大师：收集全部72个技能
  - 专项精通：单个分类全收集

## 视觉风格
### 基调
- 游戏开发工作室风格
- 暗色主题 + 霓虹点缀
- 像素艺术元素

### 色彩
- 主色：#2A2D43
- 强调色：#6D72C3
- 稀有度色系：绿→蓝→紫→橙→金

### 布局
- 移动端优先
- 图鉴墙 Grid：mobile 2列, tablet 3列, desktop 4列
- 卡牌比例 3:4

## 页面结构
```
[首页]
├─ [收集] —— 相机/相册入口
├─ [图鉴] —— 技能分类墙
│   ├─ [设计基础]
│   ├─ [...]
│   └─ [测试评估]
├─ [成就] —— 收集里程碑
└─ [我的] —— 个人统计
```

## 错误处理
| 场景 | 处理 |
|------|------|
| 识别失败/超时 | 提示重试 |
| 识别为空 | 提示换照片 |
| Skills 未匹配 | 模型兜底 |
| 图片格式或大小不符 | 提示用户 |

## 构建检查清单
- [ ] 上传预览正常
- [ ] 识别返回完整
- [ ] 点亮后刷新不丢
- [ ] 分区渲染正确
- [ ] 已/未点亮区分明显
- [ ] 进度统计准确
- [ ] 移动端适配
- [ ] 错误提示友好

## 工作空间说明
需求规格已在上方给出，不要重复阅读。工作空间中可能还有其他参考文件，请按需查阅。

## 通用规范
1. 直接编写文件，不要输出 Markdown 代码块
2. 前端用户输入做 XSS 转义
3. **不要在本地启动服务来测试或调试**，直接编写正确的代码即可
4. **不要尝试安装依赖**。如果需要新增依赖，只需在 `pyproject.toml` 的 `dependencies` 中添加即可，系统会在构建时自动安装。如果必须安装依赖来做静态检查，必须使用 `uv` (例如 `uv pip install ...`)，**绝对禁止**使用 `pip install`
5. **必须**在完成后:
   - 停止并退出所有启动的服务和进程
   - 清理所有临时文件、日志、缓存等调试产物
   - 确保不留下任何运行中的后台进程
6. **架构以本规范为准**，如果需求规格中提到了其他技术栈或架构 (如 Flask、Django、Express 等)，
   请忽略并统一使用本规范指定的技术栈。需求规格中只有业务功能描述是有效的，技术选型以本规范为准
7. **禁止创建或修改 Dockerfile**。系统会自动提供标准化的 Dockerfile 进行构建，你不需要也不允许生成任何 Dockerfile。如果工作空间中已有 Dockerfile，不要修改它
8. **路径规范 (极其重要)**:
   - **所有代码文件必须使用相对路径创建在当前工作目录下**，例如 `main.py`、`static/index.html`、`pyproject.toml`
   - **绝对禁止**使用 `/root/` 等绝对路径来创建或写入代码文件
   - 你的当前工作目录就是项目根目录，直接用相对路径即可
   - 代码中引用运行时数据目录时，使用环境变量 `APP_DATA_DIR` ，这是容器运行时的路径，不是你编码时的路径
9. **写入文件的策略 (极其重要)**:
   - **单次工具调用写入的内容不要超过 25600 字**，超过必须拆分为多次写入
   - 大量静态数据（如配置列表、数据库条目、图标集、多语言文本等）必须拆分为独立的数据文件（如 `data/xxx.json`），由代码在运行时加载，**不要内联到代码文件中**
   - 如果单个文件较大，先用 Write 写入核心骨架，再用 Edit 工具分段追加剩余内容
   - **任何工具调用失败时，禁止用相同方式反复重试超过 2 次**。必须换一种方式，例如:
     - Write 失败 → 改用 Bash heredoc (`cat > file << 'EOF'`) 写入
     - 单次写入太大 → 拆成多个小文件，或先写骨架再 Edit 追加
     - Edit 匹配失败 → 先 Read 确认文件当前内容，再用精确的匹配串重试
   - 遇到反复失败时，先停下来分析错误原因，再选择不同的策略，不要机械重复
10. **善用 MCP 工具提升效率**:
   - 遇到不熟悉的库或 API，使用 `mcp__context7__resolve-library-id` + `mcp__context7__query-docs` 查询最新文档，避免生成过时代码
   - 需要查阅在线文档或参考资料时，使用 `mcp__fetch__fetch` 抓取网页内容
   - 处理复杂的 JSON 数据文件时，使用 `mcp__jq__*` 系列工具进行精确查询和操作


## 后端规范
1. 使用 **FastAPI** 创建 `main.py`，监听 `0.0.0.0:8000`
2. 使用 `pyproject.toml` 管理依赖 (用 uv 安装)，示例:
   ```toml
   [project]
   name = "app"
   version = "0.1.0"
   requires-python = ">=3.11"
   dependencies = [
       "fastapi",
       "uvicorn",
   ]
   ```
3. **不要**创建 requirements.txt，统一用 pyproject.toml
4. 后端 API 做基本的输入校验和长度限制
5. **禁止同步阻塞式处理耗时请求**。本服务运行在单进程 uvicorn 中，任何阻塞都会导致整个服务无响应:
   - LLM 调用、文件处理等耗时操作**必须**使用 SSE (Server-Sent Events) 流式返回，或使用 `asyncio` 异步处理
   - **禁止**在请求处理函数中使用 `time.sleep()` 或同步等待
   - 对于 OpenAI SDK 的调用，使用 `AsyncOpenAI` 客户端配合 `await`，或使用 `stream=True` 流式返回
   - 如果某个操作确实需要较长时间，返回任务 ID 让前端轮询结果，而不是让请求一直挂着
6. 安装 Python 包时**必须使用阿里云内网镜像**:
   - pip: `pip install -i http://mirrors.cloud.aliyuncs.com/pypi/simple/ --trusted-host mirrors.cloud.aliyuncs.com <包名>`
   - uv: `uv pip install --index-url http://mirrors.cloud.aliyuncs.com/pypi/simple/ --trusted-host mirrors.cloud.aliyuncs.com <包名>`


## 数据持久化
1. **不要使用内存存储**，所有数据必须持久化到文件
2. 数据目录通过环境变量 `APP_DATA_DIR` 获取，**不要硬编码绝对路径**
3. 使用 JSON 文件存储结构化数据，例如:
   ```python
   import json, os
   DATA_DIR = os.environ.get("APP_DATA_DIR", "/app/app_data")
   os.makedirs(DATA_DIR, exist_ok=True)
   ```
4. 启动时从文件加载已有数据，实现重启后数据不丢失
5. **用户数据优先存储在前端 `localStorage`**，天然按浏览器隔离，无需后端 session 机制。后端尽量保持无状态。如果必须在后端存储用户数据，则通过 cookie session 按用户隔离，禁止所有用户共享同一份数据


## LLM 调用 (OpenAI Compatible，多模型)
1. 通过后端调用 LLM，**绝对禁止**在前端代码中出现任何 API Key
2. 从环境变量读取配置:
   - `LLM_API_KEY`: API 密钥 (所有模型共用)
   - `LLM_BASE_URL`: API 基础地址 (所有模型共用，如 `http://new-api:3000/v1`)
   - `LLM_MODEL_CHAT`: 文本对话模型 (默认 `gpt-4o-mini`)
   - `LLM_MODEL_VISION`: 图片理解模型 (默认 `gpt-4o`)
   - `LLM_MODEL_IMAGE_GEN`: 图片生成模型 (默认 `dall-e-3`)
   始终假设用户使用非 OpenAI 官方的 API 地址，如果让用户自行填写也需要用户填写 API_KEY、BASE_URL、MODEL_CHAT 等用到的模型
3. 使用 `openai` Python SDK，所有模型共用同一个 client:
   ```python
   import os
   from openai import OpenAI

   client = OpenAI(
       api_key=os.environ["LLM_API_KEY"],
       base_url=os.environ.get("LLM_BASE_URL", "https://api.openai.com/v1"),
   )

   MODEL_CHAT = os.environ.get("LLM_MODEL_CHAT", "gpt-4o-mini")
   MODEL_VISION = os.environ.get("LLM_MODEL_VISION", "gpt-4o")
   MODEL_IMAGE_GEN = os.environ.get("LLM_MODEL_IMAGE_GEN", "dall-e-3")
   ```
4. 根据功能需求选择合适的模型:
   - 普通文本对话用 `MODEL_CHAT`
   - 需要理解图片时用 `MODEL_VISION`
   - 需要生成图片时用 `MODEL_IMAGE_GEN` (通过 `client.images.generate()`)
5. 在 pyproject.toml 的 dependencies 中加入 `"openai>=1.0"`
6. **`max_tokens` 不要设置得太保守**，现代 LLM 上下文窗口已达数百 K，对话类场景建议 `max_tokens=4096` 或更高，不要设为 256/512 这种过小的值导致回复被截断
7. **必须捕获 LLM API 调用异常**，并向前端返回有意义的错误信息，至少处理以下情况:
   - `openai.RateLimitError` → 429，提示频率限制
   - `openai.AuthenticationError` → 401，提示密钥问题
   - `openai.APIStatusError` → 透传 status_code 和 message，特别注意余额不足 (BudgetExceeded / InsufficientQuota) 要明确提示用户
   - `openai.APIConnectionError` → 502，提示无法连接 AI 服务
   - 通用 `Exception` 兜底 → 500，记录日志
8. **前端调用 LLM 相关接口时，必须有完善的等待状态和防误操作机制**:
   - 发起请求后立即显示加载动画 (如 spinner、骨架屏、脉冲动画或"AI 思考中..."提示)
   - 请求期间**必须禁用触发按钮** (disabled + 灰色/半透明样式)，防止重复提交
   - 输入框在请求期间应禁用或设为只读
   - 图片生成等耗时较长的操作，显示预估等待提示 (如"图片生成中，通常需要 10-30 秒...")
   - SSE 流式返回时，保持加载指示器直到流结束才恢复按钮可用状态
   - 请求完成 (无论成功或失败) 后，必须恢复按钮和输入框的可用状态


## 前端规范
   前端文件放在 `static/` 目录，通过 FastAPI 的 StaticFiles 挂载。
   主页面为 `static/index.html`，通过 `/` 路由返回。
   CSS 文件如 `static/css/style.css`，JS 文件如 `static/js/app.js`。
   确保 HTML 中引用的相对路径在 StaticFiles 挂载后能正确访问。

1. 使用**纯 HTML + CSS + JavaScript**，不使用任何需要编译的框架
2. **前端代码必须分离为独立文件**，禁止将所有内容塞进一个巨大的 HTML 文件:
   - CSS 样式抽取到独立的 `.css` 文件
   - JavaScript 逻辑抽取到独立的 `.js` 文件
   - HTML 文件只保留页面结构，通过 `<link>` 和 `<script>` 引用外部 CSS/JS
   - 如果 JS 逻辑较复杂，按功能拆分为多个 JS 文件 (如 `api.js`、`ui.js` 等)
3. 可以使用 CDN 引入的库 (DaisyUI, Tailwind CSS, Alpine.js, htmx, marked.js 等)
   **CSS 框架必须使用 DaisyUI + Tailwind CSS，通过 BootCDN 引入** (国内 CDN，稳定可访问):
   ```html
   <link href="https://cdn.bootcdn.net/ajax/libs/daisyui/5.1.25/daisyui.css" rel="stylesheet">
   <link href="https://cdn.bootcdn.net/ajax/libs/daisyui/5.1.25/themes.css" rel="stylesheet">
   <script src="https://cdn.bootcdn.net/ajax/libs/tailwindcss-browser/4.1.13/index.global.min.js"></script>
   ```
   - DaisyUI 提供语义化组件类 (如 `btn`, `card`, `modal`, `input`, `badge` 等)，优先使用
   - Tailwind utility class (如 `flex`, `p-4`, `text-lg`) 用于微调布局
   - 通过 HTML `data-theme` 属性选择一个与应用内容契合的 DaisyUI 主题，专注打磨该主题下的视觉效果
   - 图标库可使用 BootCDN 上可用的图标库 (如 Bootstrap Icons、Remixicon 等) 或内联 SVG/emoji
   - **禁止**使用 `cdn.jsdelivr.net`、`cdn.tailwindcss.com`、Google Fonts、Font Awesome CDN 等境外资源
   - **所有 CDN 引用必须使用经过验证的、中国大陆可访问的地址**，优先使用 BootCDN (`cdn.bootcdn.net`) 或 npmmirror (`registry.npmmirror.com`)。不确定时宁可用内联 SVG/emoji 替代，也不要猜测 CDN 地址
4. **禁止**在前端 JS 中硬编码任何密钥、内部地址等敏感信息
5. **必须兼容手机浏览器** (iOS Safari 和 Android Chrome):
   - 添加 `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
   - 响应式布局，小屏幕下自适应
   - 触屏交互友好 (按钮/输入框足够大，间距合理)
   - 避免使用 hover-only 的交互方式
6. **必须做好完善的错误提示，方便调试**:
   - 所有 `fetch` 请求必须有 `.catch()` 或 `try/catch` 处理，网络异常时在页面上显示用户可见的错误提示 (toast / alert / 错误区域)，同时 `console.error` 输出详细信息 (请求 URL、状态码、响应体)
   - API 返回非 2xx 状态码时，读取响应体中的错误信息并展示给用户，不要只显示"请求失败"这种笼统提示
   - SSE / EventSource 连接必须监听 `onerror` 事件，断开时提示用户并 `console.error` 输出详情
   - 页面加载时如果依赖的后端接口不可用，显示明确的连接失败提示而不是空白页面
   - 表单提交、按钮操作等用户交互失败时，必须给出具体的失败原因，禁止静默失败
   - 建议封装统一的 `showError(message)` 和 `logError(context, error)` 函数
7. **涉及对话/交互内容时，利用浏览器存储保持上下文**:
   - 使用 `localStorage` 缓存当前对话内容、会话 ID、用户输入草稿等，刷新页面后能恢复上下文
   - 页面加载时优先从本地存储读取上次的会话状态，再与后端同步
   - 提供**清除当前对话**和**新建对话**的操作入口
   - 如果有多轮对话，提供对话历史列表，支持切换、删除历史对话
   - 本地存储数据量超出合理大小时自动清理最早的记录
8. **必须实现二维码分享功能**:
   - 在页面合适位置放置"分享"入口，图标和样式应与应用主题契合
   - 点击后弹出 modal，展示一张包含二维码的分享图片
   - 通过 CDN 引入 `qrcodejs` 和 `html2canvas-pro` (支持 oklch 等现代 CSS 颜色):
     ```html
     <script src="https://cdn.bootcdn.net/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
     <script src="https://registry.npmmirror.com/html2canvas-pro/1.6.7/files/dist/html2canvas-pro.min.js"></script>
     ```
   - **二维码的 URL 直接使用 `window.location.href`**，无需后端参与
   - 先用 HTML/CSS 排版分享卡片 (二维码 + 应用相关内容)，风格与当前应用契合
   - 如果应用有用户数据/成就/统计信息，分享卡片中应包含关键数据摘要，方便用户炫耀和分享
   - 用 `html2canvas` 将卡片截图转为 `<img>` 标签展示在 modal 中
   - 提示用户"长按图片保存"(移动端) 或"右键保存图片"(桌面端)，这是主要的保存方式
9. **前端设计应有明确的美学方向，避免千篇一律的 AI 生成感**:
   - 编码前先确定美学方向: 这个应用的用途、受众是什么？应该给人什么感觉？找到一个让人印象深刻的设计切入点
   - 每个应用的设计都应该是独特的，在风格、配色、布局上做出差异化选择，禁止趋同
   - 配色要大胆有主次，用 CSS 变量管理，主色突出、点缀色鲜明，避免平均分配的灰调。禁止使用"紫色渐变+白底"等 AI 生成的陈词滥调配色
   - 背景要营造氛围和层次感，善用渐变、噪点纹理、几何图案、半透明叠加等手法，避免单调纯色白底
   - 排版注重层次和留白，善用不对称布局、卡片错落、网格变化、元素重叠等手法，避免所有内容等宽居中堆叠
   - 适当使用 CSS 动画增强体验 (入场渐显、交错动画、滚动触发、hover 反馈等)，聚焦在高影响力的时刻
   - 细节上可使用阴影、圆角、装饰性边框、自定义光标等视觉元素，与整体风格保持一致
   所有 LLM 交互必须通过后端 API 代理，前端只调用本服务的 API


## 前端+简单后端专属要求

### 后端
1. 根据需求实现必要的 RESTful API
2. 如果需求中不涉及 LLM，则不要引入 openai 依赖
3. 如果需求中涉及 LLM 调用，按 LLM 调用规范中的多模型配置使用
4. 添加 CORS 中间件

### 前端
1. 使用 DaisyUI + Tailwind CSS 美化界面 (CDN 引入方式见前端规范)
