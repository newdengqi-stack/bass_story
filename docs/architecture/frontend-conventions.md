# 前端约定 — `apps/web`

> 上位规范：`.claude/rules/webdesigned.md`（架构）、`.claude/rules/frontend-rules.md`（工程）
> 符合度台账：`docs/architecture/deviation-from-webdesigned.md`
> 本文只补规范里**没有细化到可执行程度**的部分，不重复规范原文。

---

## 1. 状态划分：什么时候该上什么

`webdesigned.md §4.2` 规定 Server State 走 TanStack Query、Client State 走 Zustand。
在那个前提成立之前（即还没有后端时），按下面这张表判断，**不要提前引入依赖**：

| 状态的种类 | 现在用什么 | 什么时候必须升级 |
|---|---|---|
| 静态演示数据（`lib/mock-data.ts`、`session-seed.ts`） | 直接 `import` 常量 | **接后端时** → TanStack Query，全部改为请求调用 |
| 单页面内的交互状态（会话轮次、任务勾选、表单草稿、展开/折叠） | `useState`，集中在**一个**客户端组件里 | 当同一状态被**两个以上互不包含的页面**消费时 → Zustand |
| 跨页面共享的 UI 偏好（侧栏开合等） | 目前没有 | 出现时 → Zustand |
| 外部输入校验 | 手写校验函数 | 出现**不可信的运行时数据**（API 响应、URL 参数、用户上传）时 → Zod |

### 硬性约束

- **不得**把所有 API 数据无差别塞进全局 store（`webdesigned.md §4.2` 明令）
- **不得**把认证凭据放进任何浏览器存储（`frontend-rules.md §10` 安全红线）
- 服务端状态与本地 UI 状态必须分开判断，不要混在一个 state 里

---

## 2. 请求层边界（当前为空，补的时候照这个来）

**现状**：`apps/web` 没有任何请求层，页面直接 `import` mock 数据。这是欠账，
见 `deviation-from-webdesigned.md` §二。

补的时候必须满足：

1. **所有请求经统一 HTTP Client**，不得在组件里各写各的 `fetch`（`frontend-rules.md §9`）
2. 统一处理超时、取消、认证失效、网络错误、业务错误
3. 请求参数 / 响应 / 错误都要有明确类型，类型从 `@zhitu/types` 取，**不要另写一份**
4. 响应封套按 `webdesigned.md §11`：`{ success, data, message, code, requestId }`
5. **前端权限判断只负责 UI 展示**，不得作为唯一安全措施（`frontend-rules.md §9`）

替换 mock 时的落点：全仓库 `import ... from '@/lib/mock-data'` 与 `'@/lib/session-seed'` 的地方。

---

## 3. 视觉体系：token 纪律

`app/globals.css` 的 `.ws` 作用域是应用内页面的**唯一**颜色来源。

### 必须遵守

- 应用内页面一律用 `var(--ws-*)`；**不得**使用 shadcn 的 `bg-background` / `text-foreground` / `bg-card`
  ——那套浅色 `:root` 与 `.ws` 并存，误用会让某一页突然变浅色
- 需要新颜色时，**先把它提到 `.ws` 里命名**，再引用；不得内联写 `rgb(...)` / `#hex`
- `.ws` 上的双层 `text-shadow` 是照片上保持可读的**唯一**手段，不得移除
- 不得引入卡片、整页遮罩、投影（三个被否决的元素）。
  需要圈定范围用 `.ws-ghost-box`；需要在照片上压出可读的浮层用 `var(--ws-panel)`

### 例外

`app/login` 与 `app/register` **不在** `.ws` 作用域内（它们直接用 `InteractiveBackground`，
不套 `AppShell`），因此这两个页面里的表单沿用 `components/auth/login-form.tsx` 的写法：
透明底 + 仅底边线 + 内联沙金色。**新增这两个页面的兄弟组件时照抄 `login-form.tsx`，不要改成 `--ws-*`。**

---

## 4. 证据门禁：不要在页面层重复实现

「无来源的建议不可被接受」这条规则由 `components/shared/review-bar.tsx` **在组件内部**实现。

- 新页面需要逐条确认操作时，**直接用 `ReviewBar`**，把 `source` 传进去
- **不得**在页面里另写一遍 `if (!source) return` 之类的判断——那样 11 个页面里漏一个就破防
- 需要豁免门禁的动作（如"拒绝"、"删除"）显式传 `requiresSource: false`，
  并想清楚：这个动作会不会写入结果？会写入的就不该豁免

同理，「结论必须带来源」这条由 `@zhitu/types` 里的 `EvidenceSource` 与
`SourcePopover` 共同保证：凡是结论，`source` 允许为 `null`，但 `null` 在下游一律是**不可操作态**，
不是"空着而已"。

---

## 5. 目录职责

```
apps/web/
├── app/             路由。页面文件只做数据装配与布局，逻辑放 components/
├── components/
│   ├── shared/      跨页面复用件（6 个全局组件），不得依赖具体页面
│   ├── ui/          无业务语义的原语（点阵图形等）
│   ├── app/         应用外壳
│   └── <domain>/    按业务域分包：projects / gap / resume / account / onboarding / auth
└── lib/             纯函数与本地数据，不得持有全局业务状态
```

- 新页面**先找 `components/shared/`** 有没有能用的，没有再新建
- 共享件不得反向依赖具体页面
- `lib/` 里的模块不得 `import` 任何 React 组件

---

## 6. 关于 `@zhitu/types`

领域模型（证据状态、来源、证据卡、项目、冲刺任务、简历建议、版本）在 `packages/types/`。

- 前后端**必须**共用这一份，不要各写一份（`webdesigned.md §3.2` 的接口契约要求）
- 它是纯类型 + 常量 + 无副作用的纯函数，**不得**往里加任何依赖
- 改它等于改前后端的共同契约，属于跨层改动 —— 按 `CLAUDE.md` 规则定位表同时检查前后端规则

---

## 7. 每页完成前自查

沿用 `openspec/changes/build-offer-mvp-frontend/tasks.md` 的验收口径：

```
[ ] 用 var(--ws-*) 而非 shadcn 色彩 token
[ ] 无卡片 / 整页遮罩 / 投影
[ ] loading / empty / error 状态齐备（三态缺一不可）
[ ] 可交互元素有 hover / focus-visible / active / disabled
[ ] 仅靠颜色传达的状态，必须同时有文字标签
[ ] 结论类内容必须有来源入口
[ ] 响应式：320px 无横向滚动
[ ] prefers-reduced-motion 下无残留动画
```
