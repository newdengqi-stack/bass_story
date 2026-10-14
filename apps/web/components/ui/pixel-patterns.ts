// 点阵图案 —— 用代码生成而非手写，避免人工排错
// 语义：'#' 实心墨色，'+' 沙金强调，'.' 空

export type Pattern = string[]

function blank(n: number, m: number): string[][] {
  return Array.from({ length: n }, () => Array(m).fill('.'))
}

/** 靶心 —— 意向职业：同心方框，像瞄准镜 */
function targetPattern(n = 13): Pattern {
  const g = blank(n, n)
  for (let ring = 0; ring * 2 < n - 1; ring++) {
    const o = ring * 2
    const s = n - 1 - o
    if (s <= o) break
    for (let i = o; i <= s; i++) {
      g[o][i] = '#'
      g[s][i] = '#'
      g[i][o] = '#'
      g[i][s] = '#'
    }
  }
  const c = (n - 1) / 2
  g[c][c] = '+'
  return g.map((r) => r.join(''))
}

/** 方波 —— 项目深挖：示波器上的信号 */
function wavePattern(n = 13): Pattern {
  const g = blank(n, n)
  const hi = Math.floor(n * 0.28)
  const lo = Math.floor(n * 0.72)
  const seg = 3
  for (let x = 0; x < n; x++) {
    const band = Math.floor(x / seg) % 2 === 0 ? hi : lo
    g[band][x] = '#'
  }
  for (let x = seg; x < n; x += seg) {
    const prev = Math.floor((x - 1) / seg) % 2 === 0 ? hi : lo
    const next = Math.floor(x / seg) % 2 === 0 ? hi : lo
    for (let y = Math.min(prev, next); y <= Math.max(prev, next); y++) g[y][x] = '#'
  }
  g[hi][1] = '+'
  return g.map((r) => r.join(''))
}

/** 阶梯 —— 职业差距分析：逐级补齐 */
function stairsPattern(n = 13): Pattern {
  const g = blank(n, n)
  const step = 4
  for (let x = 0; x < n; x++) {
    const level = Math.floor(x / step)
    const top = Math.max(0, n - 1 - (level + 1) * 3)
    for (let y = top; y < n; y++) g[y][x] = '#'
  }
  // 最高一级用沙金点亮，表示“可抵达”
  for (let y = 0; y < 3; y++) {
    for (let x = 12; x < n; x++) g[y][x] = '+'
  }
  return g.map((r) => r.join(''))
}

/** 文档 —— 我的简历：字段行 + 已确认标记 */
function docPattern(n = 13): Pattern {
  const g = blank(n, n)
  const w = 8
  const h = 11
  for (let x = 1; x <= w; x++) {
    g[1][x] = '#'
    g[h][x] = '#'
  }
  for (let y = 1; y <= h; y++) {
    g[y][1] = '#'
    g[y][w] = '#'
  }
  // 内容行
  for (let y = 3; y <= h - 1; y += 2) {
    for (let x = 3; x <= w - 2; x++) g[y][x] = y === 3 ? '+' : '.'
  }
  // 右下角的已确认勾
  g[9][9] = '#'
  g[10][10] = '#'
  g[11][10] = '#'
  g[12][9] = '+'
  g[12][8] = '#'
  return g.map((r) => r.join(''))
}

/** 点阵矩阵 —— 工作台：规则排布的单元 */
function matrixPattern(n = 13, step = 3): Pattern {
  const g = blank(n, n)
  for (let y = 1; y < n; y += step) {
    for (let x = 1; x < n; x += step) {
      g[y][x] = '#'
    }
  }
  g[1][1] = '+'
  g[7][7] = '+'
  return g.map((r) => r.join(''))
}

const PATTERNS: Record<string, Pattern> = {
  target: targetPattern(),
  wave: wavePattern(),
  stairs: stairsPattern(),
  doc: docPattern(),
  matrix: matrixPattern(),
}

export type GlyphName = keyof typeof PATTERNS

export function getPattern(name: GlyphName): Pattern {
  return PATTERNS[name] ?? PATTERNS.matrix
}

/** 供装饰用的横向量条：按种子生成不规则点列，避免死板 */
export function tickRow(count: number, seed = 1): number[] {
  let s = seed
  return Array.from({ length: count }, () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return (s % 5) + 1
  })
}
