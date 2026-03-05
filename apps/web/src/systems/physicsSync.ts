import * as THREE from 'three'
import { query } from 'bitecs'
import type { EcsWorld } from '../world'
import { RapierBody, Position, Rotation } from '../components'

const _quat = new THREE.Quaternion()
const _euler = new THREE.Euler()

export function physicsSyncSystem(world: EcsWorld): void {
  for (const eid of query(world, [RapierBody])) {
    const body = RapierBody[eid]
    if (!body) continue

    const t = body.translation()
    Position.x[eid] = t.x
    Position.y[eid] = t.y
    Position.z[eid] = t.z

    const r = body.rotation()
    _quat.set(r.x, r.y, r.z, r.w)
    _euler.setFromQuaternion(_quat)
    Rotation.x[eid] = _euler.x
    Rotation.y[eid] = _euler.y
    Rotation.z[eid] = _euler.z
  }
}
