# 首批文本初评验收（2026-10-14）

范围：现有输入页 → FastAPI → 国内模型/后端Mock → 六维非数值文字初评。参考 `CLAUDE.md`、`PRD-v1.1.md`、`系统架构.md`、`AI工作流与数据契约设计.md`；以最新指令简化为同步文本接口，不实施数据库、Worker、事实版本、追问、PDF 或正式技术报告。

## 实际结果

- FastAPI 正常运行：`127.0.0.1:8000`（DeepSeek）；测试时另启动 `8001/5176` 验证后端Mock，验收后关闭该测试进程。
- 前端：`http://127.0.0.1:5175/upload`，复用原布局/组件/字体/配色，结果显示在 `/review`。
- 浏览器真实提交合成简历成功：DeepSeek `deepseek-flash`，请求 `d903c153-4452-4c48-a512-40a841401fe0`，输入1025 tokens、输出1374 tokens、9153ms。页面展开了项目问题、原因、原文行及行动建议。
- 此前遇到供应商402，用户补充余额后恢复；另一次HTTP200输出未过业务校验，页面保持失败并保留输入，主动重试后成功。没有绕过校验或改成Mock伪成功。
- 后端Mock也通过实际页面提交，结果明确标记Mock，Python输入没有变成固定STM32事实。
- 48项前端测试、28项后端测试通过；前端 build、typecheck、lint 退出码0。后端测试有一条 Starlette/httpx 弃用提示，不影响当前通过结果。
- 前端源文件与运行验证副本核对119项，0差异；扫描源码与构建输出未发现配置的真实密钥。后端私有配置被Git忽略，未被跟踪。未执行生产部署。

## 运行位置及限制

旧 `bass/node_modules` 仍受Windows目录锁影响，未删除或覆盖。前端命令实际运行于 `.ua/frontend-migration/validation-ci`，业务源码在 `bass/`；上述核对确认源码一致。默认后端已配置真实模型，修改后端环境配置须重启服务。

结构和引用校验不能证明所有语义判断正确，仍需授权样本回归。PDF与事实确认/版本、持久化、动态追问按本轮边界保留到以后。不是正式V0服务。

运行说明：`backend/README.md`、`bass/README.md`。真实结果证据：`frontend-migration-evidence/real-ai-review-desktop.jpg`、`real-ai-review-mobile.jpg`、`real-ai-review.txt`；Mock证据：`backend-mock-review.jpg`。截图来自合成验收材料，不包含密钥或真实简历。
