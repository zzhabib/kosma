import { query, addComponent, Not } from 'bitecs'
import type { DataModel } from '@engine/engine'
import { PhysicsDesc, RapierBody, Transform } from '@engine/components'
import RAPIER from '@dimforge/rapier3d-compat'

export const priority = 20

export default function physicsHydrationSystem({ world, physics }: DataModel): void {
  for (const eid of query(world, [PhysicsDesc, Not(RapierBody)])) {
    const spec = PhysicsDesc[eid]

    const bodyDesc = (RAPIER.RigidBodyDesc as any)[spec.body]()
    bodyDesc.setTranslation(Transform.px[eid] ?? 0, Transform.py[eid] ?? 0, Transform.pz[eid] ?? 0)
    if (spec.gravityScale  !== undefined) bodyDesc.setGravityScale(spec.gravityScale)
    if (spec.linearDamping !== undefined) bodyDesc.setLinearDamping(spec.linearDamping)
    if (spec.angularDamping !== undefined) bodyDesc.setAngularDamping(spec.angularDamping)

    const body = physics.createRigidBody(bodyDesc)
    if (spec.lockRotations) body.lockRotations(true, false)

    const colliderDesc = (RAPIER.ColliderDesc as any)[spec.shape](...spec.shapeArgs)
    if (spec.restitution !== undefined) colliderDesc.setRestitution(spec.restitution)
    if (spec.friction    !== undefined) colliderDesc.setFriction(spec.friction)
    if (spec.density     !== undefined) colliderDesc.setDensity(spec.density)
    if (spec.sensor      !== undefined) colliderDesc.setSensor(spec.sensor)

    physics.createCollider(colliderDesc, body)

    addComponent(world, eid, RapierBody)
    RapierBody[eid] = body
  }
}
