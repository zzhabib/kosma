import { addEntity, addComponent, createWorld } from 'bitecs'
import { registry } from './components'

type EcsWorld = ReturnType<typeof createWorld>

export interface ComponentEntry {
  name: string
  data: Record<string, number>
}

export interface EntityDesc {
  components: ComponentEntry[]
}

export function spawnEntity(world: EcsWorld, desc: EntityDesc): number {
  const eid = addEntity(world)
  for (const { name, data } of desc.components) {
    const component = registry.get(name)
    if (!component) {
      console.warn(`spawnEntity: unknown component "${name}"`)
      continue
    }
    addComponent(world, eid, component)
    for (const k of Object.keys(data)) {
      component[k][eid] = data[k]
    }
  }
  return eid
}

const sampleEntities: EntityDesc[] = [
  // Camera
  {
    components: [
      { name: 'OrbitCamera', data: { theta: Math.PI / 4, phi: Math.PI / 3, radius: 8, targetX: 0, targetY: 0, targetZ: 0 } },
    ],
  },
  // Baseplate
  {
    components: [
      { name: 'Transform',     data: { px: 0, py: -1, pz: 0, rx: 0, ry: 0, rz: 0, sx: 20, sy: 0.5, sz: 20 } },
      { name: 'MeshDesc',      data: { geometry: 0, color: 0x888888 } },
      { name: 'RigidbodyDesc', data: { bodyType: 2, restitution: 0.3, friction: 0.8, gravityScale: 0 } },
      { name: 'ColliderDesc',  data: { shape: 0, halfExtentX: 10, halfExtentY: 0.25, halfExtentZ: 10 } },
    ],
  },
  // Box
  {
    components: [
      { name: 'Transform',     data: { px: 0, py: 2, pz: 0, rx: 0, ry: 0, rz: 0, sx: 1, sy: 1, sz: 1 } },
      { name: 'MeshDesc',      data: { geometry: 0, color: 0xe74c3c } },
      { name: 'RigidbodyDesc', data: { bodyType: 0, restitution: 0.3, friction: 0.8, gravityScale: 1 } },
      { name: 'ColliderDesc',  data: { shape: 0, halfExtentX: 0.5, halfExtentY: 0.5, halfExtentZ: 0.5 } },
    ],
  },
  // Box 2
  {
    components: [
      { name: 'Transform',     data: { px: 0.5, py: 4, pz: 0, rx: 0, ry: 0, rz: 0, sx: 1, sy: 1, sz: 1 } },
      { name: 'MeshDesc',      data: { geometry: 0, color: 0xe74c3c } },
      { name: 'RigidbodyDesc', data: { bodyType: 0, restitution: 0.3, friction: 0.8, gravityScale: 1 } },
      { name: 'ColliderDesc',  data: { shape: 0, halfExtentX: 0.5, halfExtentY: 0.5, halfExtentZ: 0.5 } },
    ],
  },
]

export function spawnSampleEntities(world: EcsWorld): void {
  for (const desc of sampleEntities) {
    spawnEntity(world, desc)
  }
}
