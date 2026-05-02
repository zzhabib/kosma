import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

export interface SidePanelSection {
  id: string
  content: ReactNode
}

export interface PanelConfig {
  title: string
  sections: SidePanelSection[]
  footer?: ReactNode
  dismissible?: boolean
}

interface SidePanelProps {
  open: boolean
  title: string
  onClose?: () => void
  sections: SidePanelSection[]
  dismissible?: boolean
  footer?: ReactNode
}

export function SidePanel({ open, title, onClose, sections, dismissible = true, footer }: SidePanelProps) {
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
      <div className="flex flex-col h-full pt-8 pr-8 pb-8 pl-20 gap-6">
        <div className="flex items-center justify-between pt-2">
          <h1 className="text-2xl font-semibold text-white tracking-tight">{title}</h1>
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

        <div className="space-y-8 flex-1 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.id}>{section.content}</div>
          ))}
        </div>

        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  )
}
