// Wire contract draft. Replace this file with generated OpenAPI types after FastAPI agreement.
export interface SkillClaimDto {
  id: string
  label: string
  confirmed: boolean
}
export interface CandidateDto {
  id: string
  resume_id: string
  version: string
  source_text: string
  skill_claims: SkillClaimDto[]
  project: { name: string; contribution: string } | null
}
export interface ReviewStatusDto {
  submission_id: string
  review_status: 'pending_human_review' | 'needs_revision' | 'rejected' | 'approved' | 'published'
  processing_state: 'waiting' | 'reviewing' | 'completed' | 'unable_to_complete'
  access_state: 'active' | 'expired' | 'revoked'
  can_request_report: boolean
  report_version: string | null
  message: string
}
