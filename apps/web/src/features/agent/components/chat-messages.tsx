import { useEffect, useRef } from 'react'
import { type ChatMessage as ChatMessageType } from '../types'

interface ChatMessagesProps {
  messages: ChatMessageType[]
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div
      ref={scrollRef}
      className="absolute top-8 left-8 max-w-[35%] max-h-[60vh] overflow-y-auto space-y-3 pointer-events-auto [scrollbar-width:none]"
    >
      {messages.map((msg) => (
        <MessageLine key={msg.id} message={msg} />
      ))}
    </div>
  )
}

function MessageLine({ message }: { message: ChatMessageType }) {
  const rolePrefix = message.role === 'user' ? '> ' : '< '
  const text = message.content
    .filter((block) => block.type === 'text')
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join(' ')

  return (
    <div className="text-sm text-white/70 leading-relaxed">
      <span className="text-white/50">{rolePrefix}</span>
      {text}
    </div>
  )
}
