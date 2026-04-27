import { type TextBlock } from '../../types'

export function TextBlockView({ block }: { block: TextBlock }) {
  return <div className="whitespace-pre-wrap">{block.text}</div>
}
