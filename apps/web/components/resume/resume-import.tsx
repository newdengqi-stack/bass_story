'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Check, Info, Pencil, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PARSED_DRAFT, PARSED_GROUP_LABEL, SAMPLE_RESUME, type ParsedItem } from '@/lib/mock-data'

type Group = ParsedItem['group']
const GROUPS: Group[] = ['skill', 'project', 'education', 'other']

const inputCls =
  'w-full rounded-xl border border-[var(--ws-ghost-line)] bg-[var(--ws-field)] px-4 py-3 text-[15px] text-[var(--ws-ink)] placeholder-[var(--ws-muted)] outline-none transition-colors focus:border-[var(--ws-sand)] focus:bg-[var(--ws-ghost)]'

type Phase = 'empty' | 'parsed'

export function ResumeImport() {
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<Phase>('empty')
  const [items, setItems] = useState<ParsedItem[]>([])
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [askReplace, setAskReplace] = useState(false)
  const [error, setError] = useState('')

  const runParse = () => {
    setItems(PARSED_DRAFT.map((i) => ({ ...i })))
    setConfirmed(new Set())
    setPhase('parsed')
    setAskReplace(false)
    setError('')
  }

  const onParseClick = () => {
    if (text.trim().length < 20) {
      setError('粘贴的内容太短，至少需要 20 个字符。')
      return
    }
    setError('')
    // 已有解析结果时，先问清楚再覆盖 —— 不静默丢弃用户已经确认过的条目
    if (phase === 'parsed' && items.length > 0) {
      setAskReplace(true)
      return
    }
    runParse()
  }

  const toggleConfirm = (id: string) => {
    setConfirmed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    setConfirmed((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const startEdit = (item: ParsedItem) => {
    setEditingId(item.id)
    setDraft(item.text)
  }

  const commitEdit = () => {
    if (!editingId) return
    const value = draft.trim()
    if (!value) return
    setItems((prev) => prev.map((i) => (i.id === editingId ? { ...i, text: value } : i)))
    setEditingId(null)
    setDraft('')
  }

  const remaining = items.length - confirmed.size

  return (
    <div className="mt-12">
      {/* 这条说明必须在显著位置，且不能被折叠 */}
      <p
        role="note"
        className="ws-ghost-box flex items-start gap-3 px-5 py-4 text-[14px] leading-relaxed text-[var(--ws-ink-2)]"
      >
        <Info className="mt-0.5 size-4 shrink-0 text-[var(--ws-sand)]" aria-hidden="true" />
        <span>
          <span className="font-medium text-[var(--ws-ink)]">解析只是提取，不是验证。</span>
          这里做的是把你写过的内容拆成条目，方便后面逐条核对。任何一条进来时都是「用户声明」，
          只有经过项目追问或提交材料之后，才可能变成「已验证」。
        </span>
      </p>

      {/* ============ 粘贴区 ============ */}
      <section aria-labelledby="paste-title" className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="paste-title" className="text-[20px] font-semibold tracking-tight text-[var(--ws-ink)]">
            粘贴简历文本
          </h2>
          <button
            type="button"
            onClick={() => setText(SAMPLE_RESUME)}
            className="rounded-full border border-[var(--ws-ghost-line)] px-3 py-1 text-[12px] text-[var(--ws-muted)] transition-colors hover:border-[var(--ws-ghost-line-strong)] hover:text-[var(--ws-ink)]"
          >
            填入示例简历
          </button>
        </div>

        <label htmlFor="resume-text" className="mt-4 block text-[13px] text-[var(--ws-muted)]">
          目前只支持粘贴文本（不支持上传 PDF / Word）
        </label>
        <textarea
          id="resume-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="把简历正文整段粘贴进来 —— 教育经历、项目经历、技能都放进去，拆得越全，后面要补填的越少。"
          className={cn(inputCls, 'mt-2 resize-y font-mono text-[13px] leading-relaxed')}
        />

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onParseClick}
            className="rounded-full bg-[var(--ws-sand-fill)] px-5 py-2.5 text-[15px] font-medium text-[var(--ws-on-sand)] transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-ink)]"
          >
            {phase === 'parsed' ? '重新解析' : '解析这份简历'}
          </button>
          <span className="text-[13px] text-[var(--ws-muted)]">{text.length} 字</span>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-[13px] text-[var(--ws-miss)]">
            {error}
          </p>
        )}

        {askReplace && (
          <div
            role="alertdialog"
            aria-labelledby="replace-title"
            className="mt-5 rounded-xl border border-[var(--ws-warn)] bg-[var(--ws-panel)] px-5 py-4 backdrop-blur-md"
          >
            <p id="replace-title" className="flex items-center gap-2 text-[14px] font-medium text-[var(--ws-warn)]">
              <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
              已经有解析结果了，重新解析会覆盖它
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--ws-ink-2)]">
              当前 {items.length} 条，其中 {confirmed.size} 条已确认。覆盖后已确认的状态不会保留。
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={runParse}
                className="rounded-full bg-[var(--ws-warn)] px-4 py-1.5 text-[13px] font-medium text-[var(--ws-on-sand)]"
              >
                覆盖并重新解析
              </button>
              <button
                type="button"
                onClick={() => setAskReplace(false)}
                className="rounded-full border border-[var(--ws-ghost-line)] px-4 py-1.5 text-[13px] text-[var(--ws-ink-2)] transition-colors hover:text-[var(--ws-ink)]"
              >
                保留原来的
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ============ 解析结果 ============ */}
      {phase === 'parsed' && (
        <section aria-labelledby="result-title" className="mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="result-title" className="text-[20px] font-semibold tracking-tight text-[var(--ws-ink)]">
              逐条核对
            </h2>
            <span className="text-[13px] text-[var(--ws-muted)]">
              共 {items.length} 条 · 已确认 {confirmed.size} 条 · 待确认 {remaining} 条
            </span>
          </div>

          {GROUPS.map((group) => {
            const groupItems = items.filter((i) => i.group === group)
            if (groupItems.length === 0) return null

            return (
              <div key={group} className="mt-10">
                <h3 className="text-[14px] font-medium text-[var(--ws-muted)]">
                  {PARSED_GROUP_LABEL[group]}
                  <span className="ml-2 tabular-nums">{groupItems.length}</span>
                </h3>

                <ul className="mt-4 divide-y divide-[var(--ws-line)]">
                  {groupItems.map((item) => (
                    <li key={item.id} className="flex flex-wrap items-start gap-x-4 gap-y-3 py-4">
                      <div className="min-w-0 flex-1">
                        {editingId === item.id ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              value={draft}
                              onChange={(e) => setDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitEdit()
                                if (e.key === 'Escape') setEditingId(null)
                              }}
                              aria-label="编辑条目"
                              className={cn(inputCls, 'flex-1 py-2 text-[14px]')}
                            />
                            <button
                              type="button"
                              onClick={commitEdit}
                              className="rounded-full border border-[var(--ws-ghost-line)] px-3 py-1.5 text-[12px] text-[var(--ws-ok)]"
                            >
                              保存
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="rounded-full px-2 py-1.5 text-[12px] text-[var(--ws-muted)]"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <p className="text-[15px] leading-relaxed text-[var(--ws-ink)]">{item.text}</p>
                        )}
                      </div>

                      {editingId !== item.id && (
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleConfirm(item.id)}
                            aria-pressed={confirmed.has(item.id)}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[12px] transition-colors',
                              confirmed.has(item.id)
                                ? 'border-[var(--ws-ok)] text-[var(--ws-ok)]'
                                : 'border-[var(--ws-ghost-line)] text-[var(--ws-ink-2)] hover:border-[var(--ws-ghost-line-strong)] hover:text-[var(--ws-ink)]',
                            )}
                          >
                            {confirmed.has(item.id) ? (
                              <Check className="size-3" aria-hidden="true" />
                            ) : (
                              <X className="size-3 opacity-50" aria-hidden="true" />
                            )}
                            {confirmed.has(item.id) ? '已确认' : '确认'}
                          </button>

                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            aria-label={`编辑：${item.text}`}
                            className="rounded-full border border-[var(--ws-ghost-line)] p-1.5 text-[var(--ws-muted)] transition-colors hover:text-[var(--ws-ink)]"
                          >
                            <Pencil className="size-3" aria-hidden="true" />
                          </button>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label={`删除：${item.text}`}
                            className="rounded-full border border-transparent p-1.5 text-[var(--ws-miss)] transition-colors hover:border-[var(--ws-ghost-line)]"
                          >
                            <Trash2 className="size-3" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}

          <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-[var(--ws-line)] pt-6">
            <Link
              href="/resume"
              className="rounded-full bg-[var(--ws-sand-fill)] px-5 py-2.5 text-[15px] font-medium text-[var(--ws-on-sand)] transition-transform hover:scale-[1.02]"
            >
              确认并保存
            </Link>
            <span className="text-[13px] text-[var(--ws-muted)]">
              {remaining > 0
                ? `还有 ${remaining} 条未确认，保存后它们仍会以「用户声明」保留`
                : '全部条目已确认'}
            </span>
          </div>
        </section>
      )}
    </div>
  )
}
