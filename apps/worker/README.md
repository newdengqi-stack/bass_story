# apps/worker

**未实现。** 按 `webdesigned.md §7.2`，这里是 BullMQ 消费者。

## 什么时候才建

只有当出现**必须异步**的任务时才建，不要提前建。候选场景：

- 简历解析（当前是前端本地规则实现，见 `apps/web/lib/jd-parse.ts`）
- AI 分析任务
- 通知 / 邮件
- 报表生成
- 文件处理

判断标准：任务是否会阻塞普通 HTTP 请求。会，才进队列。

## 依赖前提

需要先有 Redis 与 `apps/api`，见 `webdesigned.md §7.1`。
