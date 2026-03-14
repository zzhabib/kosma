import { useEffect, useRef } from 'react'
import { ChatMessage, type Message } from './chat-message'
import { ChatInput } from './chat-input'
import { cn } from '@/lib/utils'

interface ChatPanelProps {
  messages: Message[]
  onClose: () => void
}

export function ChatPanel({ messages, onClose }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div
      className={cn(
        'flex flex-col w-full h-full',
        'bg-black/60 backdrop-blur-2xl',
        'border-l border-white/15',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <span className="text-sm font-semibold text-white/80 tracking-wide">Kosma</span>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white/80 transition-colors text-base leading-none px-1"
          title="Close (Esc)"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-4 [scrollbar-width:none]"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center select-none">
            <p className="text-sm text-white/45">Describe a world to begin</p>
            <p className="text-xs text-white/25 max-w-52 leading-relaxed">
              The engine will instantiate your description as a live 3D scene
            </p>
          </div>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}
      </div>

      {/* Input */}
      <ChatInput />
    </div>
  )
}
