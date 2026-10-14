'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Cpu, Info, Workflow } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EVIDENCE_STATUS_COLOR, EVIDENCE_STATUS_LABEL, effectiveText } from '@zhitu/types'
import type { ProjectInsight } from '@/lib/project-insights'
import { EvidenceStatusCount } from '@/components/shared/evidence-status'

/** 简历原文 —— 按项目字段拼成和简历里一样的那种短条目，不虚构任何内容 */
function originalResumeLines(insight: ProjectInsight): string[] {
  const { project } = insight
  return [
    `${project.name} — ${project.role}（${project.period}）`,
    project.goal,
    `涉及技术：${project.tech.join('、')}`,
  ]
}

export function ProjectDeepDive({ insights }: { insights: ProjectInsight[] }) {
  const [selectedId, setSelectedId] = useState(insights[0]?.project.id ?? '')
  const active = insights.find((i) => i.project.id === selectedId) ?? insights[0]

  if (!active) return null

  const { project } = active
  const keepSuggestions = active.suggestions.filter((s) => s.type !== 'trim')
  const trimSuggestions = active.suggestions.filter((s) => s.type === 'trim')
  const rounds = active.roundsCount

  return (
    <div className="mt-14 grid items-start gap-10 lg:grid-cols-[220px_1fr_300px] lg:gap-8">
      {/* ============ 左：项目目录 ============ */}
      <nav
        aria-label="项目目录"
        className="ws-scroll lg:sticky lg:top-24 lg:max-h-[calc(100svh-7rem)] lg:overflow-y-auto lg:border-r lg:border-[var(--ws-line)] lg:pr-6"
      >
        <h2 className="text-[12px] font-medium uppercase tracking-wider text-[var(--ws-muted)]">项目目录</h2>
        <ul className="mt-4 flex flex-col gap-1 lg:gap-1.5">
          {insights.map((i) => {
            const isActive = i.project.id === project.id
            return (
              <li key={i.project.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(i.project.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'w-full rounded-lg px-3 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-sand)]',
                    isActive
                      ? 'bg-[var(--ws-ghost)] text-[var(--ws-ink)]'
                      : 'text-[var(--ws-ink-2)] hover:bg-[var(--ws-ghost)]/60 hover:text-[var(--ws-ink)]',
                  )}
                >
                  <span className="block text-[14px] font-medium">{i.project.name}</span>
                  <span className="mt-0.5 block text-[12px] text-[var(--ws-muted)]">
                    {i.project.role} · {i.project.period}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* ============ 中：简历原文 / 推荐排版 ============ */}
      <section
        aria-labelledby="resume-compare-title"
        className="ws-scroll min-w-0 lg:sticky lg:top-24 lg:max-h-[calc(100svh-7rem)] lg:overflow-y-auto lg:pr-2"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="resume-compare-title" className="text-[20px] font-semibold tracking-tight text-[var(--ws-ink)]">
            {project.name}
          </h2>
          <span className="text-[12px] text-[var(--ws-muted)]">
            {rounds > 0 ? `已进行 ${rounds} 轮追问` : '尚未开始追问'}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
          {(['verified', 'claimed', 'insufficient', 'missing'] as const).map((s) => (
            <EvidenceStatusCount key={s} status={s} count={active.counts[s]} />
          ))}
        </div>

        {/* 简历原文 */}
        <div className="mt-8">
          <h3 className="text-[13px] font-medium text-[var(--ws-ink-2)]">简历原文</h3>
          <div className="ws-ghost-box mt-3 flex flex-col gap-2 px-5 py-4">
            {originalResumeLines(active).map((line, idx) => (
              <p
                key={idx}
                className={cn(
                  'text-[14px] leading-relaxed text-[var(--ws-ink-2)]',
                  idx === 0 && 'font-medium text-[var(--ws-ink)]',
                )}
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* 推荐排版 */}
        <div className="mt-6">
          <h3 className="text-[13px] font-medium text-[var(--ws-ink-2)]">我推荐的排版</h3>

          {keepSuggestions.length === 0 ? (
            <p className="mt-3 flex items-start gap-3 rounded-xl border border-[var(--ws-ghost-line)] px-5 py-4 text-[13px] leading-relaxed text-[var(--ws-ink-2)]">
              <Info className="mt-0.5 size-4 shrink-0 text-[var(--ws-sand)]" aria-hidden="true" />
              <span>
                这个项目还没有生成可用的简历建议。先完成深挖追问，形成带来源的结论之后，系统才会给出可核验的表述。
              </span>
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-4 rounded-xl border border-[var(--ws-sand)]/40 bg-[var(--ws-ghost)] px-5 py-4">
              {keepSuggestions.map((s) => (
                <li key={s.id} className="border-t border-[var(--ws-line)] pt-4 first:border-t-0 first:pt-0">
                  <p className="text-[14px] leading-relaxed text-[var(--ws-ink)]">{effectiveText(s)}</p>
                  <p className="mt-1.5 text-[12px] text-[var(--ws-muted)]">{s.reason}</p>
                </li>
              ))}
            </ul>
          )}

          {trimSuggestions.length > 0 && (
            <div className="mt-4">
              <p className="text-[12px] text-[var(--ws-muted)]">建议从简历中删除</p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {trimSuggestions.map((s) => (
                  <li key={s.id} className="text-[13px] leading-relaxed">
                    <span className="text-[var(--ws-muted)] line-through">{s.original}</span>
                    <span className="ml-2 text-[12px] text-[var(--ws-muted)]">· {s.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--ws-line)] pt-5">
          <Link
            href={`/projects/${project.id}/start`}
            className="group inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--ws-sand)] transition-opacity hover:opacity-70"
          >
            {rounds > 0 ? '继续深挖' : '开始深挖'}
            <ArrowUpRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>

          {rounds > 0 && (
            <Link
              href={`/projects/${project.id}/report`}
              className="text-[14px] text-[var(--ws-ink-2)] transition-colors hover:text-[var(--ws-ink)]"
            >
              查看证据报告
            </Link>
          )}

          <Link
            href={`/projects/${project.id}`}
            className="text-[14px] text-[var(--ws-ink-2)] transition-colors hover:text-[var(--ws-ink)]"
          >
            项目档案
          </Link>
        </div>
      </section>

      {/* ============ 右：逻辑链条 / 技术栈 / 分析 ============ */}
      <aside
        aria-labelledby="insight-title"
        className="ws-scroll lg:sticky lg:top-24 lg:max-h-[calc(100svh-7rem)] lg:overflow-y-auto lg:border-l lg:border-[var(--ws-line)] lg:pl-6"
      >
        <h2 id="insight-title" className="text-[12px] font-medium uppercase tracking-wider text-[var(--ws-muted)]">
          项目洞察
        </h2>

        {/* 技术栈 */}
        <div className="mt-5">
          <h3 className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--ws-ink-2)]">
            <Cpu className="size-3.5 text-[var(--ws-sand)]" aria-hidden="true" />
            技术栈
          </h3>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[var(--ws-ghost-line)] px-2.5 py-0.5 text-[12px] text-[var(--ws-ink-2)]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* 逻辑链条 */}
        <div className="mt-7">
          <h3 className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--ws-ink-2)]">
            <Workflow className="size-3.5 text-[var(--ws-sand)]" aria-hidden="true" />
            逻辑链条
          </h3>

          {active.architectureSteps ? (
            <ol className="mt-3 flex flex-col">
              {active.architectureSteps.map((step, idx) => (
                <li key={idx} className="relative pb-4 pl-5 last:pb-0">
                  {idx < active.architectureSteps!.length - 1 && (
                    <span
                      className="absolute left-[4px] top-3 h-full w-px bg-[var(--ws-line)]"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className="absolute left-0 top-1.5 size-[9px] rounded-full border-2 border-[var(--ws-sand)] bg-[var(--ws-bg)]"
                    aria-hidden="true"
                  />
                  <p className="text-[13px] leading-relaxed text-[var(--ws-ink-2)]">{step}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-[13px] leading-relaxed text-[var(--ws-muted)]">
              尚未追问到架构与数据流环节，暂时无法还原逻辑链条。
            </p>
          )}

          {active.techChoice && (
            <div className="mt-5">
              <p className="text-[12px] font-medium text-[var(--ws-ink-2)]">关键选型</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--ws-muted)]">{active.techChoice}</p>
            </div>
          )}

          {active.coreChallenge && (
            <div className="mt-5">
              <p className="text-[12px] font-medium text-[var(--ws-ink-2)]">核心难点</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--ws-muted)]">{active.coreChallenge}</p>
            </div>
          )}
        </div>

        {/* 分析 */}
        <div className="mt-7">
          <h3 className="text-[13px] font-medium text-[var(--ws-ink-2)]">待补证据</h3>
          {active.gaps.length === 0 ? (
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--ws-muted)]">追问结论里暂无明显缺口。</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2.5">
              {active.gaps.map((g, idx) => (
                <li key={idx} className="text-[13px] leading-relaxed">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: EVIDENCE_STATUS_COLOR[g.status] }}
                      aria-hidden="true"
                    />
                    <span className="font-medium text-[var(--ws-ink)]">{g.skill}</span>
                    <span className="text-[12px] text-[var(--ws-muted)]">· {EVIDENCE_STATUS_LABEL[g.status]}</span>
                  </span>
                  <p className="mt-1 text-[var(--ws-muted)]">{g.conclusion}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )
}
