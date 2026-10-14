from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator, model_validator

Dimension = Literal['completeness', 'layout_readability', 'self_intro', 'project_expression', 'evidence_expression', 'role_relevance']
DimensionStatus = Literal['clear', 'needs_improvement', 'unknown', 'not_applicable']
Text = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=1200)]
DIMENSIONS = ('completeness', 'layout_readability', 'self_intro', 'project_expression', 'evidence_expression', 'role_relevance')
TITLES = dict(zip(DIMENSIONS, ('信息与结构完整性', '排版与可读性', '个人介绍', '项目表达', '技术证据表达', '岗位针对性')))


class StrictModel(BaseModel):
    model_config = ConfigDict(extra='forbid')


class AnalyzeRequest(StrictModel):
    text: str = Field(min_length=20, max_length=12000)
    consent: Literal[True]

    @field_validator('consent', mode='before')
    @classmethod
    def explicit_consent(cls, value):
        if value is not True:
            raise ValueError('必须明确同意本次分析')
        return value

    @field_validator('text')
    @classmethod
    def trim_text(cls, value: str) -> str:
        if len(value.strip()) < 20 or '\x00' in value:
            raise ValueError('请输入20至12000字的有效简历文本')
        return value.strip()


class SourceSpan(StrictModel):
    span_id: str
    line: int = Field(ge=1)
    quote: Text


class DimensionProposal(StrictModel):
    dimension: Dimension
    status: DimensionStatus
    evidence_refs: list[str] = Field(max_length=8)
    explanation: Text


class FindingProposal(StrictModel):
    dimension: Dimension
    issue: Text
    reason: Text
    action: Text
    source_span_ids: list[str] = Field(min_length=1, max_length=8)
    missing_facts: list[Text] = Field(default_factory=list, max_length=5)


class ReviewProposal(StrictModel):
    dimensions: list[DimensionProposal] = Field(min_length=6, max_length=6)
    findings: list[FindingProposal] = Field(max_length=12)

    @model_validator(mode='after')
    def six_unique_dimensions(self):
        if {item.dimension for item in self.dimensions} != set(DIMENSIONS):
            raise ValueError('六维必须恰好各出现一次')
        return self


class ReviewDimension(DimensionProposal):
    title: str


class Finding(FindingProposal):
    finding_id: str
    confirmation_state: Literal['pending_confirmation'] = 'pending_confirmation'


class ModelMetadata(StrictModel):
    provider: str
    model: str
    prompt_version: str = 'resume-review-1'
    schema_version: str = 'resume-review-1'
    policy_version: str = 'text-initial-review-1'
    input_tokens: int | None = None
    output_tokens: int | None = None
    elapsed_ms: int = Field(ge=0)


class AnalyzeResponse(StrictModel):
    request_id: str
    analysis_mode: Literal['mock', 'model']
    result_type: Literal['resume_initial_review'] = 'resume_initial_review'
    notice: str
    dimensions: list[ReviewDimension]
    findings: list[Finding]
    sources: list[SourceSpan]
    metadata: ModelMetadata


class ErrorDetail(StrictModel):
    code: str
    message: str
    request_id: str
    retryable: bool


class ErrorResponse(StrictModel):
    error: ErrorDetail


class HealthResponse(StrictModel):
    status: Literal['ok'] = 'ok'
    ai_mode: Literal['mock', 'dashscope', 'deepseek']
    model_configured: bool
    internal_only: Literal[True] = True
