import { useState, useEffect, useRef } from 'react'

const thumbnailCache = new Map<string, string>()

export function useThumbnail(
  filePath: string | null,
  size: 'small' | 'medium' | 'large' = 'small',
  enabled = true
): { dataUri: string | null; loading: boolean; error: boolean } {
  const [dataUri, setDataUri] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (!filePath || !enabled) return

    const cacheKey = `${filePath}-${size}`
    const cached = thumbnailCache.get(cacheKey)
    if (cached) {
      setDataUri(cached)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(false)

    window.electronAPI
      .getThumbnail(filePath, size)
      .then((uri) => {
        if (!cancelled && mountedRef.current) {
          thumbnailCache.set(cacheKey, uri)
          setDataUri(uri)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled && mountedRef.current) {
          setError(true)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [filePath, size, enabled])

  return { dataUri, loading, error }
}
