import { type ThinkingBlock } from '../../types'

export function ThinkingBlockView({
  block,
  visible,
}: {
  block: ThinkingBlock
  visible: boolean
}) {
  if (!visible) return null

  return (
    <details open={visible} className="group">
      <summary className="cursor-pointer select-none text-xs text-white/50 hover:text-white/70 mb-2 py-1">
        💭 Thinking...
      </summary>
      <div className="text-xs text-white/60 whitespace-pre-wrap pl-3 py-2 border-l border-white/10">
        {block.thinking}
      </div>
    </details>
  )
}
