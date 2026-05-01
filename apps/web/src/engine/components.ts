import { aos } from 'bitecs'
import type * as THREE from 'three'
import type RAPIER from '@dimforge/rapier3d-compat'

export type SoAComponent = Record<string, unknown[]>

export const registry = new Map<string, SoAComponent>()

export type ComponentDoc = {
  description: string
  fields?: Record<string, string>
  example: Record<string, unknown>
  notes?: string
}

export const docRegistry = new Map<string, ComponentDoc>()

const register = <T extends SoAComponent>(name: string, component: T, doc?: ComponentDoc): T => {
  registry.set(name, component)
  if (doc) docRegistry.set(name, doc)
  return component
}

export type Slice<T extends Record<string, unknown[]>> = {
  [K in keyof T]: T[K] extends (infer U)[] ? U : never
}

export const Transform = register('Transform', {
  px: [] as number[], py: [] as number[], pz: [] as number[],
  rx: [] as number[], ry: [] as number[], rz: [] as number[],
  sx: [] as number[], sy: [] as number[], sz: [] as number[],
}, {
  description: 'World-space position, rotation, and scale of an entity.',
  fields: {
    px: 'X position', py: 'Y position', pz: 'Z position',
    rx: 'X rotation (radians)', ry: 'Y rotation (radians)', rz: 'Z rotation (radians)',
    sx: 'X scale', sy: 'Y scale', sz: 'Z scale',
  },
  example: { px: 0, py: 1, pz: 0, rx: 0, ry: 0, rz: 0, sx: 1, sy: 1, sz: 1 },
})

export const RotatorSpeed = register('RotatorSpeed', {
  x: [] as number[], y: [] as number[], z: [] as number[],
}, {
  description: 'Continuous rotation velocity applied each frame.',
  fields: { x: 'Radians/sec around X', y: 'Radians/sec around Y', z: 'Radians/sec around Z' },
  example: { x: 0, y: 1, z: 0 },
})

export const OrbitCamera = register('OrbitCamera', {
  theta:   [] as number[],
  phi:     [] as number[],
  radius:  [] as number[],
  targetX: [] as number[],
  targetY: [] as number[],
  targetZ: [] as number[],
}, {
  description: 'Spherical orbit camera. Controlled by mouse drag and scroll.',
  fields: {
    theta: 'Horizontal angle (radians)', phi: 'Vertical angle (radians)',
    radius: 'Distance from target',
    targetX: 'Look-at X', targetY: 'Look-at Y', targetZ: 'Look-at Z',
  },
  example: { theta: 0.785, phi: 1.047, radius: 8, targetX: 0, targetY: 0, targetZ: 0 },
})

// Physics descriptor — serializable AoS; physicsHydration creates Rapier bodies from this
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

// Three.js descriptor — serializable AoS; threeHydration creates runtime bindings from this
export type ThreeSpec = {
  type: string
  geometry?: { type: string; args?: unknown[] }
  material?: { type: string; params?: Record<string, unknown> }
  args?: unknown[]
}

export const ThreeDesc = aos<ThreeSpec>()

docRegistry.set('ThreeDesc', {
  description: "Three.js visual. type is the Three.js class name. Use geometry+material for Mesh; use args for lights and other objects.",
  fields: {
    type: "Three.js class: 'Mesh', 'PointLight', 'DirectionalLight', 'SpotLight', 'Group', etc.",
    'geometry.type': "Geometry class: 'BoxGeometry', 'SphereGeometry', 'CylinderGeometry', 'ConeGeometry', 'TorusGeometry', 'TorusKnotGeometry', 'PlaneGeometry', etc.",
    'geometry.args': 'Positional constructor args for the geometry class',
    'material.type': "Material class: 'MeshStandardMaterial', 'MeshPhongMaterial', 'MeshBasicMaterial', etc.",
    'material.params': "Material constructor object, e.g. { color: 0xff0000, metalness: 0.5, roughness: 0.3 }",
    args: 'Positional constructor args for non-Mesh types (lights, etc.)',
  },
  example: { type: 'Mesh', geometry: { type: 'BoxGeometry', args: [1, 1, 1] }, material: { type: 'MeshStandardMaterial', params: { color: 0xe74c3c } } },
  notes: 'Light examples: PointLight { type: "PointLight", args: [0xffffff, 1.0, 100] } | DirectionalLight { type: "DirectionalLight", args: [0xffffff, 1.5] }',
})

// AoS Three.js runtime bindings — ephemeral, reconstructed from ThreeDesc on load
export const Three3D     = aos<THREE.Object3D>()
export const ThreeCamera = aos<THREE.PerspectiveCamera>()

// Dynamic type-specific bindings keyed by Three.js class name — enables type queries
export const threeBindings = new Map<string, ReturnType<typeof aos>>()

export function getThreeBinding(typeName: string): ReturnType<typeof aos> {
  let binding = threeBindings.get(typeName)
  if (!binding) {
    binding = aos()
    threeBindings.set(typeName, binding)
  }
  return binding
}

// AoS Rapier binding component — ephemeral, not registered, not serialized
export const RapierBody = aos<RAPIER.RigidBody>()
