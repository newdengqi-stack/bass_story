import type { ResumeAnalysis } from './resume-analysis'
import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type {
  AnswerStatus,
  Assessment,
  Candidate,
  CandidateInput,
  Mode,
  Requirement,
  ReviewStatus,
  RoleKey,
  Skill,
} from './api/types'
import { resetMockApi } from './api'
export { ROLE_PROFILES } from './api/fixtures'
export type UsageMode = Mode | null
export type RoleId = RoleKey | null
export type SkillClaim = Skill
interface State {
  initialReview: ResumeAnalysis | null
  resumeFileName: string | null
  resumeText: string
  privacyConfirmed: boolean
  skillClaims: Skill[]
  projectName: string
  projectContribution: string
  noProject: boolean
  factsConfirmed: boolean
  candidateId: string
  resumeId: string
  candidateVersion: string
  parsed: boolean
  revision: number
  mode: UsageMode
  roleId: RoleId
  jdText: string
  jdExtracted: boolean
  requirements: Requirement[]
  scopeConfirmed: boolean
  assessment: Assessment | null
  drafts: Record<string, string>
  statuses: Record<string, AnswerStatus>
  questionIndex: number
  responseVersion: number
  submitted: boolean
  submissionId: string
  status: ReviewStatus | null
}
const initial = (): State => ({
  initialReview: null,
  resumeFileName: null,
  resumeText: '',
  privacyConfirmed: false,
  skillClaims: [],
  projectName: '',
  projectContribution: '',
  noProject: false,
  factsConfirmed: false,
  candidateId: '',
  resumeId: '',
  candidateVersion: '0',
  parsed: false,
  revision: 0,
  mode: null,
  roleId: null,
  jdText: '',
  jdExtracted: false,
  requirements: [],
  scopeConfirmed: false,
  assessment: null,
  drafts: {},
  statuses: {},
  questionIndex: 0,
  responseVersion: 0,
  submitted: false,
  submissionId: '',
  status: null,
})
type Action =
  | { type: 'set'; key: keyof State; value: State[keyof State] }
  | { type: 'candidate'; value: Candidate }
  | { type: 'accepted'; value: Candidate }
  | { type: 'reset' }
const clearAssessment = {
  assessment: null,
  drafts: {},
  statuses: {},
  questionIndex: 0,
  responseVersion: 0,
  submitted: false,
  submissionId: '',
  status: null,
}
function reducer(s: State, a: Action): State {
  if (a.type === 'reset') return initial()
  if (a.type === 'accepted')
    return {
      ...s,
      candidateId: a.value.id,
      resumeId: a.value.resumeId,
      candidateVersion: a.value.version,
    }
  if (a.type === 'candidate')
    return {
      ...s,
      ...clearAssessment,
      candidateId: a.value.id,
      resumeId: a.value.resumeId,
      candidateVersion: a.value.version,
      resumeText: a.value.source,
      skillClaims: a.value.skills,
      projectName: a.value.projectName,
      projectContribution: a.value.contribution,
      noProject: a.value.noProject,
      parsed: true,
      factsConfirmed: false,
      revision: s.revision + 1,
    }
  if (s[a.key] === a.value) return s
  let next = { ...s, [a.key]: a.value }
  if (['resumeText', 'resumeFileName'].includes(a.key))
    next = {
      ...next,
      ...clearAssessment,
      parsed: false,
      initialReview: null,
      candidateId: '',
      skillClaims: [],
      projectName: '',
      projectContribution: '',
      factsConfirmed: false,
      scopeConfirmed: false,
      revision: s.revision + 1,
    }
  if (
    ['skillClaims', 'projectName', 'projectContribution', 'noProject'].includes(
      a.key,
    )
  )
    next = {
      ...next,
      ...clearAssessment,
      factsConfirmed: false,
      scopeConfirmed: false,
      revision: s.revision + 1,
    }
  if (['mode', 'roleId', 'jdText'].includes(a.key))
    next = {
      ...next,
      ...clearAssessment,
      scopeConfirmed: false,
      jdExtracted: false,
      requirements: [],
      revision: s.revision + 1,
    }
  if (a.key === 'mode' && a.value === 'skillonly') next.roleId = null
  if (a.key === 'drafts') {
    const drafts = a.value as Record<string, string>
    const statuses = { ...s.statuses }
    for (const key of Object.keys(drafts))
      if (drafts[key] !== s.drafts[key]) statuses[key] = 'pending'
    next = {
      ...next,
      statuses,
      responseVersion: s.responseVersion + 1,
      submitted: false,
      submissionId: '',
      status: null,
    }
  }
  if (a.key === 'statuses')
    next = {
      ...next,
      responseVersion: s.responseVersion + 1,
      submitted: false,
      submissionId: '',
      status: null,
    }
  return next
}
type Setters = {
  [K in
    | 'initialReview'
    | 'resumeFileName'
    | 'resumeText'
    | 'privacyConfirmed'
    | 'skillClaims'
    | 'projectName'
    | 'projectContribution'
    | 'noProject'
    | 'factsConfirmed'
    | 'mode'
    | 'roleId'
    | 'jdText'
    | 'jdExtracted'
    | 'requirements'
    | 'scopeConfirmed'
    | 'assessment'
    | 'drafts'
    | 'statuses'
    | 'questionIndex'
    | 'submitted'
    | 'submissionId'
    | 'status' as `set${Capitalize<K>}`]: (value: State[K]) => void
}
interface FlowValue extends State, Setters {
  answeredCount: number
  skippedCount: number
  candidateInput: CandidateInput
  applyCandidate: (candidate: Candidate) => void
  acceptCandidate: (candidate: Candidate) => void
  reset: () => void
}
const Context = createContext<FlowValue | null>(null)
export function FlowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initial)
  const setters = useMemo(() => {
    const fields = [
      'initialReview',
      'resumeFileName',
      'resumeText',
      'privacyConfirmed',
      'skillClaims',
      'projectName',
      'projectContribution',
      'noProject',
      'factsConfirmed',
      'mode',
      'roleId',
      'jdText',
      'jdExtracted',
      'requirements',
      'scopeConfirmed',
      'assessment',
      'drafts',
      'statuses',
      'questionIndex',
      'submitted',
      'submissionId',
      'status',
    ] as const
    return Object.fromEntries(
      fields.map((key) => [
        `set${key[0].toUpperCase() + key.slice(1)}`,
        (value: State[typeof key]) => dispatch({ type: 'set', key, value }),
      ]),
    ) as Setters
  }, [])
  const value = useMemo<FlowValue>(
    () => ({
      ...state,
      ...setters,
      answeredCount: Object.values(state.statuses).filter(
        (s) => s === 'answered',
      ).length,
      skippedCount: Object.values(state.statuses).filter((s) => s === 'skipped')
        .length,
      candidateInput: {
        resumeId: state.resumeId,
        source: state.resumeText,
        skills: state.skillClaims,
        projectName: state.projectName,
        contribution: state.projectContribution,
        noProject: state.noProject,
        version: state.candidateVersion,
      },
      applyCandidate: (value) => dispatch({ type: 'candidate', value }),
      acceptCandidate: (value) => dispatch({ type: 'accepted', value }),
      reset: () => {
        resetMockApi()
        dispatch({ type: 'reset' })
      },
    }),
    [state, setters],
  )
  return <Context.Provider value={value}>{children}</Context.Provider>
}
export function useFlow() {
  const value = useContext(Context)
  if (!value) throw new Error('useFlow must be used within FlowProvider')
  return value
}
