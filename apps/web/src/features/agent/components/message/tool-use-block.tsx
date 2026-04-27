import { cn } from '@/lib/utils'
import { type ToolUseBlock } from '../../types'

export function ToolUseBlockView({ block }: { block: ToolUseBlock }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3 my-2 space-y-2">
      <div className="text-xs font-mono text-white/70">
        <span className="text-orange-300">🔧</span> {block.name}
      </div>
      <pre
        className={cn(
          'text-xs bg-black/20 rounded p-2 overflow-x-auto',
          'text-white/60 font-mono',
          block.status === 'streaming' && 'opacity-70',
        )}
      >
        {JSON.stringify(block.input, null, 2)}
      </pre>
      {block.status === 'streaming' && <div className="text-[10px] text-white/40">pending...</div>}
    </div>
  )
}
