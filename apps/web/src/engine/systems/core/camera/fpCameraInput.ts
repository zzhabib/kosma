import { query } from 'bitecs'
import type { DataModel } from '@engine/engine'
import { FPCamera, ThreeCamera } from '@engine/components'

export const priority = 60

const SENSITIVITY = 0.002
const PITCH_LIMIT = Math.PI / 2 - 0.01

export default function fpCameraInputSystem({ world, input }: DataModel): void {
  if (!input.pointerLocked || (input.dx === 0 && input.dy === 0)) return

  for (const eid of query(world, [FPCamera, ThreeCamera])) {
    FPCamera.yaw[eid] -= input.dx * SENSITIVITY
    FPCamera.pitch[eid] = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, FPCamera.pitch[eid] - input.dy * SENSITIVITY))
  }
}
