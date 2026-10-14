import { createMockApi } from './mock'
import { httpApi } from './http'
const mode = import.meta.env.VITE_API_MODE ?? 'mock'
if (mode !== 'mock' && mode !== 'http')
  throw new Error('VITE_API_MODE 必须为 mock 或 http')
export const isMock = mode === 'mock'
export let api = isMock ? createMockApi() : httpApi
export function resetMockApi() {
  if (isMock) api = createMockApi()
}
