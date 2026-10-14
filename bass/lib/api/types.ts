export type RoleKey = 'mcu' | 'linux' | 'cpp'
export type Mode = 'existing' | 'explore' | 'skillonly'
export type AnswerStatus = 'answered' | 'skipped' | 'pending'
export interface Skill {
  id: string
  label: string
  confirmed: boolean
}
export interface Candidate {
  id: string
  resumeId: string
  version: string
  source: string
  skills: Skill[]
  projectName: string
  contribution: string
  noProject: boolean
}
export interface CandidateInput {
  resumeId: string
  source: string
  skills: Skill[]
  projectName: string
  contribution: string
  noProject: boolean
  version: string
}
export interface Requirement {
  skill: string
  quote: string
  importance: 'must' | 'important' | 'bonus' | 'pending'
  confirmed: boolean
}
export interface Question {
  id: string
  version: string
  dimension: string
  prompt: string
  hint: string
}
export interface Assessment {
  id: string
  version: string
  questions: Question[]
}
export interface ReviewDimension {
  id: string
  title: string
  status: 'clear' | 'improve' | 'unknown' | 'na'
  quote?: string
  explanation: string
  action?: string
}
export interface ReviewStatus {
  submissionId: string
  review:
    | 'pending_human_review'
    | 'needs_revision'
    | 'rejected'
    | 'approved'
    | 'published'
  processing: 'waiting' | 'reviewing' | 'completed' | 'unable_to_complete'
  access: 'active' | 'expired' | 'revoked'
  canRequestReport: boolean
  reportVersion: string | null
  message: string
}
export interface PublishedReport {
  id: string
  version: string
  hash: string
  authorized: true
  review: 'published'
  access: 'active'
  expiresAt: string
  approval: { version: string; hash: string }
  sources: {
    candidateSnapshotId: string
    assessmentSnapshotId: string
    roleProfileId: string | null
    rubricVersion: string
  }
  summary: string
  skills: {
    label: string
    performance:
      | 'not_tested'
      | 'insufficient_evidence'
      | 'graded'
      | 'demonstrated_below_L1'
      | 'disputed'
    level: null | 'L1' | 'L2' | 'L3'
    evidence: {
      questionId: string
      answerId: string
      rubricVersion: string
      quote: string
    }[]
  }[]
  recommendations: {
    priority: 'now' | 'later' | 'defer'
    title: string
    reason: string
    action: string
    deliverable: string
    acceptance: string
  }[]
  safeResumeText: string | null
}
export interface BusinessApi {
  parseResume(
    input: { file: File | null; text: string; consent: boolean },
    signal?: AbortSignal,
  ): Promise<Candidate>
  confirmCandidate(
    input: CandidateInput,
    signal?: AbortSignal,
  ): Promise<Candidate>
  reviewCandidate(
    input: CandidateInput,
    signal?: AbortSignal,
  ): Promise<ReviewDimension[]>
  analyzeRole(
    text: string,
    role: RoleKey,
    signal?: AbortSignal,
  ): Promise<Requirement[]>
  createAssessment(
    input: {
      mode: Mode
      role: RoleKey | null
      candidateId: string
      key?: string
    },
    signal?: AbortSignal,
  ): Promise<Assessment>
  saveAnswer(
    id: string,
    question: string,
    answer: string,
    status: 'answered' | 'skipped',
    key: string,
    signal?: AbortSignal,
    versions?: { question: string; assessment: string },
  ): Promise<string>
  submit(id: string, key: string, signal?: AbortSignal): Promise<ReviewStatus>
  reviewStatus(id: string, signal?: AbortSignal): Promise<ReviewStatus>
  report(id: string, signal?: AbortSignal): Promise<PublishedReport>
  deleteData(
    signal?: AbortSignal,
  ): Promise<{ receiptId: string; state: 'pending' | 'completed' }>
}
