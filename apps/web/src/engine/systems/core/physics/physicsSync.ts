import * as THREE from 'three'
import { query } from 'bitecs'
import type { DataModel } from '@engine/engine'
import { RapierBody, Transform } from '@engine/components'

export const priority = 40

const _quat = new THREE.Quaternion()
const _euler = new THREE.Euler()

export default function physicsSyncSystem({ world }: DataModel): void {
  for (const eid of query(world, [RapierBody])) {
    const body = RapierBody[eid]
    if (!body) continue

    const t = body.translation()
    Transform.px[eid] = t.x
    Transform.py[eid] = t.y
    Transform.pz[eid] = t.z

    const r = body.rotation()
    _quat.set(r.x, r.y, r.z, r.w)
    _euler.setFromQuaternion(_quat)
    Transform.rx[eid] = _euler.x
    Transform.ry[eid] = _euler.y
    Transform.rz[eid] = _euler.z
  }
}
