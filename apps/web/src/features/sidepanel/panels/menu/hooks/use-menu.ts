import { useEffect, useRef } from 'react'

interface UseMenuProps {
  apiKey: string | null
  open: boolean
  onOpen: () => void
  onClose: () => void
}

export function useMenu({ apiKey, open, onOpen, onClose }: UseMenuProps) {
  const openRef = useRef(open)
  const onOpenRef = useRef(onOpen)
  const onCloseRef = useRef(onClose)

  useEffect(() => { openRef.current = open }, [open])
  useEffect(() => { onOpenRef.current = onOpen }, [onOpen])
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useEffect(() => {
    if (!apiKey) onOpenRef.current()
  }, [apiKey])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA'
      if (e.key === 'Escape' && openRef.current && apiKey) onCloseRef.current()
      if (e.key === 'm' && !isTyping && apiKey) {
        e.preventDefault()
        openRef.current ? onCloseRef.current() : onOpenRef.current()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [apiKey])
}
