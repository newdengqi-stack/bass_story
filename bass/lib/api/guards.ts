import { ApiError, array, bool, enumValue, record, string } from './client'
import type { Candidate, PublishedReport, ReviewStatus } from './types'
export function mapCandidate(value: unknown): Candidate {
  const d = record(value)
  const project = d.project == null ? null : record(d.project)
  return {
    id: string(d.id),
    resumeId: string(d.resume_id),
    version: string(d.version),
    source: string(d.source_text),
    skills: array(d.skill_claims).map((v) => {
      const s = record(v)
      return {
        id: string(s.id),
        label: string(s.label),
        confirmed: bool(s.confirmed),
      }
    }),
    projectName: project ? string(project.name) : '',
    contribution: project ? string(project.contribution) : '',
    noProject: !project,
  }
}
export function mapReviewStatus(value: unknown): ReviewStatus {
  const d = record(value)
  return {
    submissionId: string(d.submission_id),
    review: enumValue(d.review_status, [
      'pending_human_review',
      'needs_revision',
      'rejected',
      'approved',
      'published',
    ]),
    processing: enumValue(d.processing_state, [
      'waiting',
      'reviewing',
      'completed',
      'unable_to_complete',
    ]),
    access: enumValue(d.access_state, ['active', 'expired', 'revoked']),
    canRequestReport: bool(d.can_request_report),
    reportVersion: d.report_version === null ? null : string(d.report_version),
    message: string(d.message),
  }
}
export function mapReport(value: unknown): PublishedReport {
  const d = record(value),
    approval = record(d.approval),
    sources = record(d.sources)
  if (
    d.authorized_for_current_session !== true ||
    d.review_status !== 'published' ||
    d.access_state !== 'active'
  )
    throw new ApiError(403, '该报告未获当前会话发布授权。')
  const result: PublishedReport = {
    id: string(d.id),
    version: string(d.version),
    hash: string(d.report_hash),
    authorized: true,
    review: 'published',
    access: 'active',
    expiresAt: string(d.expires_at),
    approval: {
      version: string(approval.approved_version),
      hash: string(approval.report_hash),
    },
    sources: {
      candidateSnapshotId: string(sources.candidate_snapshot_id),
      assessmentSnapshotId: string(sources.assessment_snapshot_id),
      roleProfileId:
        sources.role_profile_id === null
          ? null
          : string(sources.role_profile_id),
      rubricVersion: string(sources.rubric_version),
    },
    summary: string(d.summary),
    skills: array(d.skills).map((value) => {
      const s = record(value)
      const level =
        s.assessed_level === null
          ? null
          : enumValue(s.assessed_level, ['L1', 'L2', 'L3'])
      const performance = enumValue(s.performance_state, [
        'not_tested',
        'insufficient_evidence',
        'graded',
        'demonstrated_below_L1',
        'disputed',
      ])
      const evidence = array(s.evidence).map((value) => {
        const e = record(value)
        return {
          questionId: string(e.question_id),
          answerId: string(e.answer_id),
          rubricVersion: string(e.rubric_version),
          quote: string(e.quote),
        }
      })
      if (
        evidence.some(
          (e) =>
            !e.questionId ||
            !e.answerId ||
            !e.quote ||
            e.rubricVersion !== sources.rubric_version,
        ) ||
        (performance === 'demonstrated_below_L1' && !evidence.length)
      )
        throw new ApiError(0, '报告证据缺少可追溯来源。')
      if (
        (performance !== 'graded' && level !== null) ||
        (performance === 'graded' && (level === null || !evidence.length))
      )
        throw new ApiError(0, '报告等级与证据状态冲突。')
      return { label: string(s.label), performance, level, evidence }
    }),
    recommendations: array(d.recommendations).map((value) => {
      const r = record(value)
      return {
        priority: enumValue(r.priority, ['now', 'later', 'defer']),
        title: string(r.title),
        reason: string(r.reason),
        action: string(r.action),
        deliverable: string(r.deliverable),
        acceptance: string(r.acceptance),
      }
    }),
    safeResumeText:
      d.safe_resume_text === null ? null : string(d.safe_resume_text),
  }
  if (
    !result.sources.candidateSnapshotId ||
    !result.sources.assessmentSnapshotId ||
    !result.sources.rubricVersion
  )
    throw new ApiError(0, '报告缺少源快照或评分标准版本。')
  if (!isAuthorizedReport(result))
    throw new ApiError(403, '报告审批版本、有效期或内容标识不一致。')
  return result
}
export function isAuthorizedReport(
  report: PublishedReport | null,
  now = Date.now(),
): report is PublishedReport {
  return (
    !!report &&
    report.authorized === true &&
    report.review === 'published' &&
    report.access === 'active' &&
    !!report.version &&
    !!report.hash &&
    report.version === report.approval.version &&
    report.hash === report.approval.hash &&
    Date.parse(report.expiresAt) > now
  )
}
