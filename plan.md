### **角色**

你是一位**资深全栈架构师**，专精于 React + Tailwind 项目的前期规划。你的职责是**在写任何代码之前**，先对需求进行全面拆解，输出可执行的开发计划。

### **背景**

我即将开发一个 **“出海老板MBTI诊断工具”** ，是一个 React + Tailwind + Framer Motion 的单页应用，包含5个页面（欢迎页、答题页、加载页、结果页、留资弹窗）。我需要你在 **不写任何代码** 的前提下，完成技术方案的拆解与规划。

### **任务**

请阅读以下完整需求（见下方【需求原文】），然后按照以下6个模块输出规划文档：

1. **页面状态机设计**：定义所有页面状态（`welcome | questions | loading | result | lead`），以及状态转换的触发条件（用户点击、倒计时结束等）
2. **数据结构定义**：定义核心数据模型，包含：
  - `question`：题目对象（id、text、type、options、dimension）
  - `answer`：答案记录（questionId、value）
  - `result`：诊断结果（type、dimensions、content）
  - `lead`：留资信息（name、phone、wechat）
3. **组件树拆解**：列出所有需要创建的组件及其层级关系（至少包含：Welcome、QuestionCard、ProgressBar、ScaleSelector、ResultHero、DimensionRadar、ActionPlan、LeadModal）
4. **状态管理方案**：确定使用 useState + Context 还是 Zustand，并说明理由
5. **第三方库依赖清单**：列出所有需要安装的依赖（react、framer-motion、recharts、tailwindcss 等）及其版本建议
6. **文件结构规划**：给出 src/ 目录下的文件组织方式（组件放在哪、数据放在哪、样式放在哪）

### **约束**

- **严格禁止编写任何实际代码**（不能有 JSX、CSS、Tailwind 类名、函数实现）
- **只输出规划文档**，用 Markdown 格式，结构清晰
- 所有规划必须是 **“可执行的”** ——即开发者看完后可以直接按此开工
- 对不确定的技术选型，给出 **“推荐方案 + 备选方案 + 推荐理由”**

### **需求原文**

角色 你是一位拥有5年经验的前端UI专家，专精于 React + Tailwind CSS 的高品质产品界面开发。你的设计风格对标 Linear / Raycast / Apple Human Interface——极简、克制、有呼吸感、每一个像素都有意图。

背景 我正在开发一款面向中国工厂老板的出海机会诊断工具，产品形态是 "MBTI风格"的人格测试App。核心逻辑已定（24题 → 四维评分 → 5种画像 → 诊断报告）。现在需要你实现全部前端UI，要求：

视觉对标16Personalities，但更高级（深色模式优先）

所有交互动效丝滑（Framer Motion级别）

移动端优先（老板在手机上填）

桌面端也要优雅（自动适配）

任务 请输出 完整的React + Tailwind CSS 代码，实现以下 5个页面/视图，并确保所有交互逻辑完整可跑。

【页面1：欢迎页（Landing）】 UI要求：

全屏深色渐变背景（从 #0B0B0F 到 #1A1A2E）

居中布局，垂直居中

顶部：一个极简Logo（用文字"出·海"或几何图形，纯白/浅紫）

中间：大标题 "测一测你的出海机会" ，字体粗细 font-extrabold，字号 text-4xl/sm:text-5xl，颜色 text-white

副标题："4个维度 · 24道题 · 5分钟" ，颜色 text-neutral-400，字号 text-sm/sm:text-base

底部：一个 "开始诊断" 按钮

样式：渐变紫（from-indigo-500 to-purple-600），圆角 rounded-full，内边距 px-8 py-4

悬停：轻微上浮 + 阴影扩大（hover:translate-y-[-2px] hover:shadow-2xl）

点击：涟漪效果或轻微缩放反馈

右下角：极简版权/品牌名，text-neutral-600，字号 text-xs

动效要求：

页面加载时：标题从 opacity-0 translate-y-4 → opacity-100 translate-y-0，延迟100ms

副标题延迟200ms，按钮延迟300ms

背景有微弱的渐变浮动动画（CSS keyframes，周期8s）

【页面2：答题页（Questions）】 UI要求：

顶部：进度条 + 题号

进度条：细条（h-1），底色 neutral-800，填充色 gradient，宽度根据 currentQuestion / totalQuestions 动态计算

题号：text-neutral-400 text-sm，如 "3 / 24"

中间：题目卡片

背景：bg-neutral-900/60，带毛玻璃效果（backdrop-blur-sm）

圆角：rounded-2xl

内边距：p-6 sm:p-8

题目文字：text-white text-lg/sm:text-xl font-medium，行高 leading-relaxed

选项区：李克特量表 1-5 或 单选按钮（根据题型动态切换）

量表：5个圆形按钮横排，w-12 h-12 rounded-full，未选状态 bg-neutral-800 text-neutral-400，选中状态 bg-indigo-500 text-white，悬停 ring-2 ring-indigo-400/50

单选：卡片式选项，选中时边框变为 border-indigo-500，背景变为 bg-indigo-500/10

底部："下一题" 按钮（最后一题显示 "查看报告" ）

样式：与欢迎页按钮一致，但尺寸稍小（px-6 py-3）

未选时置灰（opacity-40 cursor-not-allowed），选后亮起

动效要求：

切题时：卡片从右侧滑入（translate-x-4 → 0）+ 淡入，持续时间250ms

选项悬停：微缩放（scale-105）

选中：对勾出现动画（scale-0 → scale-100，spring缓动）

进度条填充：平滑过渡（transition-all duration-500）

【页面3：加载/计算页（Loading）】 UI要求：

全屏深色背景，居中

一个动态脉冲环（三个同心圆环依次放大并淡出，类似雷达）

颜色：text-indigo-400

周期：1.5s 循环

下方文字："正在分析你的出海基因..." ，text-neutral-300 text-sm

下方小字："这一步需要3秒" ，text-neutral-600 text-xs

3秒后自动跳转结果页

【页面4：结果页（Result）——核心页面，设计最重】 整体布局： 上下结构，可滚动，深色背景 bg-[#0B0B0F]

区块1：顶部Hero（震撼弹）

大号标签：text-5xl/sm:text-7xl font-black，显示画像名+Emoji（如 🏠 家有良田）

副标题：一行精炼总结（如 "产能扎实，但看不见海外客户"），text-neutral-400 text-base/sm:text-lg

四维雷达图或条形图（用 recharts 或纯SVG）

四个维度：产能底气、市场嗅觉、行动惯性、决策算账

雷达图填充色 rgba(99,102,241,0.3)，边框 #6366F1

四个顶点标注维度名，text-neutral-300 text-xs

区块2：资源盘点

标题：✅ 你的家底，text-emerald-400 font-semibold

内容：3-4行子弹点（text-neutral-200 text-sm/sm:text-base），每个点前带 • 或 ✓，颜色 text-neutral-400

区块3：唯一缺口

标题：📌 你唯一要补的，text-amber-400 font-semibold

内容：1-2句话，text-neutral-200，背景 bg-amber-500/5，左侧4px border-l-2 border-amber-400，内边距 pl-4

区块4：机会路径

标题：🎯 你的机会路径，text-indigo-400 font-semibold

内容：1个核心策略，text-neutral-200 text-base/sm:text-lg font-medium

区块5：具体动作（3步）

三个步骤卡片，横向排列（移动端纵向）

每个卡片：bg-neutral-900/60 rounded-xl p-4，左侧带数字序号圆标（w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-sm font-bold）

内容：text-neutral-300 text-sm

区块6：真诚提醒

标题：💡 说句实在话，text-rose-400/80 font-semibold

内容：1段话，text-neutral-400 text-sm，背景 bg-rose-500/5 rounded-xl p-4，左侧边框 border-l-2 border-rose-400/40

区块7：行动包钩子（终极钩子）

整体卡片：渐变边框（border border-indigo-500/30），背景 bg-indigo-500/5 rounded-2xl p-6

标题：📦 你的出海第一步行动包，text-white font-bold

内容：3项清单（text-neutral-300 text-sm），每项前带 ▸

底部按钮："领取行动包"

样式：全宽，渐变紫，rounded-full py-4

点击后：弹窗或跳转留资页（留资逻辑后续接）

区块8：底部

"重新测试" 链接：text-neutral-500 text-sm underline-offset-2 hover:text-neutral-300

【页面5：留资弹窗/页（Lead Capture）】 UI要求：

模态框居中，毛玻璃背景（bg-black/60 backdrop-blur-sm）

卡片：bg-neutral-900 rounded-2xl p-8 max-w-sm w-full

标题："领取你的行动包"，text-white text-xl font-bold

说明："顾问将在2小时内微信联系你，发资料无销售话术"，text-neutral-400 text-sm

三个输入框：姓名、手机号、微信号（均 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white）

提交按钮：全宽渐变紫 rounded-full py-3

关闭按钮：右上角 ×，text-neutral-500 hover:text-white

【全局设计系统（Design Tokens）】 类别	值 字体	Inter（通过 @next/font 或 CDN 加载），fallback system-ui 主色	Indigo 500 (#6366F1) → Purple 600 (#9333EA) 强调色	Emerald 400（正面）、Amber 400（警告）、Rose 400（提醒） 背景色	#0B0B0F（主）、#1A1A2E（次）、#27273E（卡片） 文字色	white（主）、neutral-300（次）、neutral-500（弱） 圆角	卡片 rounded-2xl，按钮 rounded-full 阴影	大卡片 shadow-2xl shadow-indigo-500/5 过渡	默认 transition-all duration-200 ease-out 【技术实现约束】 框架：React 18+（使用函数组件 + Hooks）

样式：Tailwind CSS 3+（使用 @apply 指令减少重复）

动效：Framer Motion（motion 组件实现页面/元素级动画）

图表：Recharts（雷达图）

状态管理：React useState + useContext（或 Zustand，轻量即可）

路由：无需路由，用状态机控制页面切换（'welcome' | 'questions' | 'loading' | 'result' | 'lead'）

移动端：使用 sm:、md: 断点，所有卡片 px-4 sm:px-6，触摸目标 ≥44px

代码规范：全部在一个 App.jsx + 一个 index.css 中完成（便于Cursor单文件生成）

【示例代码片段（Framer Motion页面切换）】 jsx <motion.div   key={currentPage}   initial={{ opacity: 0, y: 20 }}   animate={{ opacity: 1, y: 0 }}   exit={{ opacity: 0, y: -20 }}   transition={{ duration: 0.35, ease: 'easeOut' }}

>

  {renderPage()} </motion.div> 【最终输出要求】 请生成 一个完整的、可直接运行的React项目，包含：

package.json（依赖：react, react-dom, framer-motion, recharts, tailwindcss）

tailwind.config.js（含自定义颜色、字体、动画）

src/App.jsx（全部页面逻辑 + 状态管理）

src/index.css（Tailwind基础 + 自定义动画 + 全局字体）

所有静态文本（24题、5种画像诊断内容）以内联 data.js 或直接写在组件中