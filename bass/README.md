# 知程 AI 前端

React 19 + TypeScript + Vite + Tailwind CSS 4，保留原 Base UI/shadcn 自定义组件及视觉设计。npm 为唯一包管理入口，使用 Node 24 LTS。

```sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
npm run preview
```

首批实际闭环为 `/upload` 粘贴文本 → 同源 `/api/v1/resume-reviews/analyze` → `/review` 六维初评。这个入口始终调用 FastAPI；`VITE_API_MODE` 只控制尚未接真实后端的旧诊断原型，不控制本轮模型模式。

先启动后端，见 `../backend/README.md`。模型模式由后端 `.env` 的 `AI_MODE=mock/deepseek/dashscope` 决定。结果页明确标识真实模型或后端 Mock，HTTP 失败不会退回模拟成功。支持20至12000字，纯文本版式为 unknown、无岗位针对性为 not_applicable；问题有原文行、原因、行动方向与待确认事实。

PDF 控件保留，但本轮不上传或解析；直接粘贴正文。输入/结果只存前端内存，刷新后丢失；后端本轮不持久化。来源引用、事实约束校验不等于所有语义判断都已验证。正式技能等级、录用概率和项目事实增强不在此入口提供。

开发代理默认 `127.0.0.1:8000`；可通过仅供开发服务使用的 `API_PROXY_TARGET=http://127.0.0.1:8001` 切换到另一个本机后端。这个设置不包含密钥。`/report/sample` 仍是虚构原型示例，`/report` 是未来授权报告边界，首批不实现相应正式服务。

`nginx.example.conf` 仅提供 Linux 静态页面刷新回退与 API 分离示例，不构成生产部署。不得把私有密钥写入任何 `VITE_*` 配置。

字体本地托管，保留 Noto Sans SC / Inter / JetBrains Mono；许可证在 `licenses/`。shadcn 所需样式保存在 `app/vendor/shadcn.css`，保留 MIT 声明，未安装无用途的 CLI 依赖。

本机旧 `bass/node_modules` 存在 Windows 目录锁，未删除。此次实际安装和验证目录为工作区 `.ua/frontend-migration/validation-ci`，与本目录源文件校验对应；原依赖目录解除占用前不应直接覆盖安装。旧配置和原工程归档均保留在 `.ua/frontend-migration/`。
