import { useCallback, useEffect, useRef } from 'react'

export function useInterval(callback: () => void, delay: number | null = null) {
  const savedCallback = useRef<() => void>(callback)
  savedCallback.current = callback

  const tick = useCallback(() => {
    if (savedCallback.current != null) {
      savedCallback.current()
    }
  }, [savedCallback])

  useEffect(() => {
    if (delay != null && typeof delay === 'number') {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
    // Otherwise, nothing to clean up
    return () => null
  }, [delay, tick])
}
