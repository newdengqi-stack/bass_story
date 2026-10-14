'use client'

import { useMemo } from 'react'
import { RotateCcw, ArrowLeft, ShieldAlert, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { linkSegments, type Category, type JdBreakdown } from '@/lib/jd-parse'
import { TagRow } from './tag-row'

type Props = {
  title: string
  jd: string
  breakdown: JdBreakdown
  activeTag: string | null
  onHover: (id: string | null) => void
  onRemove: (id: string) => void
  onRemoveHard: (id: string) => void
  onAdopt: (id: string) => void
  onConfirm: () => void
  onReparse: () => void
  onBack: () => void
}

const CATEGORY_LABEL: Record<Category, string> = {
  tech: '技术要求',
  engineering: '工程能力',
}

export function JdReview({
  title,
  jd,
  breakdown,
  activeTag,
  onHover,
  onRemove,
  onRemoveHard,
  onAdopt,
  onConfirm,
  onReparse,
  onBack,
}: Props) {
  const { tags, hard } = breakdown
  const segments = useMemo(() => linkSegments(jd, tags), [jd, tags])
  const pending = useMemo(() => tags.filter((t) => t.strength === 'inferred'), [tags])
  const byCategory = (c: Category) => tags.filter((t) => t.category === c)

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* ============ 左：JD 原文 + 回链高亮 ============ */}
      <section className="lg:col-span-7" aria-labelledby="jd-source-title">
        <div className="glass flex h-full flex-col rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="jd-source-title" className="font-serif text-lg font-semibold text-white">
              JD 原文
            </h2>
            <span className="text-xs text-white/45">悬停任一标签可回看原文</span>
          </div>

          <div className="max-h-[32rem] overflow-y-auto rounded-xl bg-black/20 p-4">
            <p className="whitespace-pre-wrap text-sm leading-loose text-white/70">
              {segments.map((seg, i) =>
                seg.tagIds.length > 0 ? (
                  <mark
                    key={i}
                    onMouseEnter={() => onHover(seg.tagIds[0])}
                    onMouseLeave={() => onHover(null)}
                    className={cn(
                      'rounded px-0.5 transition-colors',
                      seg.tagIds.includes(activeTag ?? '')
                        ? 'bg-[#e9c9a8] font-medium text-[#2a2140]'
                        : 'bg-[#e9c9a8]/20 text-white/90',
                    )}
                  >
                    {seg.text}
                  </mark>
                ) : (
                  <span key={i}>{seg.text}</span>
                ),
              )}
            </p>
          </div>

          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-white/45">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>
              高亮处是每个标签的来源原文。没有被高亮的说法，不会被标为「明确要求」——
              这是这份分析能被核实的前提。
            </span>
          </p>
        </div>
      </section>

      {/* ============ 右：解析结果分组 ============ */}
      <section className="lg:col-span-5" aria-labelledby="extract-title">
        <div className="glass flex h-full flex-col rounded-2xl p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 id="extract-title" className="font-serif text-lg font-semibold text-white">
              抽取结果
            </h2>
            <span className="text-xs text-white/45">
              共 {tags.length + hard.length} 项 · <span className="text-[#e9c9a8]">{title}</span>
            </span>
          </div>

          <div className="flex flex-col gap-5 overflow-y-auto">
            {/* 待确认 —— 岗位推断项 */}
            {pending.length > 0 && (
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-xs tracking-widest text-white/50">
                  待确认 · {pending.length}
                  <span className="font-normal normal-case tracking-normal text-white/35">
                    来自岗位推断，未在 JD 中直接出现
                  </span>
                </h3>
                <div className="flex flex-col gap-2">
                  {pending.map((t) => (
                    <TagRow
                      key={t.id}
                      tag={t}
                      active={activeTag === t.id}
                      onHover={onHover}
                      onRemove={onRemove}
                      onAdopt={onAdopt}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 两类能力 */}
            {(['tech', 'engineering'] as Category[]).map((cat) => {
              const list = byCategory(cat)
              if (list.length === 0) return null
              return (
                <div key={cat}>
                  <h3 className="mb-2 text-xs tracking-widest text-white/50">
                    {CATEGORY_LABEL[cat]} · {list.length}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {list.map((t) => (
                      <TagRow
                        key={t.id}
                        tag={t}
                        active={activeTag === t.id}
                        onHover={onHover}
                        onRemove={onRemove}
                      />
                    ))}
                  </div>
                </div>
              )
            })}

            {/* 硬性条件 —— 必须独立成区，不与可通过项目补强的能力混排 */}
            {hard.length > 0 && (
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-xs tracking-widest text-white/50">
                  硬性条件 · {hard.length}
                  <span className="flex items-center gap-1 rounded-full bg-[#fda4af]/15 px-2 py-0.5 text-[10px] tracking-normal text-[#fda4af]">
                    <ShieldAlert className="size-3" aria-hidden="true" />
                    不可用项目弥补
                  </span>
                </h3>
                <div className="flex flex-col gap-2 rounded-xl border border-[#fda4af]/20 p-2">
                  {hard.map((h) => (
                    <div
                      key={h.id}
                      className="rounded-xl border border-white/12 bg-white/5 px-3.5 py-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="min-w-0 flex-1 text-sm text-white">{h.label}</span>
                        <button
                          type="button"
                          onClick={() => onRemoveHard(h.id)}
                          aria-label={`移除「${h.label}」`}
                          className="shrink-0 rounded-full p-1 text-white/35 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9c9a8]"
                        >
                          <X className="size-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-xs text-white/45">来源：「{h.source}」</p>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-white/45">
                  学历、专业、毕业年份无法通过项目补强，只能核对信息是否写对，或调整目标岗位。
                </p>
              </div>
            )}

            {tags.length + hard.length === 0 && (
              <p className="rounded-xl border border-dashed border-white/20 p-6 text-center text-sm text-white/50">
                没有抽取到任何要求。请检查 JD 内容是否完整，或返回手工补充。
              </p>
            )}
          </div>

          {/* 操作 */}
          <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#2a2140] transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9c9a8]"
            >
              确认并设为主目标
            </button>
            <button
              type="button"
              onClick={onReparse}
              className="flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2.5 text-sm text-white/80 transition-colors hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9c9a8]"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              重新解析
            </button>
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm text-white/60 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9c9a8]"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              返回修改
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
