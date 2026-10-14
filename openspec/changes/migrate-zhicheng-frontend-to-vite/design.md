## Context

动机与范围见 `proposal.md`，事实和复现见 `audit.md`。本次用户指定的技术路线覆盖 `.claude/rules/webdesigned.md` 中 Next.js/NestJS 的旧目标，但不改变 AGENTS.md 的审批、影响面分析、先测试后实现和禁止批量删除约束。

现有 `bass/` 有 8 个页面路由，67 个 TS/TSX 源文件，33 个 UI 文件，其中 16 个可从页面入口经静态 import 到达。组件是 shadcn 的 Base UI 版本，已经使用 `render`/`nativeButton`，不能机械改成 Radix `asChild`。本次不统一替换 UI 系统。

## Goals / Non-Goals

**Goals:**

- 在同一 `bass/` 内完成可构建的静态应用，逐页保留品牌、组件、信息层级和交互。
- 用明确的状态与契约修复事实/岗位/问答的前端一致性；演示与正式业务分离。
- 对 V0 的审核、发布、过期、撤销和删除提供可验证前端状态；真实安全边界留在业务 API。
- 形成完整的本地检查与前后对比证据，不把未执行测试写为通过。

**Non-Goals:**

- 不实现真实解析、AI 评估、后台审核员系统、数据库、Worker、账号或跨设备历史。
- 不把静态 SPA 当成已获准上线的真实用户试点。
- 不以性能猜测为由重构所有组件或增加缓存/状态框架。

## Decisions

### 1. 在原工程迁移，减少目录搬迁

保留 `components/`、`lib/`、`public/` 与现有业务页面文件；增加 `index.html`、`main.tsx`、`router.tsx`、`vite.config.ts`、`api/`、`types/`。原 `app/*/page.tsx` 可作为普通页面模块继续导入，去掉 Next metadata 并由路由元信息维护标题；先不为目录美观迁入第二套 `src/`。

备选：新建 Vite 目录逐个重写。否决：产生两套正式前端、增加保真和回归成本。

### 2. Vite + React Router + npm

- Vite 与 React 插件承担 TSX 开发/打包；显式配置 `@/` 别名，保留 Tailwind 4 和当前 PostCSS 方案，避免同时迁移样式工具链。
- React Router 声明式路由承载当前 8 页、显式 `/report/sample` 和兜底 404。`/report` 为当前会话正式结果入口；现有示例内容复用到 `/report/sample`，原 `/report` 不再无条件显示虚构案例。
- `next/link` 改为路由 Link，`router.push` 改为导航 Hook；导航后处理页面标题、滚动与主内容焦点。流程导航依据实际已完成状态，不能仅按当前 URL 标记前序全部完成。
- 首页锚点与 section ID 对齐；`/states` 旧入口重定向至有效的演示状态说明锚点，不建设新业务模块。
- 非首页业务路由使用 `React.lazy`/`Suspense`，加载与异常有明确 UI；不引入 React Router 全栈框架模式。
- 新增 `dev/build/preview/typecheck/lint/test` 命令；构建前执行类型检查。npm lock 生成后使用 `npm ci` 验证；精确版本在实施时按 registry/engine/peer 检查锁定，不以本计划猜测最新版本。
- Nginx 只提供最小静态部署示例，业务 API 前缀不落入 SPA fallback。无需建设完整部署体系。

### 3. 保留视觉体系、字体和组件行为

- 保留当前背景 `#f8f9fd`、前景 `#20243d`、品牌 `#6258e8`、语义状态色、圆角、阴影与 sm/md/lg 体系。
- 为缺失的 `--shadow-elevated` 和 `--color-warning` 映射已有 Token，不重新设计配色。
- 保留 Noto Sans SC / Inter / JetBrains Mono 家族，改为本地托管的同名字体资源；优先复用可确认授权的字体资源，保留许可。只有无可用授权资源时才使用对应官方字体包；按使用的字符子集/字重加载，比较实际换行，禁止静默改成不同字体。
- Toast 固定 light，匹配根布局，移除没有 ThemeProvider 支持的系统主题依赖。Vercel Analytics 不进入此次静态前端默认运行依赖，避免引入未经需求确认的数据外发。
- 保留所有现有 UI 文件，即使当前未使用；不以清理为由批量删除。修复 1024px 工作区过窄时，调整提示栏显示断点/自身高度、内层网格断点，保留桌面三栏方向和移动端单栏。
- 统一 `cn`：通过现有 `lib/utils.ts` 暴露单一入口；优先复用已在 33 个基础组件使用的 `cn`，在样式回归后移除无直接用途的 clsx/tailwind-merge 双实现。`shadcn/tailwind.css` 当前确有使用，不能未经替代就卸载 shadcn。

### 4. 轻量状态、事实版本与失效

沿用 React Context，改为明确 action/reducer 和业务 Hook；当前规模不需要 Redux、Zustand 或 TanStack Query。拆分仅限事实输入、诊断记录和本地 UI 等实际职责。

- 初始真实输入不预填 STM32 案例。用户主动使用示例后才装入 fixture，并标明非本人数据。任意文本/PDF 在无解析后端时返回“尚未解析/需要手动确认”，不能生成固定经历。
- 简历事实、岗位/JD、诊断会话分别有 ID/版本；编辑简历/贡献清除事实确认并使依赖结果失效；不提供项目作为显式值保留，不能继续评价不存在的项目。
- JD 抽取不做伪 AI：演示 fixture 与输入区分；非 fixture 文本仅给出可人工补录的草稿/待接入状态。修改 JD/切换岗位清除旧需求确认。方向推荐使用实际声明或说明无法形成推荐依据。
- 通用模式使用独立通用题库和 `role_profile_id=null`；不沿用旧岗位做 Gap/DEFER。
- 保存回答正文、草稿、跳过、有效问题、进度和会话版本，不以计数替代证据。React 页面间往返保留内存会话。生产刷新恢复由后端会话读取，Mock 刷新明确说明演示会话重置，不把简历/令牌存入 Web Storage。
- `answered_count`、`skipped_count`、`completed_count` 分开派生；提交 pending 时禁用重复操作，Mock 同样校验幂等键。
- 简单表单使用受控输入与集中校验函数，不引入完整表单框架。文件类型/大小、文本长度等从统一 UploadPolicy 获取；演示限制必须明说是配置示例，生产值由后端政策确定。

### 5. API 层与类型边界

新增 `api/client.ts`、`api/career-api.ts`、`api/http-career-api.ts`、`api/mock-career-api.ts` 和 `api/fixtures/`，DTO 放 `types/api/`，UI/业务实体放 `types/domain/`，以显式 mapper 转换。详见 `api-contract.md`。

- client 统一 AbortController 超时/取消、HTTP 错误、FastAPI 422、业务错误、401/403/404/409/410/429/5xx。
- 外部 JSON 首先作为 `unknown`，对当前消费的关键字段做运行时检查，不用 `as ReportDto` 冒充校验。当前有限 DTO 使用集中类型守卫；待 OpenAPI 稳定后替换为生成类型/校验，不为假想场景装入大型依赖。
- Mock 与 HTTP 实现相同接口，配置开关明确且启动时显示演示标记；HTTP 失败不得自动悄悄降级为 Mock。
- 开发用 Vite `/api` 代理；生产推荐同源 Nginx `/api/v1` 转发到未来 FastAPI，静态前端不连 PostgreSQL/Worker/Agent。
- 未来会话凭据由后端安全 Cookie 管理；前端不把 Session ID/Token 长期保存到 localStorage/sessionStorage。跨域 Cookie/CORS/CSRF 由后端契约明确后接入，当前不假装已实现。
- 长任务先 POST 获得 task_id，再轮询任务/审核状态；退避、取消、重试受控，当前不需要 SSE/WebSocket。

### 6. 正式报告与示例分离

保持 PRD 的 `assessment_status`、`performance_state`、`assessed_level`、`review_status` 各自独立；`approved_unpublished` 只作为 UI 对 `approved` 的解释，不成为新后端审核枚举。过期/撤销属于访问状态，审核中/无法完成属于处理状态，不能混成审核枚举。

- `/report/sample` 始终公开的虚构案例，复制只反馈真实复制结果，不产生“审批通过”通知。
- `/submission` 根据实际 DTO 呈现待审、审核中、待修订、拒绝、批准未发布、已发布和无法完成；显示恢复入口，不承诺未经支持的完成时刻。
- `/report` 先经 API 请求授权；仅消费后端授权的 `published` 当前版本。空结果、错误、未知枚举、hash/version 不一致时关闭正式正文并引导恢复/重试。
- 前端不能验证审核签署的真实性，也不能代替服务端授权；未来后端必须禁止未授权正文下发、缓存复用和直链绕过。Mock 只模拟这些响应契约，不证明服务端安全已经实现。
- 撤回/删除开始时清除当前可见的敏感结果与请求；删除操作只在服务端确认全链路完成后显示“完成”。Mock 清除要写明仅清除演示内存。

### 7. 测试与保真证据

- 先补关键状态和交互失败用例，再改实现；优先 Vitest + Testing Library，必要的 DOM 环境与测试工具放开发依赖。
- 重点测试：任意输入不变固定事实、无项目 unknown、确认失效、JD 变更、旧岗位→通用模式、回答恢复、跳过不降级、幂等提交、审核与版本授权、过期/撤销、删除、复制失败、错误恢复。
- 逐页迁移顺序：首页→上传→确认→初评→岗位→问答→提交→报告。每页完成即类型检查、实际浏览器打开、交互和前后截图比较，不积攒到最后。
- 与 `evidence/` 的 1440×1000 / 390×844 基线逐页比较；额外检查 1024px 和 360px。修复已有缺陷的变化单列，其余品牌/布局不得大幅漂移。没有实测数据不做虚拟列表或大规模 memo 化。
- 本地执行 npm build/typecheck/lint/test 与关键浏览器流程；必要时再添加 Playwright，不提前增加 CI。

## Risks / Trade-offs

- [原工程与 PRD 未入 Git] → 实施第一步先创建明确排除 node_modules/.next 的源码归档及 SHA-256 清单，验证可读；不得用 reset/clean 覆盖用户文件。
- [字体及类名合并变化造成视觉漂移] → 使用同字体、保留 Token、逐页截图比较；合并函数的统一与页面迁移分步验证。
- [SPA 首屏 HTML 与 Next 预渲染不同] → 保留元信息和页面标题，接受此次静态 SPA 目标；不额外引入 SSR/SSG 框架。
- [用户输入无真实解析能力] → 明确待接入、保留手动补录；Mock 只证明前端状态可用。
- [外部 CodeGraph/Claude 工具不可运行] → 记录具体失败，停止相应源码实施并向用户说明，不静默改用文本检索冒充影响面分析。

## Migration Plan

用户批准后先建立源码备份、知识图谱和关键符号影响面记录，再补测试。按照 AGENTS.md 第4步，通过指定 Claude Code 工具依 tasks.md 一次执行一个实施任务，并保留测试/改动记录；当前没有调用它执行代码修改。配置切换时保留旧文件于已验证归档；只逐个移除明确的旧配置文件，禁止批量删除。分页面回归，每次只勾选实际完成的 tasks 项。

若关键页面视觉大幅变化、数据保存风险或范围扩张，停止相关步骤并说明影响。回滚从备份按明确文件恢复，不批量清空目录。所有检查完成才通过 OpenSpec 归档，真实试点准入另按 PRD 执行。

## Technical References

构建/路由接入方式已核对官方文档：[Vite](https://vite.dev/guide/)、[React Router 声明式安装](https://reactrouter.com/start/declarative/installation)、[shadcn Vite 安装](https://ui.shadcn.com/docs/installation/vite)。这些只支撑迁移接入方案，不代表本项目已经迁移或通过对应验收。
