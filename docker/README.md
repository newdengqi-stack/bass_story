# docker

**未实现。**

按 `webdesigned.md §17`，第一阶段用 Docker Compose 编排：
`Nginx/Caddy → Next.js + NestJS → PostgreSQL / Redis / Worker → AI`。

触发条件：出现需要部署的后端服务（`apps/api`）时一并建立。
现在只有前端，用 `pnpm dev` 即可。
