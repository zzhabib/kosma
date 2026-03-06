import { query } from 'bitecs'
import type { DataModel } from '@engine/engine'
import { ThreeMesh, Position, Rotation, Scale } from '@engine/components'

export const priority = 80

export default function renderSyncSystem({ world }: DataModel): void {
  for (const eid of query(world, [ThreeMesh, Position, Rotation, Scale])) {
    ThreeMesh[eid].position.set(Position.x[eid], Position.y[eid], Position.z[eid])
    ThreeMesh[eid].rotation.set(Rotation.x[eid], Rotation.y[eid], Rotation.z[eid])
    ThreeMesh[eid].scale.set(Scale.x[eid], Scale.y[eid], Scale.z[eid])
  }
}
