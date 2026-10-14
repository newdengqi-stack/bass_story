'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Check, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  effectiveText,
  SUGGESTION_STATE_LABEL,
  SUGGESTION_TYPE_LABEL,
  type ResumeSuggestion,
  type ResumeVersion,
} from '@zhitu/types'
import { ReviewBar } from '@/components/shared/review-bar'
import { EmptyState } from '@/components/shared/empty-state'
import { RESUME_BASE_LINES, RESUME_VERSIONS, TARGET } from '@/lib/mock-data'

const inputCls =
  'w-full rounded-xl border border-[var(--ws-ghost-line)] bg-[var(--ws-field)] px-4 py-3 text-[15px] text-[var(--ws-ink)] outline-none transition-colors focus:border-[var(--ws-sand)]'

export function TailorBoard({ initialSuggestions }: { initialSuggestions: ResumeSuggestion[] }) {
  const [items, setItems] = useState(initialSuggestions)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [versions, setVersions] = useState<ResumeVersion[]>(RESUME_VERSIONS)
  const [askConflict, setAskConflict] = useState(false)
  const [saved, setSaved] = useState<ResumeVersion | null>(null)

  const patch = (id: string, next: Partial<ResumeSuggestion>) => {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...next } : s)))
  }

  const accept = (s: ResumeSuggestion) => patch(s.id, { state: 'accepted', editedText: null })
  const reject = (s: ResumeSuggestion) => patch(s.id, { state: 'rejected' })

  const startEdit = (s: ResumeSuggestion) => {
    setEditingId(s.id)
    setDraft(effectiveText(s))
  }

  const commitEdit = (s: ResumeSuggestion) => {
    const text = draft.trim()
    if (!text) return
    patch(s.id, { state: 'edited', editedText: text })
    setEditingId(null)
    setDraft('')
  }

  const included = items.filter((s) => s.state === 'accepted' || s.state === 'edited')
  const pending = items.filter((s) => s.state === 'pending')
  const existingForTarget = versions.filter((v) => v.targetTitle === TARGET.title)

  const doSave = (mode: 'new' | 'overwrite') => {
    const versionNo =
      mode === 'overwrite' && existingForTarget.length > 0
        ? existingForTarget[existingForTarget.length - 1].version
        : versions.length + 1

    const version: ResumeVersion = {
      id: `v-${versions.length + 1}`,
      version: versionNo,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      targetTitle: TARGET.title,
      entries: included.length,
    }
    setVersions((prev) => [...prev, version])
    setSaved(version)
    setAskConflict(false)
  }

  const onSaveClick = () => {
    // 同岗位已有版本时，必须让用户明确选新建还是覆盖，不替他决定
    if (existingForTarget.length > 0) {
      setAskConflict(true)
      return
    }
    doSave('new')
  }

  if (items.length === 0) {
    return (
      <EmptyState
        className="mt-12"
        what="当前证据不足以提出任何修改建议"
        why="建议只能建立在已验证的事实上。现在还没有能撑住强化表述的证据，硬改会让简历在面试里被问穿。"
        action={{ label: '先去补齐项目验证', href: '/projects' }}
      />
    )
  }

  return (
    <div className="mt-12 grid gap-x-14 gap-y-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      {/* ============ 左：逐条建议 ============ */}
      <section aria-labelledby="sug-title" className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="sug-title" className="text-[22px] font-semibold tracking-tight text-[var(--ws-ink)]">
            修改建议
          </h2>
          <span className="text-[13px] text-[var(--ws-muted)]">
            共 {items.length} 条 · 待处理 {pending.length} 条
          </span>
        </div>

        {/* 规则说明与页面同高可见，不做折叠 */}
        <p
          role="note"
          className="ws-ghost-box mt-6 flex items-start gap-3 px-5 py-4 text-[14px] leading-relaxed text-[var(--ws-ink-2)]"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-[var(--ws-sand)]" aria-hidden="true" />
          <span>
            <span className="font-medium text-[var(--ws-ink)]">只强化有来源的事实。</span>
            没有证据支撑的表述不会出现在建议里；即便出现了，没有来源的那一条也无法被接受。
          </span>
        </p>

        <div className="mt-8">
          {items.map((s) => (
            <ReviewBar
              key={s.id}
              source={s.source}
              status={
                <span
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-[12px]',
                    s.state === 'rejected'
                      ? 'border-[var(--ws-ghost-line)] text-[var(--ws-muted)]'
                      : 'border-[var(--ws-ghost-line)] text-[var(--ws-ink-2)]',
                  )}
                >
                  {SUGGESTION_STATE_LABEL[s.state]}
                </span>
              }
              actions={[
                { key: 'accept', label: '接受', onSelect: () => accept(s), tone: 'primary' },
                { key: 'edit', label: '编辑', onSelect: () => startEdit(s) },
                // 拒绝不写入结果，所以不受证据门禁约束 —— 否则无来源的条目会卡在列表里出不去
                { key: 'reject', label: '拒绝', onSelect: () => reject(s), tone: 'danger', requiresSource: false },
              ]}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="rounded-full border border-[var(--ws-ghost-line)] px-2.5 py-0.5 text-[12px] text-[var(--ws-ink-2)]">
                  {SUGGESTION_TYPE_LABEL[s.type]}
                </span>
                <span className="text-[12px] text-[var(--ws-muted)]">{s.reason}</span>
              </div>

              <p className="mt-3 text-[14px] leading-relaxed text-[var(--ws-muted)] line-through decoration-[var(--ws-line-2)]">
                {s.original}
              </p>

              {editingId === s.id ? (
                <div className="mt-3 flex flex-col gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={3}
                    aria-label="编辑建议内容"
                    className={cn(inputCls, 'resize-y leading-relaxed')}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => commitEdit(s)}
                      className="rounded-full bg-[var(--ws-sand-fill)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--ws-on-sand)]"
                    >
                      保存修改
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-full border border-[var(--ws-ghost-line)] px-3.5 py-1.5 text-[13px] text-[var(--ws-ink-2)]"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--ws-ink)]">
                  {effectiveText(s)}
                  {s.state === 'edited' && (
                    <span className="ml-2 text-[12px] text-[var(--ws-sand)]">已按你的文本</span>
                  )}
                </p>
              )}
            </ReviewBar>
          ))}
        </div>
      </section>

      {/* ============ 右：简历预览 ============ */}
      <section aria-labelledby="preview-title" className="min-w-0">
        <div className="lg:sticky lg:top-20">
          <h2 id="preview-title" className="text-[22px] font-semibold tracking-tight text-[var(--ws-ink)]">
            简历预览
          </h2>
          <p className="mt-2 text-[13px] text-[var(--ws-muted)]">
            绑定岗位 · {TARGET.title} · {TARGET.company}
          </p>

          <div className="ws-ghost-box mt-6 px-6 py-6">
            <ul className="flex flex-col gap-1.5">
              {RESUME_BASE_LINES.map((line) => (
                <li key={line} className="text-[14px] leading-relaxed text-[var(--ws-ink-2)]">
                  {line}
                </li>
              ))}
            </ul>

            <p className="mt-6 border-t border-[var(--ws-line)] pt-5 text-[12px] text-[var(--ws-muted)]">
              岗位强化表述 · 已纳入 {included.length} 条
            </p>

            {included.length === 0 ? (
              <p className="mt-3 text-[13px] leading-relaxed text-[var(--ws-muted)]">
                还没有接受任何建议。接受后，强化后的表述会出现在这里。
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {included.map((s) => (
                  <li key={s.id} className="flex items-start gap-2">
                    <Check className="mt-1 size-3.5 shrink-0 text-[var(--ws-ok)]" aria-hidden="true" />
                    <span className="text-[14px] leading-relaxed text-[var(--ws-ink)]">
                      {effectiveText(s)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ============ 保存 ============ */}
          <div className="mt-8">
            <button
              type="button"
              onClick={onSaveClick}
              disabled={included.length === 0}
              className="rounded-full bg-[var(--ws-sand-fill)] px-5 py-2.5 text-[15px] font-medium text-[var(--ws-on-sand)] transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-ink)] disabled:pointer-events-none disabled:opacity-40"
            >
              保存为岗位专版
            </button>

            {pending.length > 0 && (
              <p className="mt-3 text-[13px] text-[var(--ws-muted)]">
                还有 <span className="tabular-nums text-[var(--ws-ink)]">{pending.length}</span> 条未处理，
                它们不会进入简历。
              </p>
            )}

            {askConflict && (
              <div
                role="alertdialog"
                aria-labelledby="conflict-title"
                className="mt-5 rounded-xl border border-[var(--ws-warn)] bg-[var(--ws-panel)] px-5 py-4 backdrop-blur-md"
              >
                <p id="conflict-title" className="text-[14px] font-medium text-[var(--ws-warn)]">
                  「{TARGET.title}」已经有一份专版简历了
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--ws-ink-2)]">
                  当前最新是 v{existingForTarget[existingForTarget.length - 1]?.version}。
                  请选择新建一个版本，还是覆盖它 —— 不会替你决定。
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => doSave('new')}
                    className="rounded-full bg-[var(--ws-sand-fill)] px-4 py-1.5 text-[13px] font-medium text-[var(--ws-on-sand)]"
                  >
                    新建版本
                  </button>
                  <button
                    type="button"
                    onClick={() => doSave('overwrite')}
                    className="rounded-full border border-[var(--ws-ghost-line)] px-4 py-1.5 text-[13px] text-[var(--ws-ink-2)] transition-colors hover:text-[var(--ws-ink)]"
                  >
                    覆盖 v{existingForTarget[existingForTarget.length - 1]?.version}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAskConflict(false)}
                    className="rounded-full px-3 py-1.5 text-[13px] text-[var(--ws-muted)]"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {saved && (
              <p role="status" className="mt-4 text-[14px] text-[var(--ws-ok)]">
                已保存 v{saved.version} · {saved.createdAt} · 绑定「{saved.targetTitle}」· 纳入 {saved.entries} 条
              </p>
            )}

            {versions.length > 0 && (
              <div className="mt-8">
                <p className="text-[13px] text-[var(--ws-muted)]">全部版本</p>
                <ul className="mt-3 flex flex-col gap-2">
                  {versions.map((v) => (
                    <li key={v.id} className="flex flex-wrap items-baseline justify-between gap-x-3 text-[13px]">
                      <span className="text-[var(--ws-ink)]">
                        v{v.version} · {v.targetTitle}
                      </span>
                      <span className="tabular-nums text-[var(--ws-muted)]">
                        {v.createdAt} · {v.entries} 条
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link
              href="/resume"
              className="group mt-8 inline-flex items-center gap-1.5 text-[14px] text-[var(--ws-muted)] transition-colors hover:text-[var(--ws-ink)]"
            >
              回到我的简历
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
