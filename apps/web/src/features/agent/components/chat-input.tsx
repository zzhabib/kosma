import { useEffect, useRef, useCallback } from 'react'

interface ChatInputProps {
  onSubmit: (text: string) => void
  onClose: () => void
  isLoading: boolean
}

export function ChatInput({ onSubmit, onClose, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const submit = useCallback(() => {
    const text = textareaRef.current?.value.trim()
    if (text && !isLoading) {
      onSubmit(text)
      onClose()
    }
  }, [isLoading, onSubmit, onClose])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        submit()
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [submit, onClose],
  )

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }, [])

  return (
    <div className="absolute bottom-8 right-8 pointer-events-auto flex gap-2 items-end">
      <textarea
        ref={textareaRef}
        rows={1}
        disabled={isLoading}
        placeholder="type here…"
        spellCheck="false"
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        className="bg-transparent text-sm text-white/85 placeholder:text-white/30 outline-none resize-none max-w-80 leading-relaxed"
      />
      <button
        onClick={submit}
        disabled={isLoading}
        className="text-xs px-2 py-1 text-white/60 hover:text-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
        title="Send (Enter)"
      >
        →
      </button>
    </div>
  )
}
