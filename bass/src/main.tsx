import React, {
  Component,
  Suspense,
  lazy,
  useEffect,
  type ReactNode,
} from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
} from 'react-router-dom'
import RootLayout from '@/app/layout'
import '@/app/globals.css'
import '@fontsource-variable/noto-sans-sc/wght.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/jetbrains-mono/400.css'

const Home = lazy(() => import('@/app/page'))
const Upload = lazy(() => import('@/app/upload/page'))
const Confirm = lazy(() => import('@/app/confirm/page'))
const Review = lazy(() => import('@/app/review/page'))
const Role = lazy(() => import('@/app/role/page'))
const Assessment = lazy(() => import('@/app/assessment/page'))
const Submission = lazy(() => import('@/app/submission/page'))
const Report = lazy(() => import('@/app/report/page'))
const Sample = lazy(() => import('@/app/report/sample/page'))
const titles: Record<string, string> = {
  '/': '看清真实能力',
  '/upload': '添加简历',
  '/confirm': '确认事实',
  '/review': '简历初评',
  '/role': '岗位与 JD',
  '/assessment': '技术问答',
  '/submission': '审核状态',
  '/report': '正式报告',
  '/report/sample': '报告示例',
}
class RouteError extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? (
      <main className="mx-auto max-w-xl p-8">
        <h1>页面加载失败</h1>
        <p>请检查网络后重试。刷新会清除当前内存演示会话。</p>
        <button onClick={() => location.reload()}>重新加载</button>
        <p>
          <a href="/">返回首页</a>
        </p>
      </main>
    ) : (
      this.props.children
    )
  }
}
function PageEffects() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    document.title = `${titles[pathname] ?? '页面不存在'}｜知程 AI`
  }, [pathname])
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else {
      window.scrollTo(0, 0)
      const h = document.querySelector('h1')
      h?.setAttribute('tabindex', '-1')
      ;(h as HTMLElement | null)?.focus({ preventScroll: true })
    }
  }, [pathname, hash])
  return null
}
function App() {
  const location = useLocation()
  return (
    <RootLayout>
      <RouteError key={location.pathname}>
        <Suspense
          fallback={
            <p role="status" className="p-8">
              正在加载页面…
            </p>
          }
        >
          <PageEffects />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/confirm" element={<Confirm />} />
            <Route path="/review" element={<Review />} />
            <Route path="/role" element={<Role />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/submission" element={<Submission />} />
            <Route path="/report" element={<Report />} />
            <Route path="/report/sample" element={<Sample />} />
            <Route
              path="/states"
              element={<Navigate to="/submission#demo-states" replace />}
            />
            <Route
              path="*"
              element={
                <main className="p-8">
                  <h1>页面不存在</h1>
                  <Link to="/">返回首页</Link>
                </main>
              }
            />
          </Routes>
        </Suspense>
      </RouteError>
    </RootLayout>
  )
}
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
