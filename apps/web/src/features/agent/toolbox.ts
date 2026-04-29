import { z, toJSONSchema } from 'zod'
import type { Tool } from '@anthropic-ai/sdk/resources/messages'
import { query, hasComponent } from 'bitecs'
import type { DataModel } from '@engine/engine'
import { registry } from '@engine/components'
import { spawnEntity } from '@engine/entities'

type ToolShell<I extends z.ZodTypeAny = z.ZodTypeAny> = {
  name: string
  description: string
  input: I
  run: (input: z.infer<I>) => unknown
}

export class Toolbox {
  private shells: ToolShell<any>[]

  constructor(private dm: DataModel) {
    this.shells = [
      {
        name: 'query_world',
        description: 'Returns entity counts per component in the ECS world.',
        input: z.object({}),
        run: () => this.queryWorld(),
      },
      {
        name: 'read_entity',
        description: 'Returns all component data for an entity by its ECS id.',
        input: z.object({ id: z.number() }),
        run: ({ id }) => this.readEntity(id),
      },
      {
        name: 'spawn_entity',
        description: 'Spawns a new entity with the given components. Returns the new entity id.',
        input: z.object({
          components: z.array(z.object({
            name: z.string().describe('Component name, e.g. Transform, MeshDesc, RigidbodyDesc, ColliderDesc'),
            data: z.record(z.string(), z.number()).describe('Component field values keyed by field name'),
          })),
        }),
        run: ({ components }) => {
          const eid = spawnEntity(this.dm.world, { components })
          return { id: eid }
        },
      },
    ]
  }

  get tools() {
    return this.shells.map(({ name, description, input }) => ({
      name,
      description,
      input_schema: toJSONSchema(input) as Tool['input_schema'],
    }))
  }

  execute(name: string, rawInput: Record<string, unknown>): unknown {
    const shell = this.shells.find(s => s.name === name)
    if (!shell) throw new Error(`Unknown tool: ${name}`)
    const parsed = shell.input.safeParse(rawInput)
    if (!parsed.success) return { error: parsed.error.issues }
    return shell.run(parsed.data)
  }

  private queryWorld() {
    const componentCounts: Record<string, number> = {}
    for (const [compName, comp] of registry) {
      componentCounts[compName] = query(this.dm.world, [comp as any]).length
    }
    return { componentCounts }
  }

  private readEntity(eid: number) {
    const components: Record<string, Record<string, number>> = {}
    for (const [compName, comp] of registry) {
      if (!hasComponent(this.dm.world, eid, comp as any)) continue
      const entries: Record<string, number> = {}
      for (const key of Object.keys(comp)) {
        const arr = (comp as any)[key]
        if (Array.isArray(arr)) entries[key] = arr[eid] ?? 0
      }
      components[compName] = entries
    }
    return { id: eid, components }
  }
}
