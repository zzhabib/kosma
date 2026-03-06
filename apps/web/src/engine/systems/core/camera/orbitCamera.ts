import { query } from 'bitecs'
import type { DataModel } from '@engine/engine'
import { OrbitCamera, ThreeCamera } from '@engine/components'

export const priority = 70

export default function orbitCameraSystem({ world }: DataModel): void {
  for (const eid of query(world, [OrbitCamera, ThreeCamera])) {
    const theta = OrbitCamera.theta[eid]
    const phi = OrbitCamera.phi[eid]
    const r = OrbitCamera.radius[eid]
    const tx = OrbitCamera.targetX[eid]
    const ty = OrbitCamera.targetY[eid]
    const tz = OrbitCamera.targetZ[eid]

    ThreeCamera[eid].position.set(
      tx + r * Math.sin(phi) * Math.sin(theta),
      ty + r * Math.cos(phi),
      tz + r * Math.sin(phi) * Math.cos(theta),
    )
    ThreeCamera[eid].lookAt(tx, ty, tz)
  }
}
