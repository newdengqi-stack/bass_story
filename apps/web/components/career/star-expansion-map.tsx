'use client'

import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

type CareerMatch = {
  title: string
  score: number // 0-100，越高表示与简历匹配度越高
}

const DEFAULT_MATCHES: CareerMatch[] = [
  { title: '产品经理', score: 91 },
  { title: '数据分析师', score: 86 },
  { title: '用户研究员', score: 79 },
  { title: '增长运营', score: 74 },
  { title: '商业分析师', score: 68 },
  { title: '项目经理', score: 61 },
]

function useElapsedSeconds() {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      setElapsed((now - start) / 1000)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return elapsed
}

/**
 * 星型扩展图：以「我的简历」为中心向外辐射，节点距中心越近，
 * 代表该职业与简历的匹配度越高。整个星系缓慢公转，节点各自呼吸、闪烁。
 */
export function StarExpansionMap({
  matches = DEFAULT_MATCHES,
  className,
}: {
  matches?: CareerMatch[]
  className?: string
}) {
  const t = useElapsedSeconds()
  const n = matches.length

  // 每个节点的漂浮参数：独立随机的频率、相位与振幅，让运动像水面浮标一样
  // 各自起伏、互不同步，而不是整体绕中心公转
  const drift = useMemo(
    () =>
      matches.map(() => ({
        freqX: 0.14 + Math.random() * 0.22,
        freqY: 0.11 + Math.random() * 0.22,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        ampX: 2.2 + Math.random() * 3,
        ampY: 2.2 + Math.random() * 3,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseFreq: 1.1 + Math.random() * 0.8,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在节点集合变化时重新随机，避免动画跳变
    [matches.length],
  )

  const nodes = matches.map((m, i) => {
    const d = drift[i]
    const baseAngle = -90 + (360 / n) * i
    const baseRadius = 46 - (m.score / 100) * 27
    const rad = (baseAngle * Math.PI) / 180
    const homeX = 50 + baseRadius * Math.cos(rad)
    const homeY = 50 + baseRadius * Math.sin(rad)
    const x = homeX + Math.sin(t * d.freqX + d.phaseX) * d.ampX
    const y = homeY + Math.sin(t * d.freqY + d.phaseY) * d.ampY
    const pulse = 0.5 + 0.5 * Math.sin(t * d.pulseFreq + d.pulsePhase)
    return {
      ...m,
      x,
      y,
      pulse,
      size: 1 + (m.score / 100) * 1.5,
    }
  })

  const corePulse = 0.5 + 0.5 * Math.sin(t * 1.6)

  return (
    <div
      className={cn('relative aspect-square w-full', className)}
      role="img"
      aria-label={`星型扩展图：围绕我的简历，按匹配度展示 ${n} 个推荐职业`}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <pattern id="sem-dots" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.55" fill="var(--ws-line-2)" />
          </pattern>
          <radialGradient id="sem-core-glow">
            <stop offset="0%" stopColor="var(--ws-sand)" stopOpacity="0.85" />
            <stop offset="45%" stopColor="var(--ws-sand)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--ws-sand)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sem-node-glow">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="40%" stopColor="var(--ws-sand)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--ws-sand)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width="100" height="100" fill="url(#sem-dots)" opacity="0.7" />

        {[16, 25, 34, 43].map((r, i) => (
          <circle
            key={r}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="var(--ws-line)"
            strokeWidth="0.35"
            strokeDasharray="1.4 2.2"
            className="sem-orbit"
            style={{
              animationDuration: `${40 + i * 18}s`,
              animationDirection: i % 2 ? 'reverse' : 'normal',
            }}
          />
        ))}

        {nodes.map((node, i) => (
          <g key={node.title}>
            <line
              x1="50"
              y1="50"
              x2={node.x}
              y2={node.y}
              stroke="var(--ws-sand)"
              strokeWidth="0.45"
              opacity={0.22 + (node.score / 100) * 0.35}
            />
            <line
              x1="50"
              y1="50"
              x2={node.x}
              y2={node.y}
              stroke="#fff"
              strokeWidth="0.7"
              strokeLinecap="round"
              strokeDasharray="2 40"
              className="sem-flow"
              style={{ animationDelay: `${-i * 0.55}s` }}
            />
          </g>
        ))}

        <circle cx="50" cy="50" r={9 + corePulse * 3} fill="url(#sem-core-glow)" opacity={0.55 + corePulse * 0.3} />
        <circle
          cx="50"
          cy="50"
          r="5.2"
          fill="none"
          stroke="var(--ws-sand)"
          strokeWidth="0.4"
          opacity="0.5"
          className="sem-ripple"
        />
        <circle
          cx="50"
          cy="50"
          r="5.2"
          fill="none"
          stroke="var(--ws-sand)"
          strokeWidth="0.4"
          opacity="0.5"
          className="sem-ripple"
          style={{ animationDelay: '1.6s' }}
        />
        <circle cx="50" cy="50" r={2.4 + corePulse * 0.5} fill="var(--ws-sand)" />

        {nodes.map((node) => (
          <g key={node.title}>
            <circle
              cx={node.x}
              cy={node.y}
              r={node.size * (2.4 + node.pulse * 1.6)}
              fill="url(#sem-node-glow)"
              opacity={0.35 + node.pulse * 0.5}
            />
            <circle
              cx={node.x}
              cy={node.y}
              r={node.size * (0.92 + node.pulse * 0.16)}
              fill="var(--ws-ink)"
              stroke="var(--ws-sand)"
              strokeWidth="0.3"
            />
          </g>
        ))}
      </svg>

      <div className="pointer-events-none absolute left-1/2 top-[calc(50%+9px)] -translate-x-1/2 whitespace-nowrap text-center">
        <span className="text-[10px] tracking-wide text-[var(--ws-muted)]">我的简历</span>
      </div>

      {nodes.map((node) => {
        const alignRight = node.x > 54
        const alignLeft = node.x < 46
        return (
          <div
            key={node.title}
            className={cn(
              'pointer-events-none absolute flex -translate-y-1/2 items-baseline gap-1.5 whitespace-nowrap',
              alignRight && 'translate-x-2.5',
              alignLeft && '-ml-2.5 -translate-x-full',
              !alignRight && !alignLeft && '-translate-x-1/2 translate-y-3.5',
            )}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <span className="text-[13px] font-medium text-[var(--ws-ink)]">{node.title}</span>
            <span className="font-mono text-[11px] tabular-nums text-[var(--ws-sand)]">{node.score}%</span>
          </div>
        )
      })}
    </div>
  )
}
