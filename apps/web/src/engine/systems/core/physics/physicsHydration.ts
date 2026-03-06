import { query, addComponent, Not } from 'bitecs'
import type { DataModel } from '@engine/engine'
import { RigidbodyDesc, ColliderDesc, RapierBody, Position } from '@engine/components'
import RAPIER from '@dimforge/rapier3d-compat'

export const priority = 20

const BODY_TYPES = [
  RAPIER.RigidBodyType.Dynamic,
  RAPIER.RigidBodyType.KinematicPositionBased,
  RAPIER.RigidBodyType.Fixed,
] as const

export default function physicsHydrationSystem({ world, physics: physicsWorld }: DataModel): void {

  for (const eid of query(world, [RigidbodyDesc, ColliderDesc, Not(RapierBody)])) {
    const bodyType = BODY_TYPES[RigidbodyDesc.bodyType[eid]] ?? RAPIER.RigidBodyType.Dynamic
    const bodyDesc = new RAPIER.RigidBodyDesc(bodyType)
      .setTranslation(Position.x[eid] ?? 0, Position.y[eid] ?? 0, Position.z[eid] ?? 0)
      .setGravityScale(RigidbodyDesc.gravityScale[eid] ?? 1)

    const body = physicsWorld.createRigidBody(bodyDesc)

    const shape = ColliderDesc.shape[eid]
    let colliderDesc: RAPIER.ColliderDesc
    if (shape === 1) {
      colliderDesc = RAPIER.ColliderDesc.ball(ColliderDesc.radius[eid] ?? 0.5)
    } else if (shape === 2) {
      colliderDesc = RAPIER.ColliderDesc.capsule(
        ColliderDesc.halfHeight[eid] ?? 0.5,
        ColliderDesc.radius[eid] ?? 0.5,
      )
    } else {
      // default: cuboid
      colliderDesc = RAPIER.ColliderDesc.cuboid(
        ColliderDesc.halfExtentX[eid] ?? 0.5,
        ColliderDesc.halfExtentY[eid] ?? 0.5,
        ColliderDesc.halfExtentZ[eid] ?? 0.5,
      )
    }

    colliderDesc
      .setRestitution(RigidbodyDesc.restitution[eid] ?? 0)
      .setFriction(RigidbodyDesc.friction[eid] ?? 0.5)

    physicsWorld.createCollider(colliderDesc, body)

    addComponent(world, eid, RapierBody)
    RapierBody[eid] = body
  }
}
