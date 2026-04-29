import { useEffect, useRef } from 'react'
import { type ChatMessage } from '../types'
import { ChatMessage as ChatMessageView } from './message'

export function ChatMessages({ messages }: { messages: ChatMessage[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div
      ref={scrollRef}
      className="absolute top-8 left-8 max-w-[35%] max-h-[60vh] overflow-y-auto space-y-3 pb-2 pointer-events-auto [scrollbar-width:none]"
    >
      {messages.map((msg) => (
        <ChatMessageView key={msg.id} message={msg} thinkingVisible={false} />
      ))}
    </div>
  )
}
