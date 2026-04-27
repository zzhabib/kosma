import { useState, useEffect } from 'react'

const STORAGE_KEY = 'kosma:apiKey'

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setApiKeyState(stored)
  }, [])

  const setApiKey = (key: string | null) => {
    setApiKeyState(key)
    if (key) {
      localStorage.setItem(STORAGE_KEY, key)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return { apiKey, setApiKey }
}
