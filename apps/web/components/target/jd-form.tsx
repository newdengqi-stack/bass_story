'use client'

import { Sparkles, ChevronDown, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SAMPLE_JD } from '@/lib/jd-parse'

type Props = {
  title: string
  jd: string
  onTitle: (v: string) => void
  onJd: (v: string) => void
  onAnalyze: () => void
  parsing: boolean
  error: string
}

const inputCls =
  'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/35 outline-none transition-colors focus:border-[#e9c9a8] focus:bg-white/10'

export function JdForm({ title, jd, onTitle, onJd, onAnalyze, parsing, error }: Props) {
  const canAnalyze = title.trim().length > 0 && jd.trim().length >= 20 && !parsing

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault()
        if (canAnalyze) onAnalyze()
      }}
    >
      {/* 岗位名称 */}
      <div>
        <label htmlFor="title" className="mb-2 block text-sm text-white/80">
          岗位名称 <span className="text-[#e9c9a8]">*</span>
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => onTitle(e.target.value)}
          placeholder="例：嵌入式软件实习生"
          className={inputCls}
        />
      </div>

      {/* JD 原文 */}
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label htmlFor="jd" className="text-sm text-white/80">
            JD 原文 <span className="text-[#e9c9a8]">*</span>
          </label>
          <button
            type="button"
            onClick={() => {
              onTitle('嵌入式软件实习生')
              onJd(SAMPLE_JD)
            }}
            className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-xs text-white/70 transition-colors hover:border-[#e9c9a8] hover:text-[#e9c9a8]"
          >
            <Sparkles className="size-3" aria-hidden="true" />
            填入示例 JD
          </button>
        </div>
        <textarea
          id="jd"
          value={jd}
          onChange={(e) => onJd(e.target.value)}
          rows={12}
          placeholder="把岗位描述整段粘贴进来——越完整，抽取出的要求越准。"
          className={cn(inputCls, 'resize-y font-mono text-sm leading-relaxed')}
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={cn(jd.trim().length > 0 && jd.trim().length < 20 ? 'text-[#fda4af]' : 'text-white/45')}>
            {jd.trim().length > 0 && jd.trim().length < 20 ? '内容太短，至少需要 20 个字符' : `${jd.length} 字`}
          </span>
          <span className="text-white/45">未填 JD 无法进入分析</span>
        </div>
      </div>

      {/* 可选信息（折叠，保持主流程简洁） */}
      <details className="group rounded-xl border border-white/12 bg-white/5 px-4 py-3">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm text-white/70">
          补充信息（可选）
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-white/60">公司 / 行业</span>
            <input className={inputCls} placeholder="例：华勤技术" />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-white/60">工作地点</span>
            <input className={inputCls} placeholder="例：上海" />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-white/60">投递截止</span>
            <input type="date" className={cn(inputCls, 'text-white/80')} />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-white/60">优先级</span>
            <select className={cn(inputCls, 'text-white')} defaultValue="high">
              <option value="high">高</option>
              <option value="mid">中</option>
              <option value="low">低</option>
            </select>
          </label>
        </div>
      </details>

      {error && (
        <p role="alert" className="text-sm text-[#fda4af]">
          {error}
        </p>
      )}

      {/* 规则提示 + 提交 */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-white/50">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>
            抽取结果会逐条标出来源。JD 里没出现过的技术，不会被标为「明确要求」。
          </span>
        </p>
        <button
          type="submit"
          disabled={!canAnalyze}
          className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#2a2140] transition-transform hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-40"
        >
          {parsing ? '正在抽取…' : '分析这份 JD'}
        </button>
      </div>
    </form>
  )
}
