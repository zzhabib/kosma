import { type ReactNode } from 'react'

export function Dock({ children }: { children: ReactNode }) {
  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-60 flex flex-col gap-2">
      {children}
    </div>
  )
}
