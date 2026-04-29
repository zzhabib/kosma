import { cn } from '@/lib/utils'
import { type ChatMessage } from '../../types'
import { ContentBlockView, type BlockRendererContext } from './block-router'

const roleStyles: Record<ChatMessage['role'], string> = {
  user: 'bg-white/12 border border-white/20 text-white/95 rounded-br-sm',
  assistant: 'bg-white/5 border border-white/10 text-white/85 rounded-bl-sm',
}

const roleLabel: Record<ChatMessage['role'], string> = {
  user: 'You',
  assistant: 'Kosma',
}

export function ChatMessage({
  message,
  thinkingVisible,
}: {
  message: ChatMessage
  thinkingVisible: boolean
}) {
  const isUser = message.role === 'user'
  const context: BlockRendererContext = { thinkingVisible }

  return (
    <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
      <span className="text-[10px] text-white/40 tracking-widest uppercase px-1">
        {roleLabel[message.role]}
      </span>
      <div className={cn('max-w-[88%] px-4 py-3 rounded-2xl text-sm leading-relaxed', roleStyles[message.role])}>
        <div className="space-y-2">
          {message.content.map((block, i) => (
            <ContentBlockView key={i} block={block} context={context} />
          ))}
        </div>
      </div>
    </div>
  )
}
