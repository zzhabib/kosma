import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

interface TypographyProps {
  children: ReactNode
  className?: string
}

export function Heading({ children, className }: TypographyProps) {
  return (
    <h1 className={cn('text-2xl font-semibold text-white tracking-tight', className)}>
      {children}
    </h1>
  )
}

export function Subheading({ children, className }: TypographyProps) {
  return (
    <h2 className={cn('text-lg font-semibold text-white/85', className)}>
      {children}
    </h2>
  )
}

export function Text({ children, className }: TypographyProps) {
  return (
    <p className={cn('text-sm text-white/70', className)}>
      {children}
    </p>
  )
}

export function TextSmall({ children, className }: TypographyProps) {
  return (
    <p className={cn('text-xs text-white/50', className)}>
      {children}
    </p>
  )
}

export function TextMuted({ children, className }: TypographyProps) {
  return (
    <p className={cn('text-xs text-white/40', className)}>
      {children}
    </p>
  )
}
