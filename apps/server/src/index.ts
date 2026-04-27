import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

const app = new Hono()

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  }),
)

app.post('/chat/stream', async (c) => {
  const body = await c.req.json()

  const { apiKey, messages, thinking = false } = z
    .object({
      apiKey: z.string(),
      messages: z.any(),
      thinking: z.boolean().optional(),
    })
    .parse(body)

  const { readable, writable } = new TransformStream<Uint8Array>()
  const encoder = new TextEncoder()
  const writer = writable.getWriter()

  ;(async () => {
    try {
      const anthropic = new Anthropic({ apiKey })

      const stream = await anthropic.messages.stream({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: thinking ? 12000 : 4096,
        thinking: thinking ? { type: 'enabled', budget_tokens: 8000 } : undefined,
        messages: messages,
      })

      for await (const event of stream) {
        await writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }

      await writer.close()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ type: 'error', error: message })}\n\n`),
      )
      await writer.close()
    }
  })()

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
})

const port = 3000

serve({
  fetch: app.fetch,
  port,
})

console.log(`Server running at http://localhost:${port}`)
