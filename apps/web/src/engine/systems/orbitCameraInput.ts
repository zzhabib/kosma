import { query } from 'bitecs'
import type { DataModel } from '../engine'
import { OrbitCamera, ThreeCamera } from '../components'

export const priority = 60

export default function orbitCameraInputSystem({ world, input }: DataModel): void {
  const { dx, dy, buttons, wheelDelta: wheel } = input

  for (const eid of query(world, [OrbitCamera, ThreeCamera])) {
    if (buttons === 2 && (dx !== 0 || dy !== 0)) {
      // Right drag: orbit
      OrbitCamera.theta[eid] -= dx * 0.005
      OrbitCamera.phi[eid] = Math.max(0.05, Math.min(Math.PI - 0.05, OrbitCamera.phi[eid] + dy * 0.005))
    } else if (buttons === 4 && (dx !== 0 || dy !== 0)) {
      // Middle drag: pan — use previous frame's camera matrix
      const scale = OrbitCamera.radius[eid] * 0.0015
      const m = ThreeCamera[eid].matrixWorld.elements
      const rx = m[0]; const ry = m[1]; const rz = m[2]
      const ux = m[4]; const uy = m[5]; const uz = m[6]
      OrbitCamera.targetX[eid] -= (dx * rx - dy * ux) * scale
      OrbitCamera.targetY[eid] -= (dx * ry - dy * uy) * scale
      OrbitCamera.targetZ[eid] -= (dx * rz - dy * uz) * scale
    }
    if (wheel !== 0) {
      OrbitCamera.radius[eid] = Math.max(2, Math.min(30, OrbitCamera.radius[eid] + wheel * 0.01))
    }
  }
}
