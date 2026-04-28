import { useState, useEffect } from 'react'
import { useAppContext } from '@/context/app-context'
import { useChat } from './hooks/use-chat'
import { ChatMessages } from './components/chat-messages'
import { ChatInput } from './components/chat-input'
import type { Toolbox } from './toolbox'

export function AgentFeature({ toolbox }: { toolbox: Toolbox | null }) {
  const { apiKey } = useAppContext()
  const [open, setOpen] = useState(false)
  const { messages, status, sendMessage } = useChat(apiKey, toolbox)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && !open) {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [open])

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex flex-col">
      <ChatMessages messages={messages} />
      {open && (
        <>
          <div className="absolute inset-0 pointer-events-auto" onClick={() => setOpen(false)} />
          <ChatInput
            onSubmit={sendMessage}
            onClose={() => setOpen(false)}
            isLoading={status === 'streaming'}
          />
        </>
      )}
    </div>
  )
}
