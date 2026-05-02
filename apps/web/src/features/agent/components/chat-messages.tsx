import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { type ChatMessage } from '../types'
import { ChatMessage as ChatMessageView } from './message'

export function ChatMessages({ messages, dimmedIds }: { messages: ChatMessage[]; dimmedIds: Set<string> }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div
      ref={scrollRef}
      className="absolute top-8 right-8 w-[28vw] min-w-72 max-h-[60vh] overflow-y-auto space-y-3 pb-2 pointer-events-auto [scrollbar-width:none]"
    >
      {messages.map((msg, i) => (
        <div
          key={msg.id}
          className={cn(
            'transition-opacity',
            dimmedIds.has(msg.id) ? 'opacity-0 duration-1000 pointer-events-none' : 'opacity-100 duration-200',
          )}
        >
          <ChatMessageView
            message={msg}
            thinkingVisible={false}
            showLabel={i === 0 || messages[i - 1].role !== msg.role}
          />
        </div>
      ))}
    </div>
  )
}
