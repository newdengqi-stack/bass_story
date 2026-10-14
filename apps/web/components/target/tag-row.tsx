'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { JdTag } from '@/lib/jd-parse'

const STRENGTH_LABEL: Record<JdTag['strength'], string> = {
  must: '必须',
  plus: '加分',
  inferred: '岗位推断',
}

type Props = {
  tag: JdTag
  active: boolean
  onHover: (id: string | null) => void
  onRemove: (id: string) => void
  onAdopt?: (id: string) => void
}

export function TagRow({ tag, active, onHover, onRemove, onAdopt }: Props) {
  return (
    <div
      onMouseEnter={() => onHover(tag.id)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        'group/tag rounded-xl border px-3.5 py-3 transition-colors',
        tag.strength === 'inferred'
          ? 'border-dashed border-white/25 bg-transparent'
          : 'border-white/12 bg-white/5',
        active ? 'border-[#e9c9a8] bg-[#e9c9a8]/12' : 'hover:border-white/30',
      )}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium text-white">{tag.label}</span>

        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] tracking-wide',
            tag.strength === 'must' && 'bg-white/90 text-[#2a2140]',
            tag.strength === 'plus' && 'border border-[#e9c9a8]/60 text-[#e9c9a8]',
            tag.strength === 'inferred' && 'border border-white/30 text-white/60',
          )}
        >
          {STRENGTH_LABEL[tag.strength]}
        </span>

        <div className="ml-auto flex items-center gap-1">
          {tag.strength === 'inferred' && onAdopt && (
            <button
              type="button"
              onClick={() => onAdopt(tag.id)}
              className="rounded-full px-2 py-1 text-xs text-[#e9c9a8] transition-colors hover:bg-[#e9c9a8]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9c9a8]"
            >
              采纳
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemove(tag.id)}
            aria-label={`移除「${tag.label}」`}
            className="rounded-full p-1 text-white/35 opacity-0 transition-all hover:bg-white/10 hover:text-white focus-visible:opacity-100 group-hover/tag:opacity-100"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* 来源片段 —— 常驻显示，不依赖悬停 */}
      <p className="mt-1.5 line-clamp-2 text-xs text-white/45">
        {tag.source ? `来源：「${tag.source}」` : '来源：岗位名称推断（未在 JD 中直接出现）'}
      </p>
    </div>
  )
}
