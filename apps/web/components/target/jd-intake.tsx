'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle2, ArrowUpRight } from 'lucide-react'
import { parseJd, type JdBreakdown } from '@/lib/jd-parse'
import { JdForm } from './jd-form'
import { JdReview } from './jd-review'

type Phase = 'input' | 'parsing' | 'review' | 'done'

const EMPTY: JdBreakdown = { tags: [], hard: [] }

export function JdIntake() {
  const [phase, setPhase] = useState<Phase>('input')
  const [title, setTitle] = useState('')
  const [jd, setJd] = useState('')
  const [breakdown, setBreakdown] = useState<JdBreakdown>(EMPTY)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [error, setError] = useState('')

  const analyze = () => {
    setError('')
    setPhase('parsing')
    // 演示：本地关键词抽取（见 lib/jd-parse.ts）。
    // 岗位名一并传入，让「岗位推断」规则能命中。
    setTimeout(() => {
      const found = parseJd(`${title}\n${jd}`)
      if (found.tags.length === 0 && found.hard.length === 0) {
        setError('没有识别到任何岗位要求。请检查 JD 内容，或在下方手工补充。')
        setPhase('input')
        return
      }
      setBreakdown(found)
      setPhase('review')
    }, 900)
  }

  const removeTag = (id: string) =>
    setBreakdown((prev) => ({ ...prev, tags: prev.tags.filter((t) => t.id !== id) }))

  const removeHard = (id: string) =>
    setBreakdown((prev) => ({ ...prev, hard: prev.hard.filter((h) => h.id !== id) }))

  // 采纳 = 把「岗位推断」提升为「明确要求」，由用户自己决定
  const adoptTag = (id: string) =>
    setBreakdown((prev) => ({
      ...prev,
      tags: prev.tags.map((t) => (t.id === id ? { ...t, strength: 'must' as const } : t)),
    }))

  const backToInput = () => {
    setActiveTag(null)
    setPhase('input')
  }

  if (phase === 'parsing') {
    return (
      <div className="glass flex min-h-[20rem] flex-col items-center justify-center gap-4 rounded-2xl p-10 text-white">
        <Loader2 className="size-7 animate-spin text-[#e9c9a8]" aria-hidden="true" />
        <p className="font-serif text-lg">正在抽取岗位要求…</p>
        <p className="text-sm text-white/50">逐条定位来源，未被 JD 提到的能力不会被标记为要求</p>
      </div>
    )
  }

  if (phase === 'done') {
    const total = breakdown.tags.length + breakdown.hard.length
    return (
      <div className="glass flex min-h-[20rem] flex-col items-center justify-center gap-5 rounded-2xl p-10 text-center text-white">
        <CheckCircle2 className="size-10 text-[#86efac]" aria-hidden="true" />
        <h2 className="font-serif text-2xl font-semibold">主目标岗位已建立</h2>
        <p className="max-w-md text-sm leading-relaxed text-white/70">
          「{title}」已成为当前主目标，共确认 {total} 项要求。接下来导入简历与项目，就可以开始验证了。
        </p>
        <Link
          href="/dashboard"
          className="group mt-2 flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#2a2140] transition-transform hover:scale-[1.02]"
        >
          进入工作台
          <ArrowUpRight
            className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    )
  }

  if (phase === 'review') {
    return (
      <JdReview
        title={title}
        jd={`${title}\n${jd}`}
        breakdown={breakdown}
        activeTag={activeTag}
        onHover={setActiveTag}
        onRemove={removeTag}
        onRemoveHard={removeHard}
        onAdopt={adoptTag}
        onConfirm={() => setPhase('done')}
        onReparse={analyze}
        onBack={backToInput}
      />
    )
  }

  return (
    <div className="glass rounded-2xl p-6 md:p-8">
      <JdForm
        title={title}
        jd={jd}
        onTitle={setTitle}
        onJd={setJd}
        onAnalyze={analyze}
        parsing={false}
        error={error}
      />
    </div>
  )
}
