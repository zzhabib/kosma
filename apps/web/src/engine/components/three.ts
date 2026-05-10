import { aos } from 'bitecs'
import type * as THREE from 'three'
import type RAPIER from '@dimforge/rapier3d-compat'
import { docRegistry } from './registry'

export type ThreeSpec = {
  type: string
  geometry?: { type: string; args?: unknown[] }
  material?: { type: string; params?: Record<string, unknown> }
  args?: unknown[]
  rotationOrder?: string
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

// Ephemeral runtime bindings — not registered, not serialized
export const Three3D = aos<THREE.Object3D>()
export const RapierBody = aos<RAPIER.RigidBody>()

export const threeBindings = new Map<string, ReturnType<typeof aos>>()

export function getThreeBinding(typeName: string): ReturnType<typeof aos> {
  let binding = threeBindings.get(typeName)
  if (!binding) {
    binding = aos()
    threeBindings.set(typeName, binding)
  }
  return binding
}

// ThreeCamera is the PerspectiveCamera type-binding from threeBindings.
// threeHydration populates it automatically when it instantiates a PerspectiveCamera via ThreeDesc.
export const ThreeCamera = getThreeBinding('PerspectiveCamera') as ReturnType<typeof aos> & Record<number, THREE.PerspectiveCamera>
