# 知程 AI：首批即时文本初评

只提供本机内部验证，不提供正式 V0 服务。不建数据库、账号、Worker 或正式报告接口，不持久化简历与模型原始返回。

在仓库根目录运行（Python 3.13 已实测）：

```powershell
python -m venv .venv-backend
.venv-backend/Scripts/python.exe -m pip install -r backend/requirements-dev.txt
.venv-backend/Scripts/python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
.venv-backend/Scripts/python.exe -m pytest backend -q
```

`requirements.lock.txt` 记录本次实际安装的完整版本；重现完整环境可使用 `pip install -r backend/requirements.lock.txt`。

本机私有配置为 `backend/.env`（已被 Git 忽略），模板见 `.env.example`：

- `AI_MODE=mock`：后端确定性规则演示，返回 `analysis_mode=mock`，没有真实模型调用。
- `AI_MODE=deepseek`、`DEEPSEEK_API_KEY`、`AI_MODEL=deepseek-flash`：调用 DeepSeek 官方接口，关闭思考模式，限制输出及超时。
- `AI_MODE=dashscope`、`DASHSCOPE_API_KEY`、`AI_MODEL=qwen-plus`：百炼北京地域适配器；已做协议测试，本次没有对应凭据，未做真实调用。

修改环境配置后重启后端。密钥不得放入前端、`VITE_*` 或 Git。默认不自动重试付费模型请求，失败由用户主动重试。停止页面等待不保证取消供应商已经开始的调用。

## 已实现接口

`GET /api/v1/health` 返回模式及配置是否就绪；不会返回密钥。

`POST /api/v1/resume-reviews/analyze` 接收：

```json
{"text":"20至12000字的简历正文", "consent":true}
```

返回 `result_type=resume_initial_review`，含六个固定维度、问题/原因/行动建议、待确认事实、来源行及模型元数据。六维状态为 `clear / needs_improvement / unknown / not_applicable`。纯文本排版强制 `unknown`，无确认岗位强制 `not_applicable`；所有 Finding 标记 `pending_confirmation`。

错误统一为 `{"error":{"code":"...","message":"...","request_id":"...","retryable":false}}`。输入错误 422、请求过大 413、限流 429、输出非法 502、缺密钥/供应商拒绝 503、超时 504。供应商 402 映射为 `MODEL_QUOTA_EXHAUSTED`，不伪装成 Mock 成功。

固定供应商地址、禁止重定向；请求体限制 64KB，默认每分钟六次、并发两次。基础去敏移除常见手机号、邮箱、证件号及标明姓名/地址的行；不保证完整匿名。普通日志仅记录请求标识、模式、模型、时延、用量和失败类别，不保存正文、密钥或模型原始响应。

校验覆盖结构、六维唯一、来源有效、未知版式/岗位约束及部分无来源成果和数字。它不能证明所有语义判断正确，真实效果仍需授权样本与人工评估；不生成正式技能等级、录用概率或项目增强文本。

首批 API 是最新执行指令允许的同步简化，不实施两份设计中后续的会话、快照、持久队列、追问与增量重算。

协议参考：[DeepSeek JSON 模式](https://api-docs.deepseek.com/guides/json_mode/)、[DeepSeek 模型](https://api-docs.deepseek.com/quick_start/pricing/)、[错误码](https://api-docs.deepseek.com/quick_start/error_codes/)。使用 HTTP 兼容协议，不依赖或调用 OpenAI API/SDK。
