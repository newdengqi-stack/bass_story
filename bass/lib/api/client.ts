export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
const messages: Record<number, string> = {
  401: '会话不存在或已失效，请重新开始。',
  403: '当前会话无权访问此内容。',
  409: '资料版本已变化，请重新确认后重试。',
  410: '内容已过期或访问已撤销。',
  413: '文件超过允许大小。',
  415: '不支持此文件类型。',
  422: '输入内容无效，请检查后重试。',
  429: '请求过于频繁，请稍后重试。',
}
export async function request(
  path: string,
  options: RequestInit = {},
  timeoutMs = 15000,
): Promise<unknown> {
  if (!path.startsWith('/api/v1/')) throw new ApiError(0, '无效的业务 API 路径')
  const controller = new AbortController()
  const abort = () => controller.abort()
  options.signal?.addEventListener('abort', abort, { once: true })
  if (options.signal?.aborted) controller.abort()
  const timer = setTimeout(abort, timeoutMs)
  try {
    const response = await fetch(path, {
      ...options,
      signal: controller.signal,
      credentials: 'same-origin',
      headers: {
        ...(options.body instanceof FormData
          ? {}
          : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    })
    if (!response.ok) {
      const fallback =
        messages[response.status] ??
        (response.status >= 500
          ? '服务暂时不可用，请稍后重试。'
          : '请求失败，请重试。')
      const body: unknown = await response.json().catch(() => null)
      const detail =
        body && typeof body === 'object' && 'error' in body ? body.error : null
      const message =
        detail &&
        typeof detail === 'object' &&
        'message' in detail &&
        typeof detail.message === 'string' &&
        detail.message.length <= 400
          ? detail.message
          : fallback
      throw new ApiError(response.status, message)
    }
    if (response.status === 204) return null
    try {
      return await response.json()
    } catch {
      throw new ApiError(0, '服务返回了无效的数据。')
    }
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (controller.signal.aborted)
      throw new ApiError(
        0,
        options.signal?.aborted ? '操作已取消。' : '请求超时，请重试。',
      )
    throw new ApiError(0, '网络连接失败，请检查网络后重试。')
  } finally {
    clearTimeout(timer)
    options.signal?.removeEventListener('abort', abort)
  }
}
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new ApiError(0, '接口数据结构不符合约定。')
  return value as Record<string, unknown>
}
export function string(value: unknown): string {
  if (typeof value !== 'string') throw new ApiError(0, '接口缺少必要文本。')
  return value
}
export function enumValue<T extends string>(
  value: unknown,
  values: readonly T[],
): T {
  if (!values.includes(value as T))
    throw new ApiError(0, '接口状态不符合约定。')
  return value as T
}
export function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new ApiError(0, '接口列表不符合约定。')
  return value
}
export function bool(value: unknown): boolean {
  if (typeof value !== 'boolean') throw new ApiError(0, '接口缺少必要状态。')
  return value
}
export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new ApiError(0, '操作已取消。'))
      return
    }
    const abort = () => {
      clearTimeout(timer)
      reject(new ApiError(0, '操作已取消。'))
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', abort, { once: true })
  })
}
export async function pollTask(
  id: string,
  signal?: AbortSignal,
  maxAttempts = 60,
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const task = record(
      await request(`/api/v1/tasks/${encodeURIComponent(id)}`, { signal }),
    )
    const state = enumValue(task.state, [
      'queued',
      'running',
      'succeeded',
      'failed',
      'cancelled',
    ] as const)
    if (state === 'succeeded') return string(task.result_id)
    if (state === 'failed' || state === 'cancelled')
      throw new ApiError(0, '任务未完成，可重试或改用文本输入。')
    await delay(1000, signal)
  }
  throw new ApiError(0, '任务仍在处理，请稍后恢复查询。')
}
