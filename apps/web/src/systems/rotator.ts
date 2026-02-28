import { query } from 'bitecs'
import type { EcsWorld } from '../world'
import { Rotation, RotatorSpeed } from '../components'

export function rotatorSystem(world: EcsWorld, dt: number): void {
  for (const eid of query(world, [RotatorSpeed, Rotation])) {
    Rotation.x[eid] += RotatorSpeed.x[eid] * dt
    Rotation.y[eid] += RotatorSpeed.y[eid] * dt
    Rotation.z[eid] += RotatorSpeed.z[eid] * dt
  }
}
