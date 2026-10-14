# FastAPI 接入契约草案

状态：**仅规划，接口、DTO及后端均未实现/批准**。依据 PRD V1.1 §6.0、§11、§19。路径以 `/api/v1` 为建议统一前缀，最终以 FastAPI 发布的 OpenAPI 为准。

## 1. 所需接口

| 方法 / 路径（建议） | 用途 | 输入 | 输出/关键异常 |
|---|---|---|---|
| POST `/sessions` | V0受控会话，不做完整账号 | 邀请凭据、已展示的告知版本和必要同意；研究用途独立可选 | 会话公开标识/到期时间，安全Cookie由后端设置；无效邀请码、限流 |
| GET `/sessions/current` | 刷新后的会话恢复 | Cookie | 当前资料/诊断/任务/审核引用；无会话/到期/撤销 |
| GET `/upload-policy` | 上传与文本校验政策 | 无 | MIME/扩展名/字节/文本长度等限制；前端不得假设这是安全替代 |
| POST `/resumes` | 文件上传并排队解析 | multipart文件、用途同意引用、幂等键 | resume_id、task_id；413/415/422，扫描/加密/空白PDF失败通过任务结果表达 |
| POST `/resumes/text` | 文本或手动补录入口 | text、输入来源、同意引用、幂等键 | resume_id、task_id或显式草稿 |
| GET `/tasks/{task_id}` | 解析/JD/报告生成进度 | 任务ID及会话授权 | 任务状态、可知的进度和结果引用；超时、失败、取消；不得虚构百分比 |
| GET `/resumes/{id}/draft` | 查看提取草稿 | resume_id | 来源片段、技能/项目草稿、不确定项/未知排版 |
| PUT `/resumes/{id}/confirmation` | 保存用户确认事实 | source_version、技能确认、项目/本人贡献或无项目、事实确认 | CandidateSnapshot及版本；409版本冲突、422输入错误 |
| GET `/resumes/{id}/review` | 问答前六维文字初评 | 确认快照引用 | 非数值评价、引用与建议；无项目unknown、无岗位na，不含正式技术等级 |
| GET `/role-profiles` | 三原型列表及审核来源 | 限定岗位族 | 已校准与演示模板分开、版本/来源/边界；不把缺失JD当不需要 |
| POST `/roles/analyze` | 粘贴JD/方向探索 | mode、候选资料版本、JD文本或原型ID | 任务或RoleProfile草稿、冲突/未确认需求 |
| PUT `/role-profiles/{id}/confirmation` | 确认岗位需求 | source_version、已确认技能/重要度 | 已确认RoleProfile版本；409旧版失效 |
| POST `/assessments` | 创建受限诊断 | candidate_snapshot_id、mode、role_profile_id或null、策略版本、幂等键 | 诊断会话、题目预算/覆盖边界；不能创建全能能力结论 |
| GET `/assessments/{id}` | 恢复当前诊断 | assessment_id | 已存回答/草稿/跳过、当前位置、预算、版本 |
| GET `/assessments/{id}/question` | 当前可答题目 | 会话ID、必要游标 | question_id/version、主题、文本/代码块、允许动作；重复/无效题处理 |
| PUT `/assessments/{id}/answers/{question_id}` | 提交回答或跳过 | question_version、answer或skipped、expected_version、幂等键 | 已接收记录/会话版本/下一题引用；409冲突/重复幂等返回原结果 |
| PATCH `/assessments/{id}` | 暂停/恢复、保存服务支持的草稿 | action、版本、可选草稿 | 会话状态与已保存记录 |
| POST `/assessments/{id}/clarifications` | 用户请求澄清/指出题目歧义 | question_id/version、原因、幂等键 | 说明/任务引用；是否作废由后端题目策略判定，前端不自行扣分 |
| POST `/assessments/{id}/submission` | 完成问答并生成待审任务 | 当前会话版本、幂等键 | submission_id、task_id、恢复入口；不直接返回未审正式结论 |
| GET `/submissions/{id}/review-status` | 查询审核与发布状态 | submission_id、Cookie | ReviewStatusDto；无权/到期/撤销；不返回草稿正文 |
| GET `/submissions/{id}/report` | 获得授权正式报告 | 当前会话和提交引用，可选期望版本 | 仅已授权发布版本及引用；未发布/越权/撤销/版本冲突不含正文 |
| DELETE `/sessions/current/data` | 请求删除个人资料 | 删除确认、同意撤回范围、幂等键 | deletion_receipt_id、accepted/pending，立即撤销受影响内容访问 |
| GET `/deletions/{receipt_id}` | 查看删除执行状态 | 服务端明确允许的回执授权方式 | pending/completed/failed/needs_action、范围；访问撤销后回执如何授权由后端设计确定 |

报告示例是前端公开fixture，不伪装成对上述正式报告接口的授权访问。当前不增加审核员后台写接口，也不模拟数据库直接连接。

## 2. DTO 与领域模型

以下 TypeScript 只描述拟消费结构，不是新增源码。后端生成DTO保留snake_case；前端展示模型用mapper转换，不在同一个对象混用UI状态与后端实体。

```ts
type ReviewStatus =
  | 'draft_ai' | 'pending_human_review' | 'needs_revision'
  | 'rejected' | 'approved' | 'published';
type AssessmentStatus =
  | 'not_started' | 'in_progress' | 'partial' | 'sufficient'
  | 'insufficient_evidence' | 'needs_review';
type PerformanceState =
  | 'not_tested' | 'insufficient_evidence'
  | 'demonstrated_below_L1' | 'graded' | 'disputed';
type AssessedLevel = null | 'L1' | 'L2' | 'L3';
type TaskState = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
type AccessState = 'active' | 'expired' | 'revoked';
type ReviewProcessingState = 'waiting' | 'reviewing' | 'completed' | 'unable_to_complete';

interface SourceRefDto {
  source_id: string;
  source_version: string;
  span_id: string;
  quote: string;
}
interface SkillClaimDto {
  skill_id: string;
  label: string;
  confirmed: boolean;
  sources: SourceRefDto[];
}
interface CandidateSnapshotDto {
  id: string;
  version: string;
  resume_id: string;
  skill_claims: SkillClaimDto[];
  project: null | {
    name: string;
    contribution: string;
    sources: SourceRefDto[];
  };
  project_material_state: 'provided' | 'not_provided' | 'unknown';
  facts_confirmed: boolean;
}
interface RoleProfileDto {
  id: string;
  version: string;
  source_kind: 'reviewed_template' | 'confirmed_jd' | 'demo';
  review_status: 'draft' | 'approved';
  requirements: Array<{
    skill_id: string;
    importance: 'must' | 'important' | 'bonus' | 'not_required';
    target_level: AssessedLevel;
    must_evaluate: boolean;
    confirmed: boolean;
    sources: SourceRefDto[];
  }>;
}
interface QuestionDto {
  id: string;
  version: string;
  dimension: string;
  blocks: Array<{kind: 'text'; text: string} | {kind: 'code'; language: string; code: string}>;
  hint: string | null;
  allowed_actions: Array<'answer' | 'skip' | 'clarify'>;
}
interface AssessmentSessionDto {
  id: string;
  version: string;
  mode: 'existing' | 'explore' | 'skillonly';
  candidate_snapshot_id: string;
  role_profile_id: string | null;
  assessment_status: AssessmentStatus;
  question_budget: {min: number; max: number; policy_version: string};
  responses: Array<{
    question_id: string;
    question_version: string;
    state: 'draft' | 'answered' | 'skipped' | 'invalidated';
    answer: string | null;
  }>;
  answered_count: number;
  skipped_count: number;
  current_question_id: string | null;
}
interface ReviewStatusDto {
  submission_id: string;
  review_status: ReviewStatus;
  processing_state: ReviewProcessingState;
  access_state: AccessState;
  report_version: string | null;
  can_request_report: boolean;
  message: string;
  resume_view_path: string | null; // 站内路径；不能把令牌放在URL查询参数
}
interface PublishedReportDto {
  id: string;
  version: string;
  report_hash: string;
  review_status: 'published';
  authorized_for_current_session: true;
  approval: {approved_version: string; report_hash: string; approved_at: string};
  sources: {
    candidate_snapshot_id: string;
    assessment_snapshot_id: string;
    role_profile_id: string | null;
    rubric_version: string;
  };
  coverage: null | {sufficiently_evaluated: number; must_evaluate: number; reviewed_scope_version: string};
  skills: Array<{
    skill_id: string;
    assessed_level: AssessedLevel;
    assessment_status: AssessmentStatus;
    performance_state: PerformanceState;
    evidence_ids: string[];
  }>;
  project_review: null | {layers: Array<{kind: 'project' | 'contribution' | 'role_value'; explanation: string; evidence_ids: string[]}>};
  gaps: Array<{kind: string; explanation: string; evidence_ids: string[]}>;
  actions: Array<{
    priority: 'now' | 'later' | 'defer';
    title: string;
    reason: string;
    steps: string[];
    deliverable: string;
    acceptance: string;
    alternative: string | null;
    evidence_ids: string[];
  }>;
  resume_suggestions: Array<{original: string; suggestion: string; confirmed_fact_refs: string[]; pending_facts: string[]}>;
}
```

正式 `GapKind`、六维初评DTO、错误码、任务结果联合类型将在后端契约定稿时枚举化；不得把这里的简略字符串当成已经足够完整的生产校验。审批人完整身份信息不必向普通用户暴露，后端必须保留审核人和审计记录。

## 3. 错误、版本与异步约定

- 建议业务错误包含 `code/message/request_id/retryable/field_errors`；兼容FastAPI默认422 `detail`，由统一client转换为UI错误模型，不直接显示堆栈。
- 401无会话、403无授权、404不存在、409旧版本/冲突、410到期/撤销、413超限、415格式、422字段错误、429限流、5xx服务错误；具体语义由OpenAPI确定。
- 上传/解析/JD/报告使用 `202 + task_id`；任务成功只返回对应资源引用，不在进度接口泄露未审报告正文。
- 写操作使用幂等键和期望版本；网络重试不能重复累计回答证据；409引导重新加载当前版本。
- frontend异步状态与审查状态分离；未知枚举/缺关键字段应显示不兼容错误，不能默认published/成功。
- 长任务轮询退避，离开页面取消；重新进入通过资源ID恢复。UI不把任务running映射成技能in_progress以外的确定等级。
- Coverage只有分母经审核且非零时显示；null等级不当0分；题目无效不归入错误数。报告内容生成/授级/Gap判定由后端处理。

## 4. 访问与隐私边界

- 前端只通过业务API工作；公开配置只含模式和API基址。无模型Key、数据库密码或内部Agent URL。
- 优先同源 `/api`、后端 HttpOnly/Secure/SameSite Cookie；前端不在Web Storage保存认证凭据。跨域与CSRF细节需后端明确。
- 发布接口必须先在服务端检查会话、审核记录、报告版本/hash、撤销与过期，再返回正文；前端状态检查只管理体验，无法证明真实审批。
- 关闭待审正文、避免浏览器缓存旧敏感版本、撤回后清理已显示内容都需要联动；不声称仅增加路由守卫就实现安全。
- 删除需要任务/回执状态；完成定义应覆盖主存储、对象、日志/备份/供应商约定，未确认不能显示全链路完成。
- Mock适配器使用同接口返回合成数据和可切换失败状态，只清除本地内存；不默默持久化简历、不自动将真实输入发送模型、不冒充真实人工审核。

## 5. 后续OpenAPI类型生成

当前没有真实OpenAPI文件，因此本轮未生成或声称生成客户端。后端发布稳定schema后，将生成文件放在独立目录，业务展示模型继续保留mapper；生成器/版本、命令和校验随实际schema确定，不提前安装空用工具。
