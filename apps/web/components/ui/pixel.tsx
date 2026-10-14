import { cn } from '@/lib/utils'
import { getPattern, tickRow, type GlyphName } from './pixel-patterns'

const CELL: Record<string, string> = {
  '#': 'bg-[var(--ws-ink)]',
  '+': 'bg-[var(--ws-sand)]',
  '.': 'bg-[var(--ws-line)]',
}

/** 点阵图形 —— 尺寸由外层 --px / --gap 控制，可做响应式 */
export function PixelGlyph({
  name,
  label,
  className,
}: {
  name: GlyphName
  label?: string
  className?: string
}) {
  const pattern = getPattern(name)
  const cols = pattern[0].length

  return (
    <div
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('grid w-fit [--px:6px] [--gap:2px]', className)}
      style={{
        gridTemplateColumns: `repeat(${cols}, var(--px))`,
        gap: 'var(--gap)',
      }}
    >
      {pattern.flatMap((row, r) =>
        Array.from(row).map((ch, c) => (
          <span
            key={`${r}-${c}`}
            className={cn('rounded-[1px]', CELL[ch] ?? CELL['.'])}
            style={{ width: 'var(--px)', height: 'var(--px)' }}
          />
        )),
      )}
    </div>
  )
}

/** 位寄存器 —— 用方块表示进度，比进度条更贴工程语义 */
export function BitRegister({
  total,
  filled,
  label,
  className,
}: {
  total: number
  filled: number
  label?: string
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-[3px]', className)} role="img" aria-label={label}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'h-2.5 w-2.5 rounded-[1px] transition-colors',
            i < filled ? 'bg-[var(--ws-ink)]' : 'bg-[var(--ws-line-2)]',
          )}
        />
      ))}
    </div>
  )
}

/** 点阵标尺线 —— 替代普通分隔线，带工程感（半透明，不遮挡背景） */
export function PixelRule({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'h-px w-full',
        'bg-[repeating-linear-gradient(to_right,rgb(28_26_23/0.28)_0_4px,transparent_4px_9px)]',
        className,
      )}
    />
  )
}

/** 信号刻度带 —— 高度不一的点列，做装饰性页脚/分区 */
export function TickStrip({
  count = 48,
  seed = 7,
  className,
}: {
  count?: number
  seed?: number
  className?: string
}) {
  const ticks = tickRow(count, seed)
  return (
    <div aria-hidden="true" className={cn('flex items-end gap-[2px] h-6', className)}>
      {ticks.map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-[1px] bg-[var(--ws-line-2)]"
          style={{ height: `${h * 4}px` }}
        />
      ))}
    </div>
  )
}
