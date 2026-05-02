import { z, toJSONSchema } from 'zod'
import type { Tool } from '@anthropic-ai/sdk/resources/messages'
import { query, hasComponent, addComponent, removeComponent, addEntity, removeEntity, observe, onRemove } from 'bitecs'
import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import type { Engine, System } from '@engine/engine'
import {
  registry, docRegistry,
  ThreeDesc, type ThreeSpec, Three3D,
  PhysicsDesc, type PhysicsSpec, RapierBody,
  ThreeCamera,
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

  constructor(private engine: Engine) {
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
          const eid = spawnEntity(this.engine.dataModel.world, { components })
          return { id: eid }
        },
      },
      {
        name: 'list_systems',
        description: 'Lists all registered systems with their id, priority, enabled state, and origin (packaged = built-in, agent = written by the agent).',
        input: z.object({}),
        run: () => this.engine.listSystems(),
      },
      {
        name: 'read_system',
        description: 'Returns the source code of a system by its id (e.g. "core/physics/physicsStep"). Use list_systems to discover ids.',
        input: z.object({ id: z.string() }),
        run: ({ id }) => {
          const source = this.engine.getSystemSource(id)
          return source !== undefined ? { id, source } : { error: `No source found for system "${id}"` }
        },
      },
      {
        name: 'write_system',
        description: `Creates or replaces an agent-written ECS system. Source must be a JS arrow function: (dataModel, dt) => { ... }. The following are available by name without any imports: query, hasComponent, addComponent, removeComponent, addEntity, removeEntity, observe, onRemove, Transform, RotatorSpeed, OrbitCamera, ThreeDesc, PhysicsDesc, Three3D, RapierBody, ThreeCamera, THREE, RAPIER. The system is run once against the live dataModel to validate before registering. Cannot overwrite packaged systems.`,
        input: z.object({
          id: z.string().describe('Unique system id, e.g. "bounce-off-floor". Used to read, edit, enable, or disable later.'),
          source: z.string().describe('JS arrow function: (dataModel, dt) => { ... }'),
          priority: z.number().optional().describe('Execution order — lower runs earlier. Default 0.'),
        }),
        run: ({ id, source, priority }) => this.writeSystem(id, source, priority),
      },
      {
        name: 'edit_system',
        description: 'Surgically edits an agent-written system by replacing an exact string. Use read_system first to get the current source. old_string must match exactly once in the source. The patched system is re-validated before going live. Cannot edit packaged systems.',
        input: z.object({
          id: z.string().describe('System id to edit'),
          old_string: z.string().describe('Exact string to find. Must match exactly once.'),
          new_string: z.string().describe('Replacement string.'),
        }),
        run: ({ id, old_string, new_string }) => this.editSystem(id, old_string, new_string),
      },
      {
        name: 'enable_system',
        description: 'Re-enables a previously disabled system so it runs each frame again.',
        input: z.object({ id: z.string() }),
        run: ({ id }) => { this.engine.enableSystem(id); return { id, enabled: true } },
      },
      {
        name: 'disable_system',
        description: 'Disables a system so it no longer runs each frame. Use to pause behavior without deleting it.',
        input: z.object({ id: z.string() }),
        run: ({ id }) => { this.engine.disableSystem(id); return { id, enabled: false } },
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
    const { world } = this.engine.dataModel

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
      .map(([name, comp]) => ({ name, count: query(this.engine.dataModel.world, [comp as any]).length }))
      .sort((a, b) => b.count - a.count)
  }

  private queryWorld(names: string[]) {
    const comps = names.map(n => this.resolveComp(n))
    const unknown = names.filter((_, i) => !comps[i])
    if (unknown.length) return { error: `Unknown components: ${unknown.join(', ')}` }
    return { entities: Array.from(query(this.engine.dataModel.world, comps as any[])) }
  }

  private readEntity(eid: number) {
    const components: Record<string, Record<string, unknown>> = {}
    for (const [compName, comp] of registry) {
      if (!hasComponent(this.engine.dataModel.world, eid, comp as any)) continue
      const entries: Record<string, number> = {}
      for (const key of Object.keys(comp)) {
        const arr = (comp as any)[key]
        if (Array.isArray(arr)) entries[key] = arr[eid] ?? 0
      }
      components[compName] = entries
    }
    if (hasComponent(this.engine.dataModel.world, eid, ThreeDesc as any)) components['ThreeDesc'] = ThreeDesc[eid] as any
    if (hasComponent(this.engine.dataModel.world, eid, PhysicsDesc as any)) components['PhysicsDesc'] = PhysicsDesc[eid] as any
    return { id: eid, components }
  }

  private buildCtx() {
    return {
      query, hasComponent, addComponent, removeComponent, addEntity, removeEntity, observe, onRemove,
      ...Object.fromEntries(registry),
      ThreeDesc, PhysicsDesc, Three3D, RapierBody, ThreeCamera,
      THREE, RAPIER,
    }
  }

  private compileSystem(source: string): System | string {
    try {
      const ctx = this.buildCtx()
      const keys = Object.keys(ctx).join(',')
      const factory = new Function('ctx', `const {${keys}} = ctx; return (${source})`)
      return factory(ctx) as System
    } catch (err: any) {
      return `Syntax error: ${err.message}`
    }
  }

  private writeSystem(id: string, source: string, priority = 0): unknown {
    const existing = this.engine.getSystem(id)
    if (existing?.origin === 'packaged') return { error: `Cannot overwrite packaged system "${id}"` }

    const fn = this.compileSystem(source)
    if (typeof fn === 'string') return { error: fn }

    try {
      fn(this.engine.dataModel, 0)
    } catch (err: any) {
      return { error: `Validation failed: ${err.message}` }
    }

    this.engine.addSystem(id, fn, priority, source)
    return { id, priority }
  }

  private editSystem(id: string, oldStr: string, newStr: string): unknown {
    const sys = this.engine.getSystem(id)
    if (!sys) return { error: `System "${id}" not found` }
    if (sys.origin === 'packaged') return { error: `Cannot edit packaged system "${id}"` }
    if (!sys.source) return { error: `System "${id}" has no editable source` }

    const count = sys.source.split(oldStr).length - 1
    if (count === 0) return { error: `old_string not found in "${id}"` }
    if (count > 1) return { error: `old_string matches ${count} times — make it more specific` }

    return this.writeSystem(id, sys.source.replace(oldStr, newStr), sys.priority)
  }
}
