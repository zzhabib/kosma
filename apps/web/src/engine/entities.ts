import { addEntity, addComponent, createWorld } from 'bitecs'
import { registry, ThreeSpec, ThreeDesc, PhysicsSpec, PhysicsDesc, FPCamera } from './components'

type EcsWorld = ReturnType<typeof createWorld>

export interface ComponentEntry {
  name: string
  data: Record<string, unknown>
}

export interface EntityDesc {
  components: ComponentEntry[]
}

export function spawnEntity(world: EcsWorld, desc: EntityDesc): number {
  const eid = addEntity(world)
  for (const { name, data } of desc.components) {
    if (name === 'ThreeDesc') {
      addComponent(world, eid, ThreeDesc)
      ThreeDesc[eid] = data as ThreeSpec
      continue
    }
    if (name === 'PhysicsDesc') {
      addComponent(world, eid, PhysicsDesc)
      PhysicsDesc[eid] = data as PhysicsSpec
      continue
    }
    if (name === 'FPCamera') {
      addComponent(world, eid, FPCamera)
      FPCamera.pitch[eid]     = (data as any).pitch ?? 0
      FPCamera.yaw[eid]       = (data as any).yaw ?? 0
      FPCamera.eyeHeight[eid] = (data as any).eyeHeight ?? 0.8
      continue
    }
    const component = registry.get(name)
    if (!component) {
      console.warn(`spawnEntity: unknown component "${name}"`)
      continue
    }
    addComponent(world, eid, component)
    for (const k of Object.keys(data)) {
      component[k][eid] = data[k] as number
    }
  }
  return eid
}

const sampleEntities: EntityDesc[] = [
  // Player
  {
    components: [
      { name: 'Transform',   data: { px: 0, py: 3, pz: 8, rx: 0, ry: 0, rz: 0, sx: 1, sy: 1, sz: 1 } },
      { name: 'FPCamera',    data: { pitch: 0, yaw: Math.PI, eyeHeight: 0.8 } },
      { name: 'PhysicsDesc', data: { body: 'dynamic', shape: 'capsule', shapeArgs: [0.6, 0.3], gravityScale: 1, linearDamping: 0, angularDamping: 0, lockRotations: true } },
      { name: 'ThreeDesc',   data: { type: 'PerspectiveCamera', args: [90, window.innerWidth / window.innerHeight, 0.1, 2000], rotationOrder: 'YXZ' } },
    ],
  },
  // Baseplate
  {
    components: [
      { name: 'Transform',   data: { px: 0, py: -1, pz: 0, rx: 0, ry: 0, rz: 0, sx: 20, sy: 0.5, sz: 20 } },
      { name: 'PhysicsDesc', data: { body: 'fixed', shape: 'cuboid', shapeArgs: [10, 0.25, 10], restitution: 0.3, friction: 0.8 } },
      { name: 'ThreeDesc',   data: { type: 'Mesh', geometry: { type: 'BoxGeometry', args: [1, 1, 1] }, material: { type: 'MeshStandardMaterial', params: { color: 0x888888 } } } },
    ],
  },
  // Box
  {
    components: [
      { name: 'Transform',   data: { px: 0, py: 2, pz: 0, rx: 0, ry: 0, rz: 0, sx: 1, sy: 1, sz: 1 } },
      { name: 'PhysicsDesc', data: { body: 'dynamic', shape: 'cuboid', shapeArgs: [0.5, 0.5, 0.5], restitution: 0.3, friction: 0.8, gravityScale: 1 } },
      { name: 'ThreeDesc',   data: { type: 'Mesh', geometry: { type: 'BoxGeometry', args: [1, 1, 1] }, material: { type: 'MeshStandardMaterial', params: { color: 0xe74c3c } } } },
    ],
  },
  // Box 2
  {
    components: [
      { name: 'Transform',   data: { px: 0.5, py: 4, pz: 0, rx: 0, ry: 0, rz: 0, sx: 1, sy: 1, sz: 1 } },
      { name: 'PhysicsDesc', data: { body: 'dynamic', shape: 'cuboid', shapeArgs: [0.5, 0.5, 0.5], restitution: 0.3, friction: 0.8, gravityScale: 1 } },
      { name: 'ThreeDesc',   data: { type: 'Mesh', geometry: { type: 'BoxGeometry', args: [1, 1, 1] }, material: { type: 'MeshStandardMaterial', params: { color: 0xe74c3c } } } },
    ],
  },
]

export function spawnSampleEntities(world: EcsWorld): void {
  for (const desc of sampleEntities) {
    spawnEntity(world, desc)
  }
}
