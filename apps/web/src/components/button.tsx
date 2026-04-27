import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-white/10 border border-white/20 text-white/85 hover:bg-white/15 hover:border-white/30',
  secondary: 'bg-white/5 border border-white/12 text-white/60 hover:bg-white/10 hover:border-white/20',
  danger: 'bg-red-500/10 border border-red-500/20 text-red-400/70 hover:bg-red-500/15 hover:border-red-500/30',
  ghost: 'text-white/60 hover:text-white/85',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-base px-5 py-3',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'rounded-lg transition-all duration-150 font-medium outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  )
}
