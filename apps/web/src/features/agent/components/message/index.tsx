import { cn } from '@/lib/utils'
import { type ChatMessage } from '../../types'
import { ContentBlockView, type BlockRendererContext } from './block-router'

const roleLabel: Record<ChatMessage['role'], string> = {
  user: 'You',
  assistant: 'Kosma',
}

export function ChatMessage({
  message,
  thinkingVisible,
  showLabel,
}: {
  message: ChatMessage
  thinkingVisible: boolean
  showLabel: boolean
}) {
  const isUser = message.role === 'user'
  const context: BlockRendererContext = { thinkingVisible }

  return (
    <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
      {showLabel && (
        <span className="text-[10px] text-white/40 tracking-widest uppercase px-1">
          {roleLabel[message.role]}
        </span>
      )}
      <div className={cn('text-sm leading-relaxed', isUser ? 'max-w-[88%] text-white/95' : 'w-full text-white/85')}>
        <div className="space-y-2">
          {message.content.map((block, i) => (
            <ContentBlockView key={i} block={block} context={context} />
          ))}
        </div>
      </div>
    </div>
  )
}
