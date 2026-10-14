## Why

知程 AI 现有前端使用 Next.js App Router 和 pnpm，不符合本次明确指定的 React + TypeScript + Vite、npm 及 Nginx 静态部署目标。现有视觉组件值得保留，但简历/JD 示例与用户输入混用、通用诊断分支沿用旧岗位、回答无法恢复等问题，使交互演示不能被视为真实业务闭环。

本提案基于 `docs/PRD-v1.1.md`，以 §6.0 和 §19 优先于历史完整功能清单；当前阶段仅产出审查与方案，等待用户批准后实施。

## What Changes

- 在原 `bass/` 工程内分阶段迁移，复用现有 React 业务组件、Base UI 版 shadcn/ui、Lucide、Tailwind Token 和品牌视觉，不另建正式前端。
- **BREAKING**：开发/构建命令由 Next.js 改为 Vite，包管理由 pnpm 改为 npm；输出为静态 `dist/`，深层路由需 Nginx SPA fallback。实施时同步说明本次目标覆盖旧架构规范中的 Next.js 前端要求，未来后端采用 FastAPI；不建设后端。
- 采用 React Router，保持 `/`、`/upload`、`/confirm`、`/review`、`/role`、`/assessment`、`/submission`、`/report`；将 `/report/sample` 实现为显式示例入口。`/states` 的旧链接替换为有效的演示状态说明入口，不增加正式业务模块。
- 将固定示例、题库、初评、岗位和报告移至统一 Mock API/fixture 层；默认显著标明演示数据，不把任意真实输入假装解析成固定案例。
- 修复输入确认失效、无项目资料、岗位/JD 切换、通用题库、回答/跳过计数、会话内恢复和重复提交；以用户确认的事实版本为依据。
- 为正式报告定义独立审核/授权 DTO 和状态视图；草稿、待审、修订、拒绝、审核未完成、到期和撤销时不展示正式报告正文。示例与本人报告明确区分。
- 增加统一请求错误处理与可切换 Mock/HTTP 适配器；只准备 FastAPI 契约，不实现 Agent、数据库或模型调用。
- 补充有意义的类型、Lint、状态转换/交互测试与逐页桌面、移动端保真验收。

## Capabilities

### New Capabilities

- `frontend-static-runtime`：在保留原设计和路由的情况下，通过 npm/Vite 构建和运行静态前端，并具备明确的验证命令。
- `frontend-evidence-flow`：演示数据和真实输入隔离，资料确认、岗位选择、问答记录与失效逻辑保持一致，未知证据不当作能力差。
- `frontend-report-access`：报告示例独立展示，正式报告仅展示业务 API 授权提供的已发布版本，审核状态与访问失效正确呈现。
- `frontend-api-boundary`：所有模拟业务与未来 FastAPI 请求通过统一、类型明确、可处理异步失败和恢复的前端接口边界。

### Modified Capabilities

无。现有 `openspec/specs/` 尚无能力规范。

## Impact

- 修改范围：`bass/` 构建配置、页面入口/路由、Next 专属调用、字体与 Toast、跨页状态、业务组件、API/DTO/fixture 层及相关测试；审查和交付文档位于本变更目录。
- 直接保留：品牌紫色与浅色 Token、原有布局和信息层级、基础组件交互、公共资源、业务文案中符合 PRD 的部分。
- 依赖：保留有实际用途的 React、Tailwind、Base UI、Lucide、Sonner；新增 Vite/React Router 和必要测试/Lint 工具；不引入 Redux/Zustand/TanStack Query/大型表单框架。
- 不包含：正式账号/长期档案、深度诊断/专项复测、真实招聘样本校准、后端服务、数据库、模型 API、GitHub CI 或完整生产部署。
- 风险：字体替代造成换行变化；SPA 直达路由回退；npm 与 pnpm 解析差异；现有 `bass/` 和 `docs/` 未被 Git 跟踪，实施前必须先保存可验证的原始快照。
- 约束：禁止批量删除；清理旧配置时只逐个处理明确文件，不删除目录；执行前依照 AGENTS.md 建立/查询知识图谱并对现有关键符号运行 CodeGraph，热点无测试先补测试。
- 审批：用户批准本提案、设计和任务清单前不改应用源码；当前不归档、不声称迁移完成。
