import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

interface DockButtonProps {
  icon: ReactNode
  label: string
  onClick: () => void
  title?: string
  active?: boolean
}

export function DockButton({ icon, label, onClick, title, active }: DockButtonProps) {
  return (
    <div className="group relative flex items-center">
      <button
        onClick={onClick}
        title={title ?? label}
        className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center',
          'bg-black/60 backdrop-blur-xl',
          'border border-white/15',
          'text-white/50',
          'hover:bg-black/75 hover:text-white/80 hover:border-white/25',
          'transition-all duration-150',
          active && 'bg-white/8 text-white/80 border-white/25',
        )}
      >
        {icon}
      </button>
      <span
        className={cn(
          'absolute left-full ml-3 whitespace-nowrap pointer-events-none',
          'text-xs text-white/50 tracking-wide',
          'opacity-0 translate-x-1',
          'group-hover:opacity-100 group-hover:translate-x-0',
          'transition-all duration-150',
        )}
      >
        {label}
      </span>
    </div>
  )
}
