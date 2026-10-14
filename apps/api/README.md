# apps/api

**未实现。** 按 `webdesigned.md §3.2 / §5`，这里是 NestJS 模块化单体。

## 现状

前端 `@zhitu/web` 当前**没有任何请求层**——11 个页面直接消费 `apps/web/lib/mock-data.ts` 与 `session-seed.ts`。
这是 `openspec/changes/build-offer-mvp-frontend/design.md` 的 D4 决策（无后端前提下先跑通页面）。

## 建起来时必须做的三件事

1. **接口按 §11 定**：`/api/v1/...`，统一响应封套 `{ success, data, message, code, requestId }`
2. **领域模型直接 import `@zhitu/types`**，不要在前端和后端各写一份类型
3. **前端补请求层**：届时 `apps/web` 需要引入 §9 要求的统一 HTTP Client，
   并把页面对 `lib/mock-data.ts` 的直接依赖逐个换成请求调用

## 硬性约束

- 业务逻辑在 Service 层，Controller 只做协议层（§3、§19禁止5）
- 数据库访问只经 Repository/DAO（§19禁止3）
- 认证授权、对象级权限必须在这里做，前端隐藏按钮不算（§14）
