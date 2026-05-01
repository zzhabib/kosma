import { z, toJSONSchema } from 'zod'
import type { Tool } from '@anthropic-ai/sdk/resources/messages'
import { query, hasComponent, addComponent, removeComponent, removeEntity } from 'bitecs'
import type { DataModel } from '@engine/engine'
import {
  registry, docRegistry,
  ThreeDesc, type ThreeSpec, Three3D,
  PhysicsDesc, type PhysicsSpec, RapierBody,
} from '@engine/components'
import { spawnEntity } from '@engine/entities'

type ToolShell<I extends z.ZodTypeAny = z.ZodTypeAny> = {
  name: string
  description: string
  input: I
  run: (input: z.infer<I>) => unknown
}

const componentEntry = z.object({
  name: z.string().describe('Component name, e.g. Transform, PhysicsDesc, ThreeDesc'),
  data: z.record(z.string(), z.unknown()).describe('Component field values. Numeric for SoA components; nested object for ThreeDesc/PhysicsDesc.'),
})

export class Toolbox {
  private shells: ToolShell<any>[]

  constructor(private dm: DataModel) {
    this.shells = [
      {
        name: 'describe_component',
        description: 'Returns the full documentation for a component by name.',
        input: z.object({ name: z.string().describe('Component name, e.g. ThreeDesc, PhysicsDesc') }),
        run: ({ name }) => docRegistry.get(name) ?? { error: `No documentation found for "${name}"` },
      },
      {
        name: 'list_components',
        description: 'Lists all registered components sorted by entity count descending.',
        input: z.object({}),
        run: () => this.listComponents(),
      },
      {
        name: 'query_world',
        description: 'Returns entity ids that have ALL of the given components.',
        input: z.object({
          components: z.array(z.string()).describe('Component names to filter by, e.g. ["Transform", "ThreeDesc"]'),
        }),
        run: ({ components }) => this.queryWorld(components),
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
        input: z.object({ components: z.array(componentEntry) }),
        run: ({ components }) => {
          const eid = spawnEntity(this.dm.world, { components })
          return { id: eid }
        },
      },
      {
        name: 'edit_entity',
        description: 'Edits an existing entity: set component data (upserts), remove components, or delete the entity entirely.',
        input: z.object({
          id: z.number().describe('Entity id to edit'),
          delete: z.boolean().optional().describe('If true, removes the entity from the world entirely'),
          remove: z.array(z.string()).optional().describe('Component names to remove from the entity'),
          set: z.array(componentEntry).optional().describe('Components to add or update on the entity'),
        }),
        run: (input) => this.editEntity(input),
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

  private editEntity({ id, delete: del, remove, set }: {
    id: number
    delete?: boolean
    remove?: string[]
    set?: Array<{ name: string; data: Record<string, unknown> }>
  }): unknown {
    const { world } = this.dm

    if (del) {
      if (hasComponent(world, id, Three3D as any)) removeComponent(world, id, Three3D as any)
      if (hasComponent(world, id, RapierBody as any)) removeComponent(world, id, RapierBody as any)
      removeEntity(world, id)
      return { deleted: id }
    }

    for (const name of (remove ?? [])) {
      if (name === 'ThreeDesc') {
        if (hasComponent(world, id, Three3D as any)) removeComponent(world, id, Three3D as any)
        removeComponent(world, id, ThreeDesc as any)
        continue
      }
      if (name === 'PhysicsDesc') {
        if (hasComponent(world, id, RapierBody as any)) removeComponent(world, id, RapierBody as any)
        removeComponent(world, id, PhysicsDesc as any)
        continue
      }
      const comp = registry.get(name)
      if (comp) removeComponent(world, id, comp as any)
    }

    for (const { name, data } of (set ?? [])) {
      if (name === 'ThreeDesc') {
        if (hasComponent(world, id, Three3D as any)) removeComponent(world, id, Three3D as any)
        addComponent(world, id, ThreeDesc)
        ThreeDesc[id] = data as ThreeSpec
      } else if (name === 'PhysicsDesc') {
        if (hasComponent(world, id, RapierBody as any)) removeComponent(world, id, RapierBody as any)
        addComponent(world, id, PhysicsDesc)
        PhysicsDesc[id] = data as PhysicsSpec
      } else {
        const comp = registry.get(name)
        if (!comp) continue
        if (!hasComponent(world, id, comp as any)) addComponent(world, id, comp as any)
        for (const k of Object.keys(data)) (comp as any)[k][id] = data[k] as number
      }
    }

    return { id }
  }

  private resolveComp(name: string): unknown {
    if (name === 'ThreeDesc')  return ThreeDesc
    if (name === 'PhysicsDesc') return PhysicsDesc
    if (name === 'Three3D')    return Three3D
    if (name === 'RapierBody') return RapierBody
    return registry.get(name) ?? null
  }

  private listComponents() {
    const all: Array<[string, unknown]> = [
      ...registry.entries(),
      ['ThreeDesc', ThreeDesc],
      ['PhysicsDesc', PhysicsDesc],
    ]
    return all
      .map(([name, comp]) => ({ name, count: query(this.dm.world, [comp as any]).length }))
      .sort((a, b) => b.count - a.count)
  }

  private queryWorld(names: string[]) {
    const comps = names.map(n => this.resolveComp(n))
    const unknown = names.filter((_, i) => !comps[i])
    if (unknown.length) return { error: `Unknown components: ${unknown.join(', ')}` }
    return { entities: Array.from(query(this.dm.world, comps as any[])) }
  }

  private readEntity(eid: number) {
    const components: Record<string, Record<string, unknown>> = {}
    for (const [compName, comp] of registry) {
      if (!hasComponent(this.dm.world, eid, comp as any)) continue
      const entries: Record<string, number> = {}
      for (const key of Object.keys(comp)) {
        const arr = (comp as any)[key]
        if (Array.isArray(arr)) entries[key] = arr[eid] ?? 0
      }
      components[compName] = entries
    }
    if (hasComponent(this.dm.world, eid, ThreeDesc as any)) components['ThreeDesc'] = ThreeDesc[eid] as any
    if (hasComponent(this.dm.world, eid, PhysicsDesc as any)) components['PhysicsDesc'] = PhysicsDesc[eid] as any
    return { id: eid, components }
  }
}
