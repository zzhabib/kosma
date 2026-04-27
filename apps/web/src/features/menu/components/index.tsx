import { cn } from '@/lib/utils'
import { Button } from '@/components/button'
import { type ReactNode } from 'react'

export interface MenuSection {
  id: string
  content: ReactNode
}

interface MenuProps {
  open: boolean
  onClose?: () => void
  sections: MenuSection[]
  dismissible?: boolean
}

export function Menu({ open, onClose, sections, dismissible = true }: MenuProps) {
  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-50 h-screen w-96',
        'bg-linear-to-r from-black/40 via-black/20 to-transparent backdrop-blur-xl',
        'border-r border-white/10',
        'transition-transform duration-300 ease-out',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="flex flex-col h-full p-8 gap-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <h1 className="text-2xl font-semibold text-white tracking-tight">Kosma</h1>
          {dismissible && onClose && (
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white/80 transition-colors text-xl leading-none"
              title="Close (Esc)"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-8 flex-1 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.id}>{section.content}</div>
          ))}
        </div>

        {/* Footer */}
        {onClose && (
          <Button onClick={onClose} className="w-full mt-6">
            Continue
          </Button>
        )}
      </div>
    </div>
  )
}
