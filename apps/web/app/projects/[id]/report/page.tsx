import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Info } from 'lucide-react'
import { AppShell } from '@/components/app/app-shell'
import { EmptyState } from '@/components/shared/empty-state'
import { EvidenceStatusTag } from '@/components/shared/evidence-status'
import { SourcePopover } from '@/components/shared/source-popover'
import { PixelRule, TickStrip } from '@/components/ui/pixel'
import {
  CLAIM_KIND_LABEL,
  EVIDENCE_STATUS_ORDER,
  MIN_EVIDENCE_COUNT,
  statusCounts,
  type ClaimKind,
} from '@zhitu/types'
import { findProject, TARGET } from '@/lib/mock-data'
import { cardsOfProject } from '@/lib/session-seed'
import { KineticTitle } from '@/components/ui/kinetic-title'

export const metadata: Metadata = { title: '项目证据报告 · 证途' }

/** 三类内容的视觉权重：事实最重，建议最轻 */
const KIND_STYLE: Record<ClaimKind, string> = {
  fact: 'border-[var(--ws-ok)] text-[var(--ws-ok)]',
  claim: 'border-[var(--ws-info)] text-[var(--ws-info)]',
  advice: 'border-[var(--ws-ghost-line)] text-[var(--ws-muted)]',
}

/** Next 16：params 是 Promise，必须 await */
export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = findProject(id)
  if (!project) notFound()

  const cards = cardsOfProject(project.id)
  const counts = statusCounts(cards)
  const short = cards.length < MIN_EVIDENCE_COUNT
  const toStrengthen = cards.filter((c) => c.status === 'insufficient' || c.status === 'missing')

  return (
    <AppShell current="项目深挖">
      <main className="mx-auto max-w-4xl px-4 pb-28 pt-16 md:px-8 md:pt-24">
        <Link
          href={`/projects/${project.id}/start`}
          className="inline-flex items-center gap-1.5 text-[13px] text-[var(--ws-muted)] transition-colors hover:text-[var(--ws-ink)]"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          {project.name} · 深挖
        </Link>

        <KineticTitle text="项目证据报告" index="03 · iii" eyebrow="Evidence Report" className="mt-6" />

        {/* ============ 摘要 ============ */}
        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
          <div>
            <dt className="text-[13px] text-[var(--ws-muted)]">项目</dt>
            <dd className="mt-1 text-[16px] text-[var(--ws-ink)]">{project.name}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-[var(--ws-muted)]">目标岗位</dt>
            <dd className="mt-1 text-[16px] text-[var(--ws-ink)]">{TARGET.title}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-[var(--ws-muted)]">证据条数</dt>
            <dd className="mt-1 text-[16px] tabular-nums text-[var(--ws-ink)]">{cards.length}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-[var(--ws-muted)]">生成时间</dt>
            <dd className="mt-1 text-[16px] tabular-nums text-[var(--ws-ink)]">2025-10-03 10:12</dd>
          </div>
        </dl>

        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
          {EVIDENCE_STATUS_ORDER.map((s) => (
            <span key={s} className="flex items-center gap-2">
              <EvidenceStatusTag status={s} />
              <span className="font-mono text-[14px] tabular-nums text-[var(--ws-ink)]">{counts[s]}</span>
            </span>
          ))}
        </div>

        {/* ============ 证据不足分支 ============ */}
        {short && (
          <div
            role="note"
            className="ws-ghost-box mt-9 flex items-start gap-3 px-5 py-4 text-[14px] leading-relaxed text-[var(--ws-ink-2)]"
          >
            <Info className="mt-0.5 size-4 shrink-0 text-[var(--ws-warn)]" aria-hidden="true" />
            <span>
              <span className="font-medium text-[var(--ws-ink)]">
                目前只有 {cards.length} 条结论，不足 {MIN_EVIDENCE_COUNT} 条。
              </span>
              你可以回去继续追问把维度问完，也可以带着「证据不足」的标注继续往下走 ——
              差距分析会照着现在的样子算，不会替你补齐。
            </span>
          </div>
        )}

        {short && (
          <div className="mt-5 flex flex-wrap items-center gap-5">
            <Link
              href={`/projects/${project.id}/session`}
              className="group inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--ws-sand)] transition-opacity hover:opacity-70"
            >
              继续追问
              <ArrowUpRight
                className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/gap"
              className="text-[14px] text-[var(--ws-muted)] transition-colors hover:text-[var(--ws-ink)]"
            >
              带着标注进入差距分析
            </Link>
          </div>
        )}

        <PixelRule className="mt-12" />

        {/* ============ 证据卡 ============ */}
        <section aria-labelledby="cards-title" className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="cards-title" className="text-[22px] font-semibold tracking-tight text-[var(--ws-ink)]">
              证据卡
            </h2>
            <span className="text-[13px] text-[var(--ws-muted)]">
              每条都标了内容性质与来源，来源可展开
            </span>
          </div>

          {/* 三类内容的含义必须先说清楚，标注才有意义 */}
          <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
            {(['fact', 'claim', 'advice'] as ClaimKind[]).map((kind) => (
              <div key={kind} className="flex items-baseline gap-2">
                <dt className={`rounded-full border px-2.5 py-0.5 text-[11px] ${KIND_STYLE[kind]}`}>
                  {CLAIM_KIND_LABEL[kind]}
                </dt>
                <dd className="text-[12px] text-[var(--ws-muted)]">
                  {kind === 'fact'
                    ? '有材料或追问直接支撑，可直接写入简历'
                    : kind === 'claim'
                      ? '你本人陈述，尚未核验，不能当作已具备'
                      : '系统的下一步建议，不是事实，也不是你的陈述'}
                </dd>
              </div>
            ))}
          </dl>

          {cards.length === 0 ? (
            <EmptyState
              className="mt-6"
              what="这个项目还没有任何结论"
              why="没有结论就没有报告 —— 报告里的每一条都必须来自一次具体的追问或一份已提交的材料。"
              action={{ label: '开始追问', href: `/projects/${project.id}/start` }}
            />
          ) : (
            <ul className="mt-7 divide-y divide-[var(--ws-line)]">
              {cards.map((card) => (
                <li key={card.id} className="py-6 first:pt-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="text-[17px] font-medium text-[var(--ws-ink)]">{card.skill}</span>
                    <EvidenceStatusTag status={card.status} />
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] ${KIND_STYLE[card.kind]}`}
                    >
                      {CLAIM_KIND_LABEL[card.kind]}
                    </span>
                    <span className="text-[12px] text-[var(--ws-muted)]">{card.dimension}</span>
                  </div>

                  <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--ws-ink-2)]">
                    {card.conclusion}
                  </p>

                  <div className="mt-4">
                    <SourcePopover source={card.source} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ============ 待补强 ============ */}
        {toStrengthen.length > 0 && (
          <>
            <PixelRule className="mt-14" />
            <section aria-labelledby="todo-title" className="mt-14">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="todo-title" className="text-[22px] font-semibold tracking-tight text-[var(--ws-ink)]">
                  待补强
                </h2>
                <span className="text-[13px] text-[var(--ws-muted)]">{toStrengthen.length} 项</span>
              </div>

              <ul className="mt-7 flex flex-col gap-5">
                {toStrengthen.map((card) => (
                  <li key={card.id}>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span className="text-[15px] text-[var(--ws-ink)]">{card.skill}</span>
                      <EvidenceStatusTag status={card.status} />
                      {/* 待补强是系统的下一步建议，按「建议」标注 —— 它不是事实 */}
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] ${KIND_STYLE.advice}`}>
                        {CLAIM_KIND_LABEL.advice}
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-[var(--ws-muted)]">
                      {card.status === 'missing'
                        ? '建议：这项在追问中被声明为未参与或当前不具备，不能靠简历表述弥补 —— 先判断是否值得投入，再决定补还是绕开。'
                        : '建议：已有相关描述，但还不足以支撑结论。补齐细节或补交材料后重新追问一次。'}
                    </p>
                  </li>
                ))}
              </ul>

              <Link
                href="/gap"
                className="group mt-8 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--ws-sand)] transition-opacity hover:opacity-70"
              >
                去差距分析看先补哪一项
                <ArrowUpRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>
            </section>
          </>
        )}

        <div className="mt-20 flex items-end gap-6">
          <TickStrip count={56} seed={13} className="flex-1 overflow-hidden" />
          <span className="shrink-0 font-mono text-[11px] tracking-wider text-[var(--ws-muted)]">
            ZHITU / REPORT
          </span>
        </div>
      </main>
    </AppShell>
  )
}
