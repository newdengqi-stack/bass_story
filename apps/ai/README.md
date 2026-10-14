# apps/ai

**未实现。** 按 `webdesigned.md §8`，这里是 Python + FastAPI 的独立 AI 服务。

## 职责边界（§8，最容易搞混的一条）

```
NestJS（apps/api）：「用户有没有权限用简历分析？」—— 业务规则
Python（apps/ai） ：「分析这份简历。」        —— 模型推理
```

AI 服务**不得**直接改核心业务数据，只能通过明确接口或任务协议访问（§19禁止7）。
AI 服务**不直接与前端通信**，链路是 `Web → API → Queue → AI Worker → AI Service`。

## 现状说明

`apps/web` 里有两处「规则实现」承担了未来该由 AI 做的工作，都标注了这是演示实现：

- `apps/web/lib/jd-parse.ts` —— JD 标签抽取，当前是词典 + 正则
- `apps/web/lib/session-engine.ts` —— 追问生成与证据判定，当前是话题线索 + 阈值

两者的**边界设计**是按未来替换成模型来写的（`jd-parse.ts` 的注释明确了「规则定边界，AI 填语义」），
但替换时仍需重新评估判定阈值。
