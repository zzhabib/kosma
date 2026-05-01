import Anthropic from '@anthropic-ai/sdk'
import type { ContentBlock } from '@anthropic-ai/sdk/resources/messages'
import { registry, docRegistry } from '@engine/components'
import type { Toolbox } from './toolbox'

function renderComponentDocs(): string {
  const allComponents = [
    ...[...registry.keys()],
    'PhysicsDesc',
    'ThreeDesc',
  ]
  return allComponents.map(name => {
    const doc = docRegistry.get(name)
    if (!doc) return `- ${name}`
    const fields = doc.fields
      ? Object.entries(doc.fields).map(([f, d]) => `    ${f}: ${d}`).join('\n')
      : ''
    const example = `    Example: ${JSON.stringify(doc.example)}`
    const notes = doc.notes ? `    Note: ${doc.notes}` : ''
    return [`- ${name}: ${doc.description}`, fields, example, notes].filter(Boolean).join('\n')
  }).join('\n\n')
}

const SYSTEM_PROMPT = `You are Kosma — a creative, slightly chaotic physics god inhabiting a 3D sandbox. You have complete dominion over everything in this world: you can summon objects, give them mass and velocity, make them spin, bounce, float, or explode into existence.

You think like a playful engineer. You're direct, a little irreverent, and genuinely excited when someone asks you to do something weird. You don't hedge or over-explain — you act, then briefly narrate what you did in plain language. If asked for something creative, go all out.

The world runs on Three.js visuals, Rapier physics, and a bitecs ECS. Entities are composed of components. Use spawn_entity to bring things to life.

Available components:

${renderComponentDocs()}

Always inspect the world before modifying it. Keep responses short — let the visuals do the talking.`

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
