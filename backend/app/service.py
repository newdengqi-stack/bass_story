import re
import logging
from uuid import uuid4

from pydantic import ValidationError

from .errors import AnalysisError
from .gateway import ModelGateway
from .schemas import AnalyzeResponse, Finding, ModelMetadata, ReviewDimension, ReviewProposal, SourceSpan, TITLES

logger = logging.getLogger('zhicheng.analysis.validation')


def source_spans(text: str) -> list[SourceSpan]:
    text = re.sub(r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}', '[邮箱已移除]', text)
    text = re.sub(r'(?<!\d)1[3-9]\d{9}(?!\d)', '[手机号已移除]', text)
    text = re.sub(r'(?<!\d)\d{17}[\dXx](?!\w)', '[证件号已移除]', text)
    spans = []
    for line_number, line in enumerate(text.splitlines(), 1):
        if re.match(r'^\s*(姓名|住址|地址|身份证)[：:]', line):
            continue
        for start in range(0, len(line), 800):
            quote = line[start:start + 800].strip()
            if quote:
                spans.append(SourceSpan(span_id=f's{len(spans) + 1}', line=line_number, quote=quote))
    if not spans:
        raise AnalysisError('EMPTY_RESUME', '去除联系方式后没有可分析的简历正文。', 422)
    return spans


def validate_business(proposal: ReviewProposal, spans: list[SourceSpan]) -> None:
    allowed = {span.span_id for span in spans}
    source = '\n'.join(s.quote for s in spans)
    for dimension in proposal.dimensions:
        if not set(dimension.evidence_refs) <= allowed:
            raise ValueError('unknown dimension source')
        if dimension.status in ('clear', 'needs_improvement') and not dimension.evidence_refs:
            raise ValueError('missing dimension source')
        if dimension.dimension == 'layout_readability' and dimension.status != 'unknown':
            raise ValueError('layout is not observable')
        if dimension.dimension == 'role_relevance' and dimension.status != 'not_applicable':
            raise ValueError('no confirmed role')
    texts = [d.explanation for d in proposal.dimensions]
    for finding in proposal.findings:
        if not set(finding.source_span_ids) <= allowed:
            raise ValueError('unknown finding source')
        if finding.dimension in ('layout_readability', 'role_relevance'):
            raise ValueError('unsupported finding scope')
        texts.extend([finding.issue, finding.reason, finding.action, *finding.missing_facts])
    narrative = '\n'.join(texts)
    if re.search(r'\bL[0-3]\b|录用概率|获面概率|综合评分|\d+\s*分|已通过.{0,8}认证', narrative):
        raise ValueError('formal or numeric assessment')
    if any(number not in re.findall(r'\d+(?:\.\d+)?%?', source)
           for number in re.findall(r'\d+(?:\.\d+)?%?', narrative)):
        raise ValueError('unsupported number')
    for phrase in ('独立主导', '独立完成', '全面负责', '提升了', '降低了', '优化至'):
        if phrase in narrative and phrase not in source:
            raise ValueError('unsupported achievement')


class ReviewService:
    def __init__(self, gateway: ModelGateway):
        self.gateway = gateway

    async def analyze(self, text: str, request_id: str) -> AnalyzeResponse:
        spans = source_spans(text)
        result = await self.gateway.review(spans)
        try:
            proposal = ReviewProposal.model_validate_json(result.content)
            validate_business(proposal, spans)
        except ValidationError as error:
            logger.warning('proposal_schema_invalid request_id=%s fields=%s', request_id,
                           [(item['loc'], item['type']) for item in error.errors(include_input=False, include_url=False)])
            raise AnalysisError('MODEL_OUTPUT_INVALID', '模型输出未通过六维结构检查，请重试；未生成有效初评。', 502, True) from None
        except ValueError as error:
            logger.warning('proposal_rule_invalid request_id=%s rule=%s', request_id, str(error))
            raise AnalysisError('MODEL_OUTPUT_INVALID', '模型输出未通过六维结构、来源或事实约束检查，请重试；未生成有效初评。', 502, True) from None
        refs = {ref for item in proposal.dimensions for ref in item.evidence_refs}
        refs.update(ref for finding in proposal.findings for ref in finding.source_span_ids)
        return AnalyzeResponse(
            request_id=request_id, analysis_mode='mock' if result.provider == 'mock' else 'model',
            notice=('MOCK · 后端规则演示，未调用真实模型。' if result.provider == 'mock' else 'AI 文字初评 · 已调用国内模型。') +
                   '仅依据未经独立核实的简历自述；不代表技能认证或正式技术报告，疑点与缺失事实待本人确认。',
            dimensions=[ReviewDimension(**d.model_dump(), title=TITLES[d.dimension]) for d in proposal.dimensions],
            findings=[Finding(**f.model_dump(), finding_id=str(uuid4())) for f in proposal.findings],
            sources=[span for span in spans if span.span_id in refs],
            metadata=ModelMetadata(provider=result.provider, model=result.model, elapsed_ms=result.elapsed_ms,
                                   input_tokens=result.input_tokens, output_tokens=result.output_tokens),
        )
