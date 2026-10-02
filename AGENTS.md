# AGENTS.md — Proces_Develop

本项目的所有功能改动必须走「规范驱动」五步工作流，禁止跳过前序步骤直接动手改代码。

## 工具位置（本机）

| 工具 | 用途 | 调用方式 |
|---|---|---|
| OpenSpec | 需求规格 / 任务清单 / 归档 | `/opsx:propose`、`/opsx:archive`（Claude Code 内）或 `E:\Soft_ware\openspec\openspec.cmd` |
| Understand-Anything | 整体链路理解 | `/understand`、`/understand-chat`（Claude Code 插件） |
| CodeGraph | 改动影响面分析 | `codegraph explore "<符号>"` |
| Claude Code | 代码执行 | `E:\Soft_ware\claude-code\claude.cmd` |

## 每条需求的强制流程

### 1. OpenSpec 对齐（先定规格，再写代码）
- 对每个新需求运行 `/opsx:propose <变更名>`，生成：
  - `openspec/changes/<变更名>/proposal.md`（根因 / 约束 / 影响面）
  - `openspec/changes/<变更名>/tasks.md`（任务清单）
- **必须等待人工审阅 proposal 并确认约束**后，才能进入下一步。约束写入后不得静默绕过。

### 2. Understand-Anything 懂整体
- 用 `/understand-chat "<链路问题>"` 在知识图谱（.ua/knowledge-graph.json）上查询定位，**不重读源码**。
- 若项目尚无图谱，先运行 `/understand` 建立（首次全量，之后增量）。

### 3. CodeGraph 理影响面
- 改动任何已有函数 / 接口前，先运行 `codegraph explore "<关键符号>"`，读取：源码、调用链、blast radius（调用方数量 / 测试覆盖）。
- 若受影响热点代码**无测试覆盖**，先补测试，再改实现。

### 4. Claude Code 执行改动
- 严格按 `tasks.md` 勾选 `[x]` / `[ ]` 逐步实现，一次只做一步。
- 上下文超限时，读取 `tasks.md` 的勾选状态续跑，不重复已完成的步骤。

### 5. OpenSpec 归档
- 改动完成并自测通过后，运行 `/opsx:archive`，归档到 `openspec/changes/archive/`，形成需求闭环。

## 硬性约定

- 任何非 trivial 改动必须产出 proposal.md 并经人工确认；确需省略时必须先说明理由。
- 涉及已有符号的改动必须先 `codegraph explore`，禁止直接改。
- 先补测试，再改实现；改完自测通过才归档。
- 与用户对话使用中文。
