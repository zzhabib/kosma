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
      { name: 'Position',      data: { x: 0,  y: -1,   z: 0  } },
      { name: 'Rotation',      data: { x: 0,  y: 0,    z: 0  } },
      { name: 'Scale',         data: { x: 20, y: 0.5,  z: 20 } },
      { name: 'MeshDesc',      data: { geometry: 0, color: 0x888888 } },
      { name: 'RigidbodyDesc', data: { bodyType: 2, restitution: 0.3, friction: 0.8, gravityScale: 0 } },
      { name: 'ColliderDesc',  data: { shape: 0, halfExtentX: 10, halfExtentY: 0.25, halfExtentZ: 10 } },
    ],
  },
  // Box
  {
    components: [
      { name: 'Position',      data: { x: 0, y: 2, z: 0 } },
      { name: 'Rotation',      data: { x: 0, y: 0, z: 0 } },
      { name: 'Scale',         data: { x: 1, y: 1, z: 1 } },
      { name: 'MeshDesc',      data: { geometry: 0, color: 0xe74c3c } },
      { name: 'RigidbodyDesc', data: { bodyType: 0, restitution: 0.3, friction: 0.8, gravityScale: 1 } },
      { name: 'ColliderDesc',  data: { shape: 0, halfExtentX: 0.5, halfExtentY: 0.5, halfExtentZ: 0.5 } },
    ],
  },

  {
    components: [
      { name: 'Position', data: { x: 0.5, y: 4, z: 0 } },
      { name: 'Rotation', data: { x: 0, y: 0, z: 0 } },
      { name: 'Scale', data: { x: 1, y: 1, z: 1 } },
      { name: 'MeshDesc', data: { geometry: 0, color: 0xe74c3c } },
      { name: 'RigidbodyDesc', data: { bodyType: 0, restitution: 0.3, friction: 0.8, gravityScale: 1 } },
      { name: 'ColliderDesc', data: { shape: 0, halfExtentX: 0.5, halfExtentY: 0.5, halfExtentZ: 0.5 } },
    ],
  },
]

export function spawnSampleEntities(world: EcsWorld): void {
  for (const desc of sampleEntities) {
    spawnEntity(world, desc)
  }
}
