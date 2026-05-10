import { query } from 'bitecs'
import type { DataModel } from '@engine/engine'
import { FPCamera, Transform } from '@engine/components'

export const priority = 70

export default function fpCameraSystem({ world }: DataModel): void {
  for (const eid of query(world, [FPCamera, Transform])) {
    // physicsSync (priority 40) has already written body.translation() into Transform.
    // Offset Y by eyeHeight so the camera sits at eye level, not capsule center.
    Transform.py[eid] += FPCamera.eyeHeight[eid]
    Transform.rx[eid] = FPCamera.pitch[eid]
    Transform.ry[eid] = FPCamera.yaw[eid]
    Transform.rz[eid] = 0
  }
}
