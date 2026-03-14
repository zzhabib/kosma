import { cn } from '@/lib/utils'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const roleStyles: Record<Message['role'], string> = {
  user: 'bg-white/12 border border-white/20 text-white/95 rounded-br-sm',
  assistant: 'bg-white/5 border border-white/10 text-white/85 rounded-bl-sm',
}

const roleLabel: Record<Message['role'], string> = {
  user: 'You',
  assistant: 'Kosma',
}

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
      <span className="text-[10px] text-white/40 tracking-widest uppercase px-1">
        {roleLabel[message.role]}
      </span>
      <div className={cn('max-w-[88%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed', roleStyles[message.role])}>
        {message.content}
      </div>
    </div>
  )
}
