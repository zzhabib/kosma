import { cn } from '@/lib/utils'

interface ChatToggleProps {
  onToggle: () => void
}

export function ChatToggle({ onToggle }: ChatToggleProps) {
  return (
    <button
      onClick={onToggle}
      title="Open chat (T)"
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'h-9 px-4 rounded-full',
        'flex items-center gap-2',
        'bg-black/60 backdrop-blur-xl',
        'border border-white/20',
        'text-xs text-white/60',
        'hover:bg-black/75 hover:text-white/85 hover:border-white/30',
        'transition-all duration-150',
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
      <span className="tracking-wide">Chat</span>
    </button>
  )
}
