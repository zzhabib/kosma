import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full bg-white/5 border border-white/12 rounded-lg px-4 py-2.5',
        'text-sm text-white/85 placeholder:text-white/30',
        'outline-none focus:border-white/25 transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
}
