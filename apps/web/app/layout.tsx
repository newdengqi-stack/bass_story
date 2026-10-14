import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

/**
 * 字体全部走运行时 <link>，**不使用 next/font/google**。
 *
 * 原因：next/font/google 会在构建/开发启动时从 Google Fonts 下载并生成 Turbopack 虚拟模块
 * （@vercel/turbopack-next/internal/font/google/font）。本机到 Google Fonts 的连接不稳定时，
 * 这一步会直接让整站 500，且失败信息指向内部模块，很难排查。
 * 运行时 <link> 下载失败只会退回系统字体，不会让页面挂掉。
 *
 * 代价：拿不到 next/font 的自动子集化与零布局偏移，首屏会有一次字体替换。
 * 字体变量（--font-instrument / --font-jetbrains）在 globals.css 的 :root 里定义。
 */
export const metadata: Metadata = {
  title: '证途 · 证据化求职准备 | 嵌入式校招与实习',
  description:
    '从目标岗位出发，用真实项目验证能力、定位差距、生成专版简历。面向嵌入式校招与实习的证据化求职准备。',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1b1530',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Serif+SC:wght@300;400;600;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
