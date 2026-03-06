import { query } from 'bitecs'
import type { DataModel } from '../engine'
import { Rotation, RotatorSpeed } from '../components'

export const priority = 50

export default function rotatorSystem({ world }: DataModel, dt: number): void {
  for (const eid of query(world, [RotatorSpeed, Rotation])) {
    Rotation.x[eid] += RotatorSpeed.x[eid] * dt
    Rotation.y[eid] += RotatorSpeed.y[eid] * dt
    Rotation.z[eid] += RotatorSpeed.z[eid] * dt
  }
}
