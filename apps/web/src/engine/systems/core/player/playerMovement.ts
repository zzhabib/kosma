import { query } from 'bitecs'
import type { DataModel } from '@engine/engine'
import { FPCamera, RapierBody } from '@engine/components'

export const priority = 50

const SPEED = 5
const JUMP_VEL = 5
const GROUND_THRESHOLD = 0.1

export default function playerMovementSystem({ world, input }: DataModel): void {
  const { keys } = input

  for (const eid of query(world, [FPCamera, RapierBody])) {
    const body = RapierBody[eid]
    const yaw = FPCamera.yaw[eid]

    const fwd = (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0)
    const str = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0)

    // forward = (-sin(yaw), 0, -cos(yaw)), right = (cos(yaw), 0, -sin(yaw))
    const vx = (-Math.sin(yaw) * fwd + Math.cos(yaw) * str) * SPEED
    const vz = (-Math.cos(yaw) * fwd - Math.sin(yaw) * str) * SPEED

    const currentVY = body.linvel().y
    const onGround = currentVY > -GROUND_THRESHOLD && currentVY < GROUND_THRESHOLD
    const jumpVY = keys.has('Space') && onGround ? JUMP_VEL : currentVY

    body.setLinvel({ x: vx, y: jumpVY, z: vz }, true)
  }
}
