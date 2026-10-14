'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Info } from 'lucide-react'
import { DIMENSIONS, EVIDENCE_STATUS_ORDER, MIN_EVIDENCE_COUNT, type Project, type Target } from '@zhitu/types'
import {
  buildQuestion,
  canConclude,
  MIN_ANSWER_LENGTH,
  pickSkill,
  replayHistory,
  restoreState,
  roundToCard,
  ROUNDS_PER_DIMENSION,
  type AskAction,
  type SessionRound,
  type SessionState,
} from '@/lib/session-engine'
import { cardsOfProject, roundsOfProject } from '@/lib/session-seed'
import { DigEvidenceRail } from './dig-evidence-rail'
import { EvidenceStatusTag } from '@/components/shared/evidence-status'
import { StepIndicator } from '@/components/shared/step-indicator'

/** 「声明未做过」如实记录 —— 用陈述句，不做任何评价 */
const NEVER_DONE_TEXT = '本人声明这部分没有参与。'

const GENERATING_MS = 700

export function DigSession({ project, target }: { project: Project; target: Target }) {
  // 会话位置与结论都从数据恢复 —— 这就是「中途离开再进来能接着上次」的实现
  const seed = useMemo(() => {
    const { rounds } = replayHistory(project.id, roundsOfProject(project.id))
    return restoreState(rounds, cardsOfProject(project.id))
  }, [project.id])

  const [state, setState] = useState<SessionState>(seed)
  const [answer, setAnswer] = useState('')
  const [askShort, setAskShort] = useState(false)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const dimension = DIMENSIONS[state.dimensionIndex]
  const previousAnswer = useMemo(() => {
    const sameDimension = state.rounds.filter((r) => r.dimensionIndex === state.dimensionIndex)
    return sameDimension[sameDimension.length - 1]?.answer ?? ''
  }, [state.rounds, state.dimensionIndex])

  const { question, basedOnPrevious } = useMemo(
    () => buildQuestion(project, target, state.dimensionIndex, state.roundInDimension, previousAnswer),
    [project, target, state.dimensionIndex, state.roundInDimension, previousAnswer],
  )

  const commit = (action: AskAction, text: string) => {
    if (!dimension) return
    const round = state.rounds.length + 1
    const skill = pickSkill(project, target, dimension, text || question)

    const newRound: SessionRound = {
      round,
      dimensionId: dimension.id,
      dimensionIndex: state.dimensionIndex,
      roundInDimension: state.roundInDimension,
      question,
      basedOnPrevious,
      skill,
      action,
      answer: text,
    }
    const card = roundToCard(project.id, dimension, round, question, action, text, skill)

    setState((prev) => ({
      ...prev,
      rounds: [...prev.rounds, newRound],
      cards: card ? [...prev.cards, card] : prev.cards,
      phase: 'generating',
    }))
    setHighlightId(card ? card.id : null)
    setAnswer('')
    setAskShort(false)

    timerRef.current = window.setTimeout(() => {
      setState((prev) => {
        const stays = action === 'answered' && prev.roundInDimension + 1 < ROUNDS_PER_DIMENSION
        const nextIndex = stays ? prev.dimensionIndex : prev.dimensionIndex + 1
        const ended = nextIndex >= DIMENSIONS.length
        return {
          ...prev,
          dimensionIndex: Math.min(nextIndex, DIMENSIONS.length - 1),
          roundInDimension: stays ? prev.roundInDimension + 1 : 0,
          phase: ended ? 'ended' : 'answering',
        }
      })
    }, GENERATING_MS)
  }

  const onSubmitAnswer = () => {
    const text = answer.trim()
    if (text.length < MIN_ANSWER_LENGTH) {
      setAskShort(true)
      return
    }
    commit('answered', text)
  }

  const reached = canConclude(state)
  const activeIndex = Math.min(state.dimensionIndex, DIMENSIONS.length - 1)

  return (
    <div className="mt-10 grid gap-x-14 gap-y-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      {/* ============ 左：当前问题 ============ */}
      <section aria-labelledby="q-title" className="min-w-0">
        <StepIndicator
          steps={DIMENSIONS.map((d) => d.name)}
          current={activeIndex}
          ariaLabel="验证维度进度"
        />

        {state.phase === 'ended' ? (
          <EndedPanel state={state} projectId={project.id} />
        ) : (
          <>
            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="rounded-full border border-[var(--ws-ghost-line)] px-2.5 py-0.5 text-[12px] text-[var(--ws-ink-2)]">
                {dimension?.name}
              </span>
              <span className="font-mono text-[12px] tabular-nums text-[var(--ws-muted)]">
                第 {state.rounds.length + 1} 轮
              </span>
              {basedOnPrevious && (
                <span className="text-[12px] text-[var(--ws-sand)]">承上一轮回答</span>
              )}
            </div>

            {state.phase === 'generating' ? (
              <div className="ws-ghost-box mt-5 px-6 py-8">
                <p className="text-[16px] text-[var(--ws-ink-2)]">正在基于这一轮回答生成下一问…</p>
                <p className="mt-2 text-[13px] text-[var(--ws-muted)]">
                  下一问会围绕你刚说的内容展开，不会跳到无关的话题。
                </p>
              </div>
            ) : (
              <>
                <h1
                  id="q-title"
                  className="mt-5 text-[1.75rem] font-semibold leading-[1.25] tracking-[-0.015em] text-[var(--ws-ink)] md:text-[2rem]"
                >
                  {question}
                </h1>

                <div className="mt-7">
                  <label htmlFor="answer" className="mb-2 block text-[13px] text-[var(--ws-ink-2)]">
                    你的回答
                  </label>
                  <textarea
                    id="answer"
                    value={answer}
                    onChange={(e) => {
                      setAnswer(e.target.value)
                      if (askShort) setAskShort(false)
                    }}
                    rows={6}
                    placeholder="按你当时实际的做法讲就行 —— 讲得越具体，越容易拿到「已验证」。"
                    className="w-full resize-y rounded-xl border border-[var(--ws-ghost-line)] bg-[var(--ws-field)] px-4 py-3 text-[15px] leading-relaxed text-[var(--ws-ink)] placeholder-[var(--ws-muted)] outline-none transition-colors focus:border-[var(--ws-sand)] focus:bg-[var(--ws-ghost)]"
                  />
                  <p className="mt-2 text-[12px] text-[var(--ws-muted)]">
                    下一问会基于这一轮回答生成 · {answer.length} 字
                  </p>
                </div>

                {/* 回答过短：先提示会被记为证据不足，再由用户决定 */}
                {askShort && (
                  <div
                    role="alertdialog"
                    aria-labelledby="short-title"
                    className="mt-5 rounded-xl border border-[var(--ws-warn)] bg-[var(--ws-panel)] px-5 py-4 backdrop-blur-md"
                  >
                    <p id="short-title" className="flex items-center gap-2 text-[14px] font-medium text-[var(--ws-warn)]">
                      <Info className="size-4 shrink-0" aria-hidden="true" />
                      这段回答会被记为「证据不足」
                    </p>
                    <p className="mt-2 text-[13px] leading-relaxed text-[var(--ws-ink-2)]">
                      内容偏短，不足以支撑一条结论。你可以继续提交（这一条会带「证据不足」标记保留），
                      也可以回去把细节补上再提交。
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => commit('answered', answer.trim())}
                        className="rounded-full bg-[var(--ws-warn)] px-4 py-1.5 text-[13px] font-medium text-[var(--ws-on-sand)]"
                      >
                        继续提交
                      </button>
                      <button
                        type="button"
                        onClick={() => setAskShort(false)}
                        className="rounded-full border border-[var(--ws-ghost-line)] px-4 py-1.5 text-[13px] text-[var(--ws-ink-2)] transition-colors hover:text-[var(--ws-ink)]"
                      >
                        返回修改
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[var(--ws-line)] pt-5">
                  <button
                    type="button"
                    onClick={onSubmitAnswer}
                    disabled={answer.trim().length === 0}
                    className="rounded-full bg-[var(--ws-sand-fill)] px-5 py-2.5 text-[15px] font-medium text-[var(--ws-on-sand)] transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-ink)] disabled:pointer-events-none disabled:opacity-40"
                  >
                    提交回答
                  </button>

                  <button
                    type="button"
                    onClick={() => commit('skipped', '')}
                    className="text-[14px] text-[var(--ws-muted)] transition-colors hover:text-[var(--ws-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-sand)]"
                  >
                    跳过此题
                  </button>

                  <button
                    type="button"
                    onClick={() => commit('never-done', NEVER_DONE_TEXT)}
                    className="text-[14px] text-[var(--ws-muted)] transition-colors hover:text-[var(--ws-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-sand)]"
                  >
                    这部分我没做过
                  </button>

                  {reached && (
                    <button
                      type="button"
                      onClick={() => setState((prev) => ({ ...prev, phase: 'ended' }))}
                      className="ml-auto text-[14px] font-medium text-[var(--ws-sand)] transition-opacity hover:opacity-70"
                    >
                      结束会话，去看报告
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* ============ 右：证据侧栏 ============ */}
      {state.phase === 'ended' ? (
        <EndedRail state={state} projectId={project.id} />
      ) : (
        <DigEvidenceRail
          cards={state.cards}
          highlightId={highlightId}
          className="lg:border-l lg:border-[var(--ws-line)] lg:pl-14"
        />
      )}
    </div>
  )
}

/* ============ 结束态 ============ */

function EndedPanel({ state, projectId }: { state: SessionState; projectId: string }) {
  const reached = canConclude(state)

  return (
    <div className="mt-8">
      <h1 id="q-title" className="text-[2rem] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--ws-ink)]">
        这次深挖结束了
      </h1>
      <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-[var(--ws-ink-2)]">
        {reached
          ? `一共形成 ${state.cards.length} 条带来源的结论，已经够支撑一份项目证据报告。`
          : `一共形成 ${state.cards.length} 条结论，还没到 ${MIN_EVIDENCE_COUNT} 条。你可以回去继续追问，也可以带着标记往下走。`}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href={`/projects/${projectId}/report`}
          className="group inline-flex items-center gap-2 rounded-full bg-[var(--ws-sand-fill)] px-5 py-2.5 text-[15px] font-medium text-[var(--ws-on-sand)] transition-transform hover:scale-[1.02]"
        >
          查看项目证据报告
          <ArrowUpRight
            className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </Link>
        <Link
          href={`/projects/${projectId}/start`}
          className="text-[14px] text-[var(--ws-muted)] transition-colors hover:text-[var(--ws-ink)]"
        >
          重新开始一轮
        </Link>
      </div>
    </div>
  )
}

function EndedRail({ state, projectId }: { state: SessionState; projectId: string }) {
  const grouped = EVIDENCE_STATUS_ORDER.map((status) => ({
    status,
    count: state.cards.filter((c) => c.status === status).length,
  })).filter((g) => g.count > 0)

  return (
    <aside className="min-w-0 lg:border-l lg:border-[var(--ws-line)] lg:pl-14">
      <h2 className="text-[15px] font-medium text-[var(--ws-muted)]">本次结果</h2>

      <ul className="mt-4 flex flex-col gap-3">
        {grouped.map((g) => (
          <li key={g.status} className="flex items-center justify-between gap-3">
            <EvidenceStatusTag status={g.status} />
            <span className="font-mono text-[14px] tabular-nums text-[var(--ws-ink)]">{g.count}</span>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-[13px] leading-relaxed text-[var(--ws-muted)]">
        结论与来源都已保存。报告页可以逐条展开来源，核对每条结论是从哪一轮来的。
      </p>

      <Link
        href={`/projects/${projectId}/report`}
        className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--ws-sand)] transition-opacity hover:opacity-70"
      >
        打开报告
        <ArrowUpRight className="size-3.5" aria-hidden="true" />
      </Link>
    </aside>
  )
}
