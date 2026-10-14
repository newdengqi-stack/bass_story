import { useCallback, useEffect, useRef, useState } from 'react'
export function useAsync() {
  const [loading, setLoading] = useState(false),
    [error, setError] = useState('')
  const active = useRef<AbortController | null>(null)
  useEffect(
    () => () => {
      active.current?.abort()
      active.current = null
    },
    [],
  )
  const run = useCallback(
    async <T>(
      operation: (signal: AbortSignal) => Promise<T>,
    ): Promise<T | undefined> => {
      active.current?.abort()
      const controller = new AbortController()
      active.current = controller
      setLoading(true)
      setError('')
      try {
        const result = await operation(controller.signal)
        if (!controller.signal.aborted) return result
      } catch (e) {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : '操作失败，请重试。')
      } finally {
        if (active.current === controller) {
          active.current = null
          setLoading(false)
        }
      }
    },
    [],
  )
  const cancel = () => {
    active.current?.abort()
    active.current = null
    setLoading(false)
    setError('操作已取消，可以重试。')
  }
  return { run, loading, error, setError, cancel }
}
