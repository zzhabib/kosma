import Anthropic from '@anthropic-ai/sdk'
import type { ContentBlock } from '@anthropic-ai/sdk/resources/messages'
import { registry } from '@engine/components'
import type { Toolbox } from './toolbox'

const SYSTEM_PROMPT = `You are an AI assistant controlling a live 3D physics playground built with Three.js, Rapier physics, and a bitecs ECS.

The world contains entities made of components. Components are pure numeric data (SoA arrays indexed by entity id).

Available components:
${[...registry.entries()].map(([name, comp]) => `- ${name}: { ${Object.keys(comp).join(', ')} }`).join('\n')}

Use your tools to inspect the world before answering questions about it. Be concise.`

export type AgentEvent =
  | { type: 'user_message'; id: string; text: string }
  | { type: 'assistant_start'; id: string }
  | { type: 'text_delta'; text: string }
  | { type: 'assistant_done'; content: ContentBlock[] }
  | { type: 'tool_call'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; toolUseId: string; result: unknown }
  | { type: 'error'; message: string }

export class Agent {
  private history: Anthropic.MessageParam[] = []
  private client: Anthropic

  constructor(apiKey: string, private toolbox: Toolbox | null = null) {
    this.client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  }

  async *send(text: string): AsyncGenerator<AgentEvent> {
    this.history.push({ role: 'user', content: text })
    yield { type: 'user_message', id: `user-${Date.now()}`, text }

    try {
      while (true) {
        yield { type: 'assistant_start', id: `assistant-${Date.now()}` }

        const stream = this.client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          tools: this.toolbox?.tools ?? [],
          messages: this.history,
        })

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            yield { type: 'text_delta', text: event.delta.text }
          }
        }

        const response = await stream.finalMessage()
        this.history.push({ role: 'assistant', content: response.content as Anthropic.MessageParam['content'] })
        yield { type: 'assistant_done', content: response.content as ContentBlock[] }

        if (response.stop_reason !== 'tool_use' || !this.toolbox) break

        const toolResults: Anthropic.ToolResultBlockParam[] = []
        for (const block of response.content) {
          if (block.type !== 'tool_use') continue
          const input = block.input as Record<string, unknown>
          yield { type: 'tool_call', id: block.id, name: block.name, input }
          let result: unknown
          try {
            result = this.toolbox.execute(block.name, input)
          } catch (e) {
            result = { error: e instanceof Error ? e.message : String(e) }
          }
          yield { type: 'tool_result', toolUseId: block.id, result }
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(result) })
        }
        this.history.push({ role: 'user', content: toolResults })
      }
    } catch (error) {
      yield { type: 'error', message: error instanceof Error ? error.message : String(error) }
    }
  }

  clear() {
    this.history = []
  }
}
