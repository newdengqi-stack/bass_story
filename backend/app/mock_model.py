from .schemas import DIMENSIONS, DimensionProposal, FindingProposal, ReviewProposal, SourceSpan


def mock_proposal(spans: list[SourceSpan]) -> ReviewProposal:
    """Deterministic, disclosed rule demo; never described as a model inference."""
    project = next((s for s in spans if any(x in s.quote for x in ['项目', '参与', '负责'])), None)
    claim = next((s for s in spans if any(x in s.quote for x in ['熟悉', '精通', '了解'])), None)
    findings = [FindingProposal(
        dimension='completeness', issue='请核对经历的时间与职责信息',
        reason='仅有自述文本，需由本人核对教育和经历的时间、职责是否足够明确。',
        action='检查每段经历的起止时间和本人任务；只补充真实可核对的信息。',
        source_span_ids=[spans[0].span_id], missing_facts=['待本人核对经历时间与职责'],
    )]
    if project:
        findings.append(FindingProposal(
            dimension='project_expression', issue='项目整体与本人任务需要分开确认',
            reason='项目描述本身不能证明每项任务均由本人完成。',
            action='补充本人实际承担的模块、一次真实排查过程及验证方式；无法确认的内容保留待确认。',
            source_span_ids=[project.span_id], missing_facts=['本人实际负责的任务', '真实验证方式'],
        ))
    if claim:
        findings.append(FindingProposal(
            dimension='evidence_expression', issue='技术熟悉程度仍属于自述',
            reason='熟悉或精通等措辞本身不构成独立技术验证。',
            action='在确有经历时补充使用该技术的具体任务、操作过程或可追溯材料，不编造数据。',
            source_span_ids=[claim.span_id], missing_facts=['技术声明对应的实际使用材料'],
        ))
    dimensions = []
    for dimension in DIMENSIONS:
        related = [f for f in findings if f.dimension == dimension]
        status = 'needs_improvement' if related else 'unknown'
        explanation = 'Mock 规则演示，不是 AI 判断；需本人核对相关材料。'
        if dimension == 'role_relevance':
            status, explanation = 'not_applicable', '未确认目标岗位，本项暂不适用。'
        elif dimension == 'layout_readability':
            explanation = '只有纯文本，没有可观察的页面版式证据，无法判断排版质量。'
        dimensions.append(DimensionProposal(
            dimension=dimension, status=status, explanation=explanation,
            evidence_refs=list(dict.fromkeys(ref for f in related for ref in f.source_span_ids)),
        ))
    return ReviewProposal(dimensions=dimensions, findings=findings)
