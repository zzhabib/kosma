import { query } from 'bitecs'
import type { DataModel } from '@engine/engine'
import { Transform, RotatorSpeed } from '@engine/components'

export const priority = 50

export default function rotatorSystem({ world }: DataModel, dt: number): void {
  for (const eid of query(world, [RotatorSpeed, Transform])) {
    Transform.rx[eid] += RotatorSpeed.x[eid] * dt
    Transform.ry[eid] += RotatorSpeed.y[eid] * dt
    Transform.rz[eid] += RotatorSpeed.z[eid] * dt
  }
}
