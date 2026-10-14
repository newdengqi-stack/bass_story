export interface JourneyStep {
  key: string
  href: string
  label: string
}

export const JOURNEY_STEPS: JourneyStep[] = [
  { key: 'upload', href: '/upload', label: '上传简历' },
  { key: 'confirm', href: '/confirm', label: '信息确认' },
  { key: 'review', href: '/review', label: '简历初评' },
  { key: 'role', href: '/role', label: '岗位与 JD' },
  { key: 'assessment', href: '/assessment', label: '技术问答' },
  { key: 'submission', href: '/submission', label: '人工复核' },
  { key: 'report', href: '/report', label: '报告' },
]

export function stepIndex(key: string) {
  return JOURNEY_STEPS.findIndex((s) => s.key === key)
}
