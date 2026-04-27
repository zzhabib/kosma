import { type ReactNode } from 'react'
import { type ContentBlock } from '../../types'
import { TextBlockView } from './text-block'
import { ThinkingBlockView } from './thinking-block'
import { ToolUseBlockView } from './tool-use-block'

export type BlockRendererContext = {
  thinkingVisible: boolean
}

type BlockRenderer = (block: ContentBlock, context: BlockRendererContext) => ReactNode

const blockRenderers: Record<ContentBlock['type'], BlockRenderer> = {
  text: (block) => {
    if (block.type !== 'text') return null
    return <TextBlockView block={block} />
  },
  thinking: (block, { thinkingVisible }) => {
    if (block.type !== 'thinking') return null
    return <ThinkingBlockView block={block} visible={thinkingVisible} />
  },
  tool_use: (block) => {
    if (block.type !== 'tool_use') return null
    return <ToolUseBlockView block={block} />
  },
}

export function ContentBlockView({
  block,
  context,
}: {
  block: ContentBlock
  context: BlockRendererContext
}) {
  const renderer = blockRenderers[block.type]
  return renderer ? renderer(block, context) : null
}
