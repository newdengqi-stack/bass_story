import { vi } from 'vitest'

// 共享的可观测路由 mock：组件导航调用被记录到 mockRouter，供断言使用。
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
}

export function useRouter() {
  return mockRouter
}

export function usePathname() {
  return '/'
}

export function useSearchParams() {
  return new URLSearchParams()
}

export function useParams() {
  return {}
}
