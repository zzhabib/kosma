import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white/5 border border-white/10 rounded-lg p-3',
        'space-y-2',
        className,
      )}
    >
      {children}
    </div>
  )
}
