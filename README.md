# 证途 — 证据化求职准备平台

面向嵌入式方向校招 / 实习的求职准备平台。核心主张：**不承诺 Offer，承诺每条结论有来源。**

从一份具体 JD 出发 → 围绕真实项目连续追问 → 为每项能力留下带状态与来源的结论 →
算出差什么、先补哪项 → 逐条确认后生成岗位专版简历。

---

## 当前进度

**只有前端，且使用本地演示数据。** 后端、数据库、AI 服务、部署均未实现。

| 部分 | 状态 |
|---|---|
| `apps/web` 前端（21 条路由） | 已实现，本地可跑通完整闭环 |
| `apps/api` 后端 | 未实现 |
| `apps/worker` 异步任务 | 未实现 |
| `apps/ai` AI 服务 | 未实现 |
| 数据库 / Redis / 对象存储 | 未实现 |
| 测试 | 无 |

**AI 相关功能当前是本地规则实现，不是模型。** 拷打模式、JD 分析、差距分析、简历分析
四处的原 AI 调用已按决策摘除，改为确定性规则（复用 `lib/jd-parse.ts`、`lib/session-engine.ts` 的思路）。
功能可跑且随真实数据变化，但能力边界明显低于模型。
恢复方式与全部取舍记录在台账 §十。

符合度台账（逐条对照架构规范）：**`docs/architecture/deviation-from-webdesigned.md`**

---

## 快速开始

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

其他命令：

```bash
pnpm build        # 构建（含类型检查）
pnpm typecheck    # 全工作区 tsc --noEmit
```

### 演示账号

```
demo@zhitu.app / zhitu2026
```

登录页上直接印了这个账号，也有「一键填入」按钮。
**这不是认证**——项目尚无后端，详见 `apps/web/lib/demo-auth.ts` 顶部说明。

---

## 目录结构

```
.
├── apps/
│   ├── web/            前端（Next.js 16 · React 19 · Tailwind v4）
│   ├── api/            [未实现] NestJS 模块化单体
│   ├── worker/         [未实现] BullMQ 消费者
│   └── ai/             [未实现] Python + FastAPI
├── packages/
│   ├── types/          领域模型（前后端共用）
│   ├── config/         共享 TS 基线
│   ├── utils/          [暂空] 见该目录 README 说明
│   └── ui/             [暂空] 见该目录 README 说明
├── docs/
│   ├── product/        需求拆分、UI 设计规格
│   ├── architecture/   架构约定与规范符合度台账
│   ├── api/            [未实现]
│   └── database/       [未实现]
├── openspec/           变更提案与任务清单
├── docker/             [未实现]
└── scripts/            [未实现]
```

---

## 开发前必读

按顺序：

1. **`AGENTS.md`** — 五步工作流（OpenSpec → Understand → CodeGraph → 实施 → 归档），硬性要求
2. **`CLAUDE.md`** — 项目总规则与规则文件索引
3. **`.claude/rules/webdesigned.md`** — 技术架构总规范（改动架构/目录/依赖前必读）
4. **`docs/architecture/frontend-conventions.md`** — 前端具体约定（状态划分、请求层、token 纪律、证据门禁）

领域规则按 `CLAUDE.md` §3.2 的定位表读取，**不要无差别扫描全部规则**。

---

## 两条产品硬规则

代码里有两处规则是**刻意下沉到组件层**的，不要在页面里重复实现：

| 规则 | 落在哪 | 为什么 |
|---|---|---|
| 无来源的建议不可被接受 | `apps/web/components/shared/review-bar.tsx` | 放页面层的话，多个页面漏一个就破防 |
| 证据状态不能只靠颜色区分 | `apps/web/components/shared/evidence-status.tsx` | 色盲与黑白打印下同样要可读 |

详见 `docs/architecture/frontend-conventions.md §4`。
