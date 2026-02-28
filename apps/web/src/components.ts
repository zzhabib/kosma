import { aos } from 'bitecs'
import type * as THREE from 'three'

export type SoAComponent = Record<string, unknown[]>

export const registry = new Map<string, SoAComponent>()

const register = <T extends SoAComponent>(name: string, component: T): T => {
  registry.set(name, component)
  return component
}

export type Slice<T extends Record<string, unknown[]>> = {
  [K in keyof T]: T[K] extends (infer U)[] ? U : never
}

// SoA data components — pure numeric state, serializable, can come from WorldSpec
export const Position     = register('Position', { x: [] as number[], y: [] as number[], z: [] as number[] })
export const Rotation     = register('Rotation', { x: [] as number[], y: [] as number[], z: [] as number[] })
export const Scale        = register('Scale', { x: [] as number[], y: [] as number[], z: [] as number[] })
export const RotatorSpeed = register('RotatorSpeed', { x: [] as number[], y: [] as number[], z: [] as number[] })

export const OrbitCamera = register('OrbitCamera', {
  theta:   [] as number[],
  phi:     [] as number[],
  radius:  [] as number[],
  targetX: [] as number[],
  targetY: [] as number[],
  targetZ: [] as number[],
})

// Singleton — one entity per world, written by the DOM bridge each frame
export const PointerInput = register('PointerInput', {
  dx:         [] as number[],
  dy:         [] as number[],
  buttons:    [] as number[],
  wheelDelta: [] as number[],
})

// Descriptor components — serializable SoA; hydration system creates runtime bindings from these
export const MeshDesc = register('MeshDesc', {
  geometry: [] as number[],  // GEOMETRY enum index
  color:    [] as number[],  // packed 0xRRGGBB
})

export const GEOMETRY = { box: 0, sphere: 1, cylinder: 2 } as const
export type GeometryName = keyof typeof GEOMETRY

// AoS Three.js binding components — the actual object lives at Component[eid]
export const ThreeMesh   = aos<THREE.Mesh>()
export const ThreeCamera = aos<THREE.PerspectiveCamera>()
