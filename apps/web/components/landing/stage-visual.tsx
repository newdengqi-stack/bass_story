// 四阶段自绘视觉 —— 用嵌入式/证据的意象（靶心·示波器·阶梯·印章）
// 全部为主动动效（ambient motion），不依赖鼠标或滚动输入
// 配色：沙金 #e9c9a8 为骨，纯白 #ffffff 为信号

function TargetVisual() {
  return (
    <svg viewBox="0 0 200 160" fill="none" className="h-full w-full" aria-hidden="true">
      {/* 十字参考线 */}
      <line x1="100" y1="10" x2="100" y2="150" stroke="#e9c9a8" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="3 6" />
      <line x1="28" y1="80" x2="172" y2="80" stroke="#e9c9a8" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="3 6" />
      {/* 扩散环（主动） */}
      <circle cx="100" cy="80" r="52" stroke="#e9c9a8" strokeOpacity="0.7" strokeWidth="1.5" className="svg-anim animate-ring-pulse" />
      {/* 同心圆 */}
      <circle cx="100" cy="80" r="44" stroke="#e9c9a8" strokeWidth="1.5" />
      <circle cx="100" cy="80" r="30" stroke="#e9c9a8" strokeOpacity="0.65" strokeWidth="1.5" />
      {/* 内圆呼吸（主动） */}
      <circle cx="100" cy="80" r="15" stroke="#ffffff" strokeWidth="2" className="svg-anim animate-breathe" />
      {/* 中心点 */}
      <circle cx="100" cy="80" r="4" fill="#ffffff" />
    </svg>
  )
}

function WaveVisual() {
  return (
    <svg viewBox="0 0 200 160" fill="none" className="h-full w-full" aria-hidden="true">
      {/* 基线 */}
      <line x1="16" y1="120" x2="184" y2="120" stroke="#e9c9a8" strokeOpacity="0.2" strokeWidth="1" />
      {/* 示波器波形 */}
      <path
        d="M16 96 L44 96 L60 60 L76 128 L92 84 L108 84 L124 112 L140 44 L156 118 L184 92"
        stroke="#e9c9a8"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* 采样点（主动） */}
      <circle cx="60" cy="60" r="4" fill="#ffffff" className="svg-anim animate-dot-hop" />
      <circle cx="140" cy="44" r="4" fill="#ffffff" className="svg-anim animate-dot-hop" style={{ animationDelay: '0.6s' }} />
      {/* 扫描线（主动） */}
      <line x1="58" y1="18" x2="58" y2="142" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1" className="svg-anim animate-scan-x" />
    </svg>
  )
}

function StepsVisual() {
  return (
    <svg viewBox="0 0 200 160" fill="none" className="h-full w-full" aria-hidden="true">
      {/* 向上阶梯 */}
      <path
        d="M30 132 L30 104 L78 104 L78 76 L126 76 L126 48 L174 48"
        stroke="#e9c9a8"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* 逐级点亮的数据点（主动） */}
      <circle cx="30" cy="104" r="5" fill="#e9c9a8" className="svg-anim animate-dot-hop" />
      <circle cx="78" cy="76" r="5" fill="#e9c9a8" className="svg-anim animate-dot-hop" style={{ animationDelay: '0.35s' }} />
      <circle cx="126" cy="48" r="5" fill="#e9c9a8" className="svg-anim animate-dot-hop" style={{ animationDelay: '0.7s' }} />
      {/* 顶点高亮（主动） */}
      <circle cx="174" cy="48" r="6" fill="#ffffff" className="svg-anim animate-breathe" />
    </svg>
  )
}

function CheckVisual() {
  return (
    <svg viewBox="0 0 200 160" fill="none" className="h-full w-full" aria-hidden="true">
      {/* 文档 */}
      <rect x="52" y="26" width="96" height="108" rx="8" stroke="#e9c9a8" strokeWidth="1.5" />
      {/* 文档内文字线 */}
      <line x1="68" y1="56" x2="132" y2="56" stroke="#e9c9a8" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="68" y1="72" x2="120" y2="72" stroke="#e9c9a8" strokeOpacity="0.32" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="68" y1="88" x2="124" y2="88" stroke="#e9c9a8" strokeOpacity="0.32" strokeWidth="1.5" strokeLinecap="round" />
      {/* 对勾描边绘制（主动，一次性） */}
      <path
        d="M78 116 L96 132 L128 94"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        className="animate-draw-check"
      />
    </svg>
  )
}

const VISUALS = [TargetVisual, WaveVisual, StepsVisual, CheckVisual]

export function StageVisual({ index }: { index: number }) {
  const Visual = VISUALS[index] ?? TargetVisual
  return <Visual />
}
