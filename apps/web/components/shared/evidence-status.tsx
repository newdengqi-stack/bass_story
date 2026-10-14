import {
  CircleCheck,
  CircleDashed,
  CircleHelp,
  MessageSquareQuote,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EVIDENCE_STATUS_COLOR, EVIDENCE_STATUS_LABEL, type EvidenceStatus } from '@zhitu/types'

const ICONS: Record<EvidenceStatus, LucideIcon> = {
  verified: CircleCheck,
  claimed: MessageSquareQuote,
  insufficient: CircleHelp,
  missing: CircleDashed,
}

const MEANING: Record<EvidenceStatus, string> = {
  verified: '有材料或连续追问撑住，你能从头讲到尾',
  claimed: '你填写过，但还没有可核验的材料',
  insufficient: '有相关材料，但不足以完整支撑结论',
  missing: '岗位明确要求，你目前没有相关经历',
}

/**
 * 证据状态标签。
 * 颜色只是辅助 —— 状态名始终以文字出现，色盲或黑白打印下同样可读。
 */
export function EvidenceStatusTag({
  status,
  showMeaning = false,
  className,
}: {
  status: EvidenceStatus
  showMeaning?: boolean
  className?: string
}) {
  const Icon = ICONS[status]
  const color = EVIDENCE_STATUS_COLOR[status]

  return (
    <span className={cn('inline-flex items-baseline gap-1.5', className)}>
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap" style={{ color }}>
        <Icon className="size-3.5 shrink-0 translate-y-[1px]" aria-hidden="true" />
        <span className="text-[13px] font-medium">{EVIDENCE_STATUS_LABEL[status]}</span>
      </span>
      {showMeaning && <span className="text-[12px] text-[var(--ws-muted)]">· {MEANING[status]}</span>}
    </span>
  )
}

/** 状态名 + 计数，用于分组表头 */
export function EvidenceStatusCount({ status, count }: { status: EvidenceStatus; count: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: EVIDENCE_STATUS_COLOR[status] }}
        aria-hidden="true"
      />
      <span className="text-[14px] text-[var(--ws-ink-2)]">{EVIDENCE_STATUS_LABEL[status]}</span>
      <span className="font-mono text-[14px] tabular-nums text-[var(--ws-ink)]">{count}</span>
    </span>
  )
}

/** 四种状态的含义说明 —— 供报告页与工作台引用同一份文案 */
export function EvidenceStatusLegend({ className }: { className?: string }) {
  const statuses: EvidenceStatus[] = ['verified', 'claimed', 'insufficient', 'missing']
  return (
    <ul className={cn('flex flex-col gap-2', className)}>
      {statuses.map((s) => (
        <li key={s} className="flex items-baseline gap-2 text-[13px]">
          <EvidenceStatusTag status={s} />
          <span className="text-[var(--ws-muted)]">{MEANING[s]}</span>
        </li>
      ))}
    </ul>
  )
}

export { MEANING as EVIDENCE_STATUS_MEANING }
