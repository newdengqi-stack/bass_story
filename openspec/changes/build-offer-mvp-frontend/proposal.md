## Why

Offer MVP 的前端目前只覆盖了 8 条路由：落地页、登录、工作台、目标岗位创建（含 JD 解析确认），以及四个只有说明文案的占位页。规格 `docs/product/易职_UI设计规格.md` 定义的 19 个页面里，还有 11 个 P0 页面没有实现。

结果是产品讲得通、走不通：用户能从落地页到工作台，但点开导航任意一项都停在占位页；"项目证据验证"——这个产品唯一的核心业务（需求书 §4.3）——连一个可交互的界面都还没有。本变更补齐剩余 P0 页面，让 Offer 准备闭环在界面上真正可走完。

## What Changes

**新增 11 个 P0 页面**

| 页面 | 路由 | 规格编号 |
|---|---|---|
| 注册 | `/register` | P02（后半） |
| 首次引导向导 | `/onboarding` | P03 |
| 资产档案总览 | `/profile` | P07 |
| 简历导入与确认 | `/profile/resume` | P08 |
| 项目档案与证据提交 | `/projects/[id]` | P09 |
| 深挖开始页 | `/projects/[id]/start` | P10 |
| 追问会话页 | `/projects/[id]/session` | P11 |
| 项目证据报告 | `/projects/[id]/report` | P12 |
| 差距与冲刺计划 | `/gap` | P13 |
| 简历建议与专版简历 | `/resume/tailor` | P14 |
| 账户设置 | `/settings` | P15 |

**改造 4 个占位页**：`/resume`、`/career`、`/projects`、`/gap` 从 `ModulePlaceholder` 换成真实内容页（导航四项点进去不再是空的）。

**新增共享基础件**：证据状态标签、来源展开浮层、步骤指示器、任务卡、空态块、逐条确认操作条——这 6 个是规格 §2.2 列的全局组件，当前只有零散实现，需要抽成可复用组件再落到各页。

**不变的部分**：视觉语言、Design Token、导航、应用外壳、点阵组件一律沿用现有实现，不重新设计。已有 4 个可用页面不做结构性改动。

## Capabilities

### New Capabilities

- `account-and-onboarding`: 注册建号、首次进入的引导向导、账户设置与数据管理——用户从"没有账号"到"拥有一个绑定 JD 的主目标岗位"之间的路径
- `candidate-assets`: 候选人资产档案——简历导入与逐条确认、项目档案建立、项目证据材料提交，产出可复用的资产库
- `project-evidence`: 项目深挖验证——深挖开始页的规则告知、单题多轮追问与证据实时判定、带来源的项目证据报告；这是产品的核心业务
- `gap-analysis`: 岗位差距诊断与冲刺计划——四类能力分类（含硬性条件独立分区）、可解释的排序依据、固定档位的下一步任务
- `resume-tailoring`: 证据门禁下的简历修改建议与岗位专版简历——逐条接受/编辑/拒绝，无来源的建议不可操作

### Modified Capabilities

无。项目当前没有任何已存在的 spec（`openspec list --specs` 为空），全部为新增能力。

## Impact

**受影响代码**（均在 `luod/`，Next.js 16 App Router）

- 新增 11 个路由目录，4 个现有路由目录改写
- 新增约 20 个业务组件（分布在 `components/profile/`、`components/interview/`、`components/gap/`、`components/resume/`）
- 新增共享组件目录 `components/shared/`（证据状态标签、来源浮层、步骤指示器、任务卡、空态块、确认条）
- 复用不改：`components/app/app-shell.tsx`、`components/dashboard/nav.tsx`、`components/ui/pixel.tsx`、`app/globals.css` 中的 `.ws*` token
- 新增本地数据层 `lib/` 下的领域类型与 mock 数据（无后端，沿用现有 `lib/jd-parse.ts` 的本地计算模式）

**不改动**

- 落地页 `/`、登录 `/login`、工作台 `/dashboard`、目标岗位创建 `/target/new` 的行为与样式
- `app/globals.css` 的 token 定义（只在确有必要时新增 token，不修改既有值）
- 技术栈与依赖：不新增 UI 库、不引入状态管理库、不引入图表库
- 后端与 API：本次全部为前端页面与本地数据，不涉及接口契约

**风险**

- 追问会话页（P11）是唯一有真实状态机的页面（提交中 / 生成下一问 / 跳过 / 声明未做过 / 中断恢复），需要在无后端的前提下把状态流转表达清楚
- "无来源不可操作"这一门禁规则要落在组件层，而不是各页各写一遍，否则容易在某一页被绕过
