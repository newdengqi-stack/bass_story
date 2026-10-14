'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  EVIDENCE_STATUS_LABEL,
  GAP_BUCKET_HINT,
  GAP_BUCKET_LABEL,
  LEVEL_LABEL,
  type GapBucket,
  type GapItem,
  type SprintTask,
} from '@zhitu/types'
import { EvidenceStatusTag } from '@/components/shared/evidence-status'
import { TaskCard } from '@/components/shared/task-card'

/** 展示顺序：能强调的在前，硬性条件单独压到最后 */
const BUCKET_ORDER: GapBucket[] = ['ready', 'needs-evidence', 'missing', 'hard']

const BUCKET_DOT: Record<GapBucket, string> = {
  ready: 'bg-[var(--ws-ok)]',
  'needs-evidence': 'bg-[var(--ws-warn)]',
  missing: 'bg-[var(--ws-miss)]',
  hard: 'bg-[var(--ws-muted)]',
}

/** 排序依据 —— 三项因子合成一个可解释的顺序，而不是一个黑盒分数 */
function rankReason(item: GapItem): string {
  const urgency = item.urgency === 'high' ? '时间紧迫度高' : item.urgency === 'mid' ? '时间紧迫度中等' : '时间紧迫度低'
  const relevance =
    item.relevance === 'high' ? '岗位相关性高' : item.relevance === 'mid' ? '岗位相关性中等' : '岗位相关性低'
  const status = `证据状态为「${EVIDENCE_STATUS_LABEL[item.status]}」`
  return `${urgency}、${relevance}，${status} —— 综合这三项排在当前位置。`
}

export function GapBoard({
  initialItems,
  tasks,
  allInsufficient,
}: {
  initialItems: GapItem[]
  tasks: SprintTask[]
  allInsufficient: boolean
}) {
  const [items, setItems] = useState(initialItems)
  const [taskState, setTaskState] = useState<Record<string, SprintTask['state']>>(
    Object.fromEntries(tasks.map((t) => [t.id, t.state])),
  )
  const [changeNotice, setChangeNotice] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState(initialItems[0]?.id ?? '')

  const active = items.find((i) => i.id === selectedId) ?? items[0]
  const activeTasks = active ? tasks.filter((t) => t.skill === active.skill) : []

  const onTaskState = (task: SprintTask, next: SprintTask['state']) => {
    setTaskState((prev) => ({ ...prev, [task.id]: next }))
    if (next !== 'done') {
      setChangeNotice(`已跳过「${task.title}」，其他任务不受影响。`)
      return
    }
    // 完成任务 = 按任务的完成定义补上了材料，能力状态就地推进一格
    let notice = `已完成「${task.title}」。`
    setItems((prev) =>
      prev.map((item) => {
        if (item.skill !== task.skill) return item
        const before = EVIDENCE_STATUS_LABEL[item.status]
        const afterStatus = item.status === 'missing' ? 'insufficient' : 'claimed'
        const after = EVIDENCE_STATUS_LABEL[afterStatus]
        notice = `${item.skill} 的证据状态：${before} → ${after}。任务已完成，仍需一次追问确认。`
        return { ...item, status: afterStatus, bucket: item.bucket === 'missing' ? 'needs-evidence' : item.bucket }
      }),
    )
    setChangeNotice(notice)
  }

  if (allInsufficient) {
    return (
      <>
        <div
          role="note"
          className="ws-ghost-box mt-10 flex items-start gap-3 px-5 py-4 text-[14px] leading-relaxed text-[var(--ws-ink-2)]"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-[var(--ws-warn)]" aria-hidden="true" />
          <span>
            <span className="font-medium text-[var(--ws-ink)]">目前所有相关能力都没有足够证据。</span>
            这种情况下算出来的「差距」只是把岗位要求复述一遍，没有意义 ——
            所以这里不给结论性判断。先去做项目深挖，拿到带来源的结论再回来看。
          </span>
        </div>
        <Link
          href="/projects"
          className="group mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-[var(--ws-sand)] transition-opacity hover:opacity-70"
        >
          去补齐项目验证
          <ArrowUpRight
            className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </Link>
      </>
    )
  }

  if (!active) return null

  return (
    <div className="mt-10 grid items-start gap-10 lg:grid-cols-[260px_1fr_300px] lg:gap-8">
      {/* ============ 左：按类别分组的能力目录 ============ */}
      <nav
        aria-label="能力目录"
        className="ws-scroll lg:sticky lg:top-24 lg:max-h-[calc(100svh-7rem)] lg:overflow-y-auto lg:border-r lg:border-[var(--ws-line)] lg:pr-6"
      >
        {BUCKET_ORDER.map((bucket) => {
          const bucketItems = items.filter((i) => i.bucket === bucket)
          if (bucketItems.length === 0) return null
          return (
            <div key={bucket} className="mb-6 last:mb-0">
              <h2 className="text-[12px] font-medium uppercase tracking-wider text-[var(--ws-muted)]">
                {GAP_BUCKET_LABEL[bucket]}
                <span className="ml-2 font-mono text-[11px] tabular-nums">{bucketItems.length}</span>
              </h2>
              <ul className="mt-2.5 flex flex-col gap-1">
                {bucketItems.map((item) => {
                  const isActive = item.id === selectedId
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        aria-current={isActive ? 'true' : undefined}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-sand)]',
                          isActive
                            ? 'bg-[var(--ws-ghost)] text-[var(--ws-ink)]'
                            : 'text-[var(--ws-ink-2)] hover:bg-[var(--ws-ghost)]/60 hover:text-[var(--ws-ink)]',
                        )}
                      >
                        <span className={cn('size-1.5 shrink-0 rounded-full', BUCKET_DOT[bucket])} aria-hidden="true" />
                        <span className="text-[14px] font-medium">{item.skill}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      {/* ============ 中：选中能力的详情 ============ */}
      <section
        aria-labelledby="gap-detail-title"
        className="ws-scroll min-w-0 lg:sticky lg:top-24 lg:max-h-[calc(100svh-7rem)] lg:overflow-y-auto lg:pr-2"
      >
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <h2 id="gap-detail-title" className="text-[20px] font-semibold tracking-tight text-[var(--ws-ink)]">
            {active.skill}
          </h2>
          <EvidenceStatusTag status={active.status} />
        </div>

        <p
          className={cn(
            'mt-2 max-w-2xl text-[13px] leading-relaxed',
            active.bucket === 'hard' ? 'text-[var(--ws-warn)]' : 'text-[var(--ws-muted)]',
          )}
        >
          {GAP_BUCKET_HINT[active.bucket]}
        </p>

        {active.bucket === 'hard' && (
          <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-[var(--ws-muted)]">
            这一区不参与冲刺任务生成 —— 学历、专业、毕业年份无法通过项目补强，
            能做的是核对信息是否写对，或者调整目标岗位。
          </p>
        )}

        <div className="mt-6">
          <h3 className="text-[13px] font-medium text-[var(--ws-ink-2)]">说明</h3>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[var(--ws-ink-2)]">{active.note}</p>
        </div>

        <div className="mt-6">
          <h3 className="text-[13px] font-medium text-[var(--ws-ink-2)]">排序依据</h3>
          <dl className="mt-3 flex flex-wrap gap-x-7 gap-y-2">
            <Factor label="岗位相关性" value={LEVEL_LABEL[active.relevance]} />
            <Factor label="准备成本" value={LEVEL_LABEL[active.cost]} />
            <Factor label="时间紧迫度" value={LEVEL_LABEL[active.urgency]} />
            <Factor label="证据状态" value={EVIDENCE_STATUS_LABEL[active.status]} />
          </dl>
          <p className="mt-3 max-w-2xl border-l-2 border-[var(--ws-line-2)] pl-3 text-[13px] leading-relaxed text-[var(--ws-ink-2)]">
            {rankReason(active)}
          </p>
        </div>
      </section>

      {/* ============ 右：对应的冲刺任务 ============ */}
      <aside
        aria-labelledby="sprint-title"
        className="ws-scroll lg:sticky lg:top-24 lg:max-h-[calc(100svh-7rem)] lg:overflow-y-auto lg:border-l lg:border-[var(--ws-line)] lg:pl-6"
      >
        <h2 id="sprint-title" className="text-[12px] font-medium uppercase tracking-wider text-[var(--ws-muted)]">
          对应的冲刺任务
        </h2>

        {changeNotice && (
          <p role="status" className="mt-3 text-[13px] leading-relaxed text-[var(--ws-sand)]">
            {changeNotice}
          </p>
        )}

        {activeTasks.length === 0 ? (
          <p className="mt-4 text-[13px] leading-relaxed text-[var(--ws-muted)]">
            {active.bucket === 'ready'
              ? '已具备证据，暂时不需要额外任务。'
              : '这一项暂时没有拆解出具体的冲刺任务。'}
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {activeTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={{ ...task, state: taskState[task.id] ?? task.state }}
                onChangeState={(next) => onTaskState(task, next)}
              />
            ))}
          </div>
        )}

        <p className="mt-6 text-[12px] leading-relaxed text-[var(--ws-muted)]">
          完成后对应能力的状态会就地更新；跳过的任务不会影响其他任务。每项都在 90 分钟以内。
        </p>
      </aside>
    </div>
  )
}

function Factor({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="text-[12px] text-[var(--ws-muted)]">{label}</dt>
      <dd className="text-[13px] text-[var(--ws-ink)]">{value}</dd>
    </div>
  )
}
