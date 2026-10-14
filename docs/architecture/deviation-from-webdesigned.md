# 与 `webdesigned.md` 的符合度台账

> 依据：`.claude/rules/webdesigned.md`（项目级技术架构总规范）
> 建立时间：2026-10-03
> 维护要求：**每次架构级改动后必须更新本文件**。状态只有三种——`符合` / `未实现（有意推迟）` / `偏离（未记录原因）`。
> 最后一种是不允许长期存在的状态。

---

## 为什么要这份文件

`CLAUDE.md` 要求「涉及架构、目录、数据库、核心依赖的修改，必须先参考 webdesigned.md」。
但在 2026-10-03 的 `build-offer-mvp-frontend` 变更中，规划产物里**一次都没有引用过这份规范**，
既没说明哪些条目本次不适用，也没记录有意推迟了哪些。结果是"按规范做的"和"没按规范做的"混在一起，无法分辨。

这份台账就是把那笔账补上，并防止它再次发生。

---

## 一、目录结构（§12）

| 规范要求 | 现状 | 状态 |
|---|---|---|
| `apps/web/` | 已建立（原 `luod/` 迁入） | 符合 |
| `apps/api/` | 仅 README，无代码 | 未实现（有意推迟，需先有后端需求） |
| `apps/worker/` | 仅 README | 未实现（有意推迟，见 §7.2 触发条件） |
| `apps/ai/` | 仅 README | 未实现（有意推迟） |
| `packages/types/` | 已建立，含领域模型 | 符合 |
| `packages/config/` | 已建立，含 TS 基线 | 符合 |
| `packages/utils/` | 仅 README | 未实现（有意推迟，理由见该 README） |
| `packages/ui/` | 仅 README | 未实现（有意推迟，理由见该 README） |
| `docs/{product,architecture,api,database}/` | 已建立，`product/` 有内容 | 符合 |
| `docker/` `scripts/` | 仅 README | 未实现（有意推迟） |
| 根 `package.json` + `pnpm-workspace.yaml` | 已建立 | 符合 |
| 根 `README.md` | 已建立 | 符合 |

**注意**：`apps/api`、`apps/worker`、`apps/ai` 三个目录只有 README，没有脚手架代码。
这是刻意的——§19禁止2 禁止「无需求增加基础设施」，§18 禁止「因为以后可能需要而提前拆分」。
README 里写清了各自的**触发条件**，到条件满足时再建。

---

## 二、技术栈（§3）

| 规范要求 | 现状 | 状态 |
|---|---|---|
| 前端：Next.js / React / TypeScript / Tailwind / shadcn 结构 | 齐备 | 符合 |
| 前端：**TanStack Query**（Server State） | 未安装 | **偏离** |
| 前端：**Zustand**（Client State） | 未安装 | **偏离** |
| 前端：**Zod**（校验） | 已安装（webv2 带来；当前用于校验 Server Action 的返回契约与 AI 返回结构） | 符合（就存在性而言） |
| 前端：**pdfjs-dist** | 已安装（webv2 带来；服务端解析上传的 PDF 简历）。**注意**：连带拉入 `@napi-rs/canvas` 原生二进制约 15MB | 额外依赖，见 §十一 |
| 后端：NestJS + REST + OpenAPI（§3.2） | 不存在 | 未实现（有意推迟） |
| 数据层：PostgreSQL + Prisma/Drizzle + pgvector（§3.3） | 不存在 | 未实现（有意推迟） |
| 基础设施：Redis / BullMQ / S3 / Docker（§3.4） | 不存在 | 未实现（有意推迟） |
| AI：Python + FastAPI 独立服务（§3.5） | 不存在 | 未实现（有意推迟） |
| AI 能力（`ai` SDK） | **已按决策移除**，见 §十一 | 有意偏离 |

### 关于三项前端依赖的偏离

§4.2 明确规定 Server State 走 TanStack Query、Client State 走 Zustand。当前实际是：

- 全部数据来自 `apps/web/lib/mock-data.ts` 与 `session-seed.ts` 的静态导入，**没有 Server State 可言**，装 Query 是空转
- 交互状态（会话轮次、任务勾选、表单草稿）用 React `useState` 管理，规模是单页面级别，装 Zustand 是过度设计
- Zod 的职责（校验外部输入）当前由手写校验承担，因为**没有任何外部输入**——数据是本地的、类型已知的

**这项偏离是有意的，但代价必须写清楚**：§11 要求的请求层现在完全不存在。
将来接后端时，11 个页面里所有直接 `import` mock 数据的语句都要换成请求调用，
并同时引入统一 HTTP Client 与上面三项依赖。这不是"加一层"就能补上的小事，
届时应作为独立变更立项，不要混在功能迭代里做。

**这是一笔欠账，不是一个已经解决的状态。**

---

## 三、API 设计（§11）

| 规范要求 | 现状 | 状态 |
|---|---|---|
| `/api/v1/` 路由 | 不存在（`apps/web/app/api` 无） | 未实现（有意推迟） |
| 统一响应封套 `{success, data, message, code, requestId}` | 不存在 | 未实现（有意推迟） |
| OpenAPI 文档 | 不存在 | 未实现（有意推迟） |

---

## 四、数据与状态（§6 / §7）

| 规范要求 | 现状 | 状态 |
|---|---|---|
| PostgreSQL 作为事实来源 | 不存在 | 未实现（有意推迟） |
| Redis 只做缓存/队列/短期状态 | 不存在 | 未实现（有意推迟） |
| 数据库迁移可追踪 | 不存在 | 未实现（有意推迟） |

**迁移注意**：§7.1 明确「Redis 不能代替 PostgreSQL 成为核心业务数据库」。
将来引入 Redis 时必须守住这条，不要把会话状态图省事放进 Redis 当主存储。

---

## 五、安全（§14）

| 规范要求 | 现状 | 状态 |
|---|---|---|
| 密码安全存储 | `apps/web/lib/demo-auth.ts` 里是**明文常量** | **偏离** |
| 认证 / RBAC | 未实现 | 未实现（有意推迟） |
| 输入校验 | 前端有校验（`register-form.tsx` 四项），无后端校验 | 部分符合 |
| XSS / SQL 注入 / CSRF / CORS / 限流 | 无相关面（无后端、无数据库、无 `dangerouslySetInnerHTML`） | 不适用 |

### 关于明文密码

`demo-auth.ts` 里的 `demo@zhitu.app / zhitu2026` 是**演示钥匙，不是认证**。
它违反 §14 的字面要求，但当前没有用户、没有数据、没有任何东西可以被访问。

**风险不在今天，在明天**：这段代码长得像"认证已实现"，最容易被保留下来。
该文件顶部已写明「接入真实认证时必须整段替换」，建立真实认证时应作为**第一优先级**清理项。

---

## 六、测试与可观测性（§15 / §16）

| 规范要求 | 现状 | 状态 |
|---|---|---|
| Unit / Integration / API / E2E 测试 | **零**。`package.json` 无 test 脚本、无测试依赖 | **偏离** |
| Application Log / Error Log / Request ID / Audit Log | 无 | 未实现（有意推迟） |

### 关于测试为零

`AGENTS.md` 要求「先补测试，再改实现」。本仓库无任何测试设施，
补测试必须先引入测试框架——而 `CLAUDE.md` 又禁止「擅自引入第三方依赖」。两条规则在此冲突。

当前采取的替代验证闸门（已实际执行）：

- `pnpm typecheck`（`tsc --noEmit`，全工作区）
- `pnpm build`（已关闭 `ignoreBuildErrors`，构建阶段真做类型检查）
- HTTP 渲染断言（逐路由状态码、关键分支文案、DOM 唯一性）

**这不等于测试。** 引入测试框架应作为独立变更立项。

---

## 七、部署（§17）

| 规范要求 | 现状 | 状态 |
|---|---|---|
| 第一阶段 Docker Compose | 不存在 | 未实现（有意推迟） |

---

## 八、禁止事项自查（§19）

| 禁止项 | 自查结果 |
|---|---|
| 禁止1 随意更换核心技术 | **遵守** —— Next.js / React / TS / Tailwind / shadcn 结构原样保留 |
| 禁止2 无需求增加基础设施 | **遵守** —— 未引入 Kafka / K8s / ES / 微服务 |
| 禁止3 业务代码直接访问数据库 | **不适用**（无数据库） |
| 禁止4 跨模块随意调用内部实现 | **遵守** —— 共享件收在 `components/shared/`，未跨模块乱调 |
| 禁止5 核心业务逻辑放 Controller | **不适用**（无 Controller） |
| 禁止6 将 Redis 当主数据库 | **不适用**（无 Redis） |
| 禁止7 AI 服务直接修改核心业务数据 | **不适用**（无 AI 服务） |

---

## 九、流程规则自查（§20 / `AGENTS.md` 五步工作流）

| 要求 | 执行情况 |
|---|---|
| 1. OpenSpec 对齐 | **遵守** —— `openspec/changes/build-offer-mvp-frontend/` 产出完整四件套 |
| 2. Understand-Anything 懂整体 | **未执行** —— `.ua/` 知识图谱从未建立，`/understand` 一次都没跑过，全程直接读源码 |
| 3. CodeGraph 理影响面 | **部分执行** —— 开工时建索引并 explore 两次；后续改动既有符号（`login-form.tsx`、`globals.css`、拆分 `mock-data.ts`、批量改 import）时**未重跑** |
| 4. 按 tasks.md 逐步实现 | **遵守** |
| 5. OpenSpec 归档 | 待执行 |
| §20.1 开发前回答十个问题 | **未显式回答** |

**第 2、3 条是真实的流程偏离，不是"本次不适用"。** 后续变更必须补上。

---

## 十、webv2 移植记录（2026-10-03）

用户提供 `webv2/`（在 v0.dev 上基于前作演进的完整版），要求按上次移植 `luod/` 的方式整体并入 `apps/web/`。

### 移植中发现并修复的源端问题

`webv2` 的 `next.config.mjs` 同样是 `ignoreBuildErrors: true`，把下列问题全部藏住了。
**关掉该开关后，类型检查立刻暴露 20+ 处错误** —— 这是本次移植最有价值的一次发现。

| 问题 | 具体表现 | 处理 |
|---|---|---|
| **编码损坏** | `app/globals.css` 2 处、`lib/domain.ts` 1 处出现 U+FFFD 替换字符（`略��`、`投影��`、`你是���么`）。移植前的 `apps/web` 为零损坏，确认是 webv2 带来的 | 已按正确原文修复；全仓库复查为 0 |
| **jd-parse API 与调用方不一致** | `lib/jd-parse.ts` 已重构（`parseJd(text): JdBreakdown`、`Category` 去掉 `'hard'`、移除 `Tag`/`highlightSegments`/`groupByStrength`），但 `components/target/{jd-intake,jd-review,tag-row}.tsx` 仍用旧 API，`/target/new` 实际是坏的 | 三个组件改到新 API；新增 `linkSegments()` 做**子句级回源**，JD 原文逐字保留 |
| **`'use server'` 文件导出非 async** | 需逐个核对导出，`'use server'` 文件只能导出 async 函数 | 已确保无违规导出 |

### AI 能力：按用户决策移除

webv2 有 4 个新功能依赖 AI（拷打模式、JD 工作台、差距 studio、简历分析），共 7 处
`generateObject({ model: 'google/gemini-2.5-flash', ... })` —— 该模型标识是 **v0 平台 Gateway 的写法**，
在本仓库无 `AI_GATEWAY_API_KEY` 时会整体失败。

用户决策：**暂时摘掉 AI 调用**。实际实现方式**比「固定占位」更强**：
三个 lib 文件改为**确定性本地规则实现**（复用已有的 `lib/jd-parse.ts` 与 `lib/session-engine.ts` 的思路），
功能真的可跑且随真实数据变化；原有的 zod schema 全部保留并**用于校验本地实现的输出**，
因此 AI 契约仍在代码里，恢复时只需换回函数体。

| 函数 | 现在的实现 |
|---|---|
| `generateInterrogationQuestions` | 按证据强度排序取最弱项，套模板出题 |
| `judgeInterrogationAnswer` | 篇幅 + 要点覆盖率各占一半评分，阈值随难度 |
| `summarizeInterrogation` | 纯聚合各题判定 |
| `analyzeJobPosting` | 复用 `parseJd`；截图模式**如实报错**不编造 |
| `analyzeResume` | 规则检出弱动词／缺量化／技能罗列／项目过短／结构缺失 |

`ai` 依赖已从 `package.json` 移除。**恢复真实 AI 需重新安装并换回函数体。**

### 按安全红线补的校验（用户已批准）

| 问题 | 处理 |
|---|---|
| **PDF 上传无任何限制**（`extractPdfText` 收客户端 base64）—— §16 安全红线、§19 资源保护 | 加：10MB 上限（**按 base64 字符串长度在解码前拦截**）、`%PDF-` 魔数校验、30 页上限、2 万字文本上限 |
| **SSRF**（`fetchLinkText` 抓取用户提供的任意 URL）—— §15 安全红线 | 加：内网／回环／链路本地（含 `169.254.169.254` 云元数据）地址拦截、URL 内凭据拦截、**拒绝重定向**（`redirect: 'error'`，否则地址校验会被绕过）、512KB 响应上限 |

两项均已实测：5 个内网地址 + 非 http(s) 协议全部被拦；PDF 的四类非法输入均被拒且不崩溃。

### 按前端规范拆分

| 文件 | 拆分前 | 拆分后 |
|---|---|---|
| `components/interrogate/interrogation-room.tsx` | 456 行（主组件本身 337 行，同时超 250 行组件上限） | 246 行；拆出 `room-types` / `difficulty-picker` / `answer-panel` / `verdict-card` |
| `components/resume/resume-analysis-studio.tsx` | 401 行 | 197 行；拆出 `analysis-result.tsx` |

### 未处理的遗留

- `webv2/public/raw-test.html`（全屏红块的分页调试残留）**未并入**
- `webv2/` 与 `webv2.zip` 仍留在仓库根，确认无误后可删
- 新增 7 张图片约 10MB（`aurora-*`、`scene-*`）未做压缩

---

## 十一、后续收口优先级

| 优先级 | 事项 | 代价 |
|---|---|---|
| 高 | 接入真实认证时清理 `demo-auth.ts` | 低，但**必须记得** |
| 高 | 引入测试框架，并把现有 HTTP 断言升级为真实测试 | 中 |
| 中 | 建 `apps/api` 时同步补前端请求层与 TanStack Query / Zustand / Zod | 高（11 个页面都要改） |
| 中 | 严格执行 `AGENTS.md` 第 2、3 步 | 低 |
| 低 | 补齐 `docker/` 与 CI | 中 |
