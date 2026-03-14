import { query } from 'bitecs'
import type { DataModel } from '@engine/engine'
import { ThreeMesh, Transform } from '@engine/components'

export const priority = 80

export default function renderSyncSystem({ world }: DataModel): void {
  for (const eid of query(world, [ThreeMesh, Transform])) {
    ThreeMesh[eid].position.set(Transform.px[eid], Transform.py[eid], Transform.pz[eid])
    ThreeMesh[eid].rotation.set(Transform.rx[eid], Transform.ry[eid], Transform.rz[eid])
    ThreeMesh[eid].scale.set(Transform.sx[eid], Transform.sy[eid], Transform.sz[eid])
  }
}
