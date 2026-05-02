import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppContext } from '@/context/app-context'
import { useChat } from './hooks/use-chat'
import { ChatMessages } from './components/chat-messages'
import { ChatInput } from './components/chat-input'
import type { Toolbox } from './toolbox'

const DIM_DELAY_MS = 5000

export function AgentFeature({ toolbox }: { toolbox: Toolbox | null }) {
  const { apiKey } = useAppContext()
  const [open, setOpen] = useState(false)
  const [dimmedIds, setDimmedIds] = useState<Set<string>>(new Set())
  const dimTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const { messages, status, sendMessage } = useChat(apiKey, toolbox)
  const messagesRef = useRef(messages)
  useEffect(() => { messagesRef.current = messages }, [messages])

  // Always resets the timer — so updating messages push the countdown back
  const scheduleDim = useCallback((id: string) => {
    const existing = dimTimers.current.get(id)
    if (existing) clearTimeout(existing)
    const timer = setTimeout(() => {
      setDimmedIds(prev => new Set([...prev, id]))
      dimTimers.current.delete(id)
    }, DIM_DELAY_MS)
    dimTimers.current.set(id, timer)
  }, [])

  const openChat = useCallback(() => {
    setOpen(true)
    dimTimers.current.forEach(t => clearTimeout(t))
    dimTimers.current.clear()
    setDimmedIds(new Set())
  }, [])

  const closeChat = useCallback(() => {
    setOpen(false)
    // Immediately schedule dims for already-complete messages
    messagesRef.current.forEach(msg => {
      if (!msg.streaming) scheduleDim(msg.id)
    })
  }, [scheduleDim])

  // Per-message: only start the dim timer once streaming is done;
  // cancel it while the message is still updating
  const prevStreamingRef = useRef<Map<string, boolean>>(new Map())
  useEffect(() => {
    messages.forEach(msg => {
      // Treat unseen messages as "was streaming" so new completed ones fire scheduleDim
      const wasStreaming = prevStreamingRef.current.get(msg.id) ?? true

      if (!open) {
        if (msg.streaming) {
          // Content still updating — push dim back
          const t = dimTimers.current.get(msg.id)
          if (t) { clearTimeout(t); dimTimers.current.delete(msg.id) }
        } else if (wasStreaming) {
          // Just finished — start the countdown
          scheduleDim(msg.id)
        }
      }

      prevStreamingRef.current.set(msg.id, msg.streaming)
    })
  }, [messages, open, scheduleDim])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && !open) {
        e.preventDefault()
        openChat()
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [open, openChat])

  useEffect(() => {
    return () => { dimTimers.current.forEach(t => clearTimeout(t)) }
  }, [])

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex flex-col">
      <ChatMessages messages={messages} dimmedIds={dimmedIds} />
      {open ? (
        <>
          <div className="absolute inset-0 pointer-events-auto" onClick={closeChat} />
          <ChatInput
            onSubmit={sendMessage}
            onClose={closeChat}
            isLoading={status === 'streaming'}
          />
        </>
      ) : (
        <div className="absolute bottom-8 right-8 pointer-events-none">
          <span className="text-xs text-white/25 tracking-wide">/ to type</span>
        </div>
      )}
    </div>
  )
}
