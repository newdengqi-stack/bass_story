// 演示开关 —— 仅用于本地跑通「正常数据下走不到」的分支。
//
// 背景：本项目按 design.md D4 不接后端、不持久化，mock 数据是固定的。
// 但规格里有几条分支（资产为空、证据少于五条、证据全部不足、无可建议内容）
// 在固定 mock 下永远走不到，无法验证。这些分支又必须存在且正确。
//
// 因此提供一个显式的、只读的开关：URL 上加 ?demo=xxx 才切换，
// 不带参数时一律走默认路径 —— 它不是产品功能，只服务于演示与自查。

export type DemoState = 'default' | 'empty' | 'low-evidence' | 'all-insufficient' | 'no-suggestions'

const VALID: readonly DemoState[] = ['default', 'empty', 'low-evidence', 'all-insufficient', 'no-suggestions']

export function readDemoState(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): DemoState {
  const raw = searchParams?.demo
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value) return 'default'
  return (VALID as readonly string[]).includes(value) ? (value as DemoState) : 'default'
}

/** 拼一个带演示开关的链接，保持其他查询参数不变 */
export function withDemo(href: string, state: DemoState): string {
  if (state === 'default') return href
  return `${href}${href.includes('?') ? '&' : '?'}demo=${state}`
}
