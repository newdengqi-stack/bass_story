import type { ReactNode } from 'react'

/**
 * 路由切换的接缝。
 *
 * ⚠️ 这里**不做整页入场动画**，`.page-in` 当前是空类。
 * 原因：template 包住的是整页，包括各页那个 position: fixed 的全屏背景，
 * 容器级动画只有两种走法且都不行：
 *   · 动 opacity —— 整页（含背景）先透明，露出根底色，用户看到的就是「跳转白闪一下」
 *   · 动 transform/filter —— 会为 fixed 后代建立包含块，背景被拖成随页面滚动并错位
 *
 * 页面的入场感由背景自己的 .scene-in 与内容区的 .reveal 负责。
 * 若将来要做真正的页面转场，用 View Transitions API，不要再回到这一层做 opacity。
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-in">{children}</div>
}
