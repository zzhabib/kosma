import { useState, useEffect, useRef } from 'react'

interface UseMenuProps {
  apiKey: string | null
}

export function useMenu({ apiKey }: UseMenuProps) {
  const [open, setOpen] = useState(!apiKey)
  const openRef = useRef(open)

  useEffect(() => {
    setOpen(!apiKey)
  }, [apiKey])

  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA'

      if (e.key === 'Escape' && openRef.current && apiKey) {
        setOpen(false)
      }
      if (e.key === 'm' && !isTyping && apiKey) {
        e.preventDefault()
        setOpen(!openRef.current)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [apiKey])

  return { open, setOpen }
}
