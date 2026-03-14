import { cn } from '@/lib/utils'

interface GlassPanelProps {
  className?: string
  children: React.ReactNode
}

export function GlassPanel({ className, children }: GlassPanelProps) {
  return (
    <div
      className={cn(
        'bg-white/5 backdrop-blur-3xl',
        'border border-white/12',
        'shadow-[0_24px_80px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]',
        className,
      )}
    >
      {children}
    </div>
  )
}
