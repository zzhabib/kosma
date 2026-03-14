import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  disabled?: boolean
}

export function ChatInput({ disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleInput() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  return (
    <div className="p-4 border-t border-white/10">
      <div
        className={cn(
          'flex flex-col gap-3 p-3 rounded-xl',
          'bg-white/5 border border-white/12',
          'focus-within:border-white/25 transition-colors duration-200',
        )}
      >
        <textarea
          ref={textareaRef}
          rows={3}
          disabled={disabled}
          placeholder="Describe your world…"
          onInput={handleInput}
          onKeyDown={(e) => e.stopPropagation()}
          className={cn(
            'w-full bg-transparent text-sm text-white/85 placeholder:text-white/30',
            'resize-none outline-none leading-relaxed',
            'disabled:opacity-40',
          )}
        />
        <div className="flex justify-end">
          <button
            disabled={disabled}
            className={cn(
              'text-xs px-3 py-1.5 rounded-lg',
              'bg-white/10 border border-white/20 text-white/70',
              'hover:bg-white/15 hover:text-white/90',
              'transition-all duration-150',
              'disabled:opacity-30 disabled:cursor-not-allowed',
            )}
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  )
}
