import { type ReactNode } from 'react'
import { type AppContentBlock, type AppToolUseBlock } from '../../types'
import { TextBlockView } from './text-block'
import { ThinkingBlockView } from './thinking-block'
import { ToolUseBlockView } from './tool-use-block'

export type BlockRendererContext = {
  thinkingVisible: boolean
}

type BlockRenderer = (block: AppContentBlock, context: BlockRendererContext) => ReactNode

const blockRenderers: Partial<Record<AppContentBlock['type'], BlockRenderer>> = {
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
    return <ToolUseBlockView block={block as AppToolUseBlock} />
  },
}

export function ContentBlockView({
  block,
  context,
}: {
  block: AppContentBlock
  context: BlockRendererContext
}) {
  const renderer = blockRenderers[block.type]
  return renderer ? renderer(block, context) : null
}
