import { addEntity, addComponent } from 'bitecs'
import * as THREE from 'three'
import { registry, OrbitCamera, PointerInput, ThreeCamera } from './components'
import type { EcsWorld } from './world'

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

export function spawnCamera(world: EcsWorld): void {
  const eid = addEntity(world)

  addComponent(world, eid, OrbitCamera)
  OrbitCamera.theta[eid]   = Math.PI / 4
  OrbitCamera.phi[eid]     = Math.PI / 3
  OrbitCamera.radius[eid]  = 8
  OrbitCamera.targetX[eid] = 0
  OrbitCamera.targetY[eid] = 0
  OrbitCamera.targetZ[eid] = 0

  const cam = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
  addComponent(world, eid, ThreeCamera)
  ThreeCamera[eid] = cam
}

export function spawnPointerInput(world: EcsWorld): number {
  const eid = addEntity(world)
  addComponent(world, eid, PointerInput)
  PointerInput.dx[eid]         = 0
  PointerInput.dy[eid]         = 0
  PointerInput.buttons[eid]    = 0
  PointerInput.wheelDelta[eid] = 0
  return eid
}
