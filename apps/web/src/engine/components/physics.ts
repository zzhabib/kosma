import { aos } from 'bitecs'
import { docRegistry } from './registry'

export type PhysicsSpec = {
  body: 'dynamic' | 'fixed' | 'kinematicPosition' | 'kinematicVelocity'
  shape: string
  shapeArgs: unknown[]
  gravityScale?: number
  restitution?: number
  friction?: number
  density?: number
  linearDamping?: number
  angularDamping?: number
  sensor?: boolean
  lockRotations?: boolean
}

export const PhysicsDesc = aos<PhysicsSpec>()

docRegistry.set('PhysicsDesc', {
  description: 'Rapier physics body + collider. body selects the rigid body type; shape + shapeArgs define the collision geometry.',
  fields: {
    body: "'dynamic' (moves freely), 'fixed' (immovable), 'kinematicPosition', 'kinematicVelocity'",
    shape: "Rapier collider factory: 'cuboid', 'ball', 'capsule', 'cone', 'cylinder', 'roundCuboid'",
    shapeArgs: "Positional args — cuboid: [hx, hy, hz] | ball: [radius] | capsule/cone/cylinder: [halfHeight, radius]",
    gravityScale: '1 = normal gravity, 0 = weightless, negative = floats upward',
    restitution: 'Bounciness 0-1',
    friction: 'Surface friction 0-1',
    density: 'Mass per unit volume (alternative to explicit mass)',
    linearDamping: 'Drag on linear velocity (0 = none)',
    angularDamping: 'Drag on rotation (0 = none)',
    sensor: 'true = ghost collider (detects overlap, no physical response)',
  },
  example: { body: 'dynamic', shape: 'cuboid', shapeArgs: [0.5, 0.5, 0.5], restitution: 0.4, friction: 0.8, gravityScale: 1 },
  notes: 'Ball: { shape: "ball", shapeArgs: [0.5] } | Capsule: { shape: "capsule", shapeArgs: [0.75, 0.3] } | Cone: { shape: "cone", shapeArgs: [1, 0.5] }',
})
