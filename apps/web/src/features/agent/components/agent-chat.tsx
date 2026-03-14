import { useState, useEffect, useRef } from 'react'
import { type Message } from './chat-message'
import { ChatPanel } from './chat-panel'
import { ChatToggle } from './chat-toggle'

export function AgentChat() {
  const [open, setOpen] = useState(false)
  const [messages] = useState<Message[]>([])
  const openRef = useRef(open)

  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA'

      if (e.key === 'T' && !isTyping && !openRef.current) {
        setOpen(true)
      }
      if (e.key === 'Escape' && openRef.current) {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      {!open && <ChatToggle onToggle={() => setOpen(true)} />}
      {open && (
        <div className="fixed right-0 top-0 h-screen w-100 z-40">
          <ChatPanel messages={messages} onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  )
}
