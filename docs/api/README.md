# docs/api

**未实现。**

放接口契约文档。按 `webdesigned.md §11`，接口统一为 REST + OpenAPI，路径前缀 `/api/v1/`，
响应封套 `{ success, data, message, code, requestId }`。

触发条件：`apps/api` 建立时，OpenAPI 产出后同步到此。
