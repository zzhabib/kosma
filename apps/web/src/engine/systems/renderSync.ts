import { query } from 'bitecs'
import type { DataModel } from '@engine/engine'
import { Three3D, Transform } from '@engine/components'

export const priority = 80

export default function renderSyncSystem({ world }: DataModel): void {
  for (const eid of query(world, [Three3D, Transform])) {
    Three3D[eid].position.set(Transform.px[eid], Transform.py[eid], Transform.pz[eid])
    Three3D[eid].rotation.set(Transform.rx[eid], Transform.ry[eid], Transform.rz[eid])
    Three3D[eid].scale.set(Transform.sx[eid], Transform.sy[eid], Transform.sz[eid])
  }
}
