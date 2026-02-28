import { createWorld, addEntity, addComponent, query } from 'bitecs'
import * as THREE from 'three'
import type { WorldSpec } from '@kosma/core'

// Components — plain SoA objects (bitecs 0.4.x style)
export const Position = { x: [] as number[], y: [] as number[], z: [] as number[] }
export const Rotation = { x: [] as number[], y: [] as number[], z: [] as number[] }
export const Scale = { x: [] as number[], y: [] as number[], z: [] as number[] }
export const RotatorSpeed = { x: [] as number[], y: [] as number[], z: [] as number[] }
export const HasMesh = { index: [] as number[] }

// Spherical-coordinate camera (theta = azimuth, phi = polar, radius = distance)
export const OrbitCamera = {
  theta: [] as number[],
  phi: [] as number[],
  radius: [] as number[],
  targetX: [] as number[],
  targetY: [] as number[],
  targetZ: [] as number[],
}

export interface KosmaWorld {
  ecs: ReturnType<typeof createWorld>
  meshes: THREE.Object3D[]
}

export function createKosmaWorld(): KosmaWorld {
  return { ecs: createWorld(), meshes: [] }
}

export function bootstrapWorld(kw: KosmaWorld, spec: WorldSpec, scene: THREE.Scene): void {
  for (const def of spec.entities) {
    const eid = addEntity(kw.ecs)

    const t = def.components.transform ?? {
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
    }

    addComponent(kw.ecs, eid, Position)
    Position.x[eid] = t.position[0]
    Position.y[eid] = t.position[1]
    Position.z[eid] = t.position[2]

    addComponent(kw.ecs, eid, Rotation)
    Rotation.x[eid] = t.rotation[0]
    Rotation.y[eid] = t.rotation[1]
    Rotation.z[eid] = t.rotation[2]

    addComponent(kw.ecs, eid, Scale)
    Scale.x[eid] = t.scale[0]
    Scale.y[eid] = t.scale[1]
    Scale.z[eid] = t.scale[2]

    if (def.components.mesh) {
      const { geometry, color } = def.components.mesh
      const geo =
        geometry === 'box'
          ? new THREE.BoxGeometry()
          : geometry === 'sphere'
            ? new THREE.SphereGeometry(0.5, 16, 16)
            : new THREE.CylinderGeometry(0.5, 0.5, 1, 16)

      const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color }))
      scene.add(mesh)

      addComponent(kw.ecs, eid, HasMesh)
      HasMesh.index[eid] = kw.meshes.length
      kw.meshes.push(mesh)
    }

    if (def.components.rotator) {
      const r = def.components.rotator
      addComponent(kw.ecs, eid, RotatorSpeed)
      RotatorSpeed.x[eid] = r.x
      RotatorSpeed.y[eid] = r.y
      RotatorSpeed.z[eid] = r.z
    }
  }
}

export function bootstrapCamera(
  kw: KosmaWorld,
  opts: { theta?: number; phi?: number; radius?: number } = {},
): number {
  const eid = addEntity(kw.ecs)
  addComponent(kw.ecs, eid, OrbitCamera)
  OrbitCamera.theta[eid] = opts.theta ?? Math.PI / 4
  OrbitCamera.phi[eid] = opts.phi ?? Math.PI / 3
  OrbitCamera.radius[eid] = opts.radius ?? 8
  OrbitCamera.targetX[eid] = 0
  OrbitCamera.targetY[eid] = 0
  OrbitCamera.targetZ[eid] = 0
  return eid
}

export function orbitCameraSystem(kw: KosmaWorld, camera: THREE.Camera): void {
  for (const eid of query(kw.ecs, [OrbitCamera])) {
    const theta = OrbitCamera.theta[eid]
    const phi = OrbitCamera.phi[eid]
    const r = OrbitCamera.radius[eid]
    const tx = OrbitCamera.targetX[eid]
    const ty = OrbitCamera.targetY[eid]
    const tz = OrbitCamera.targetZ[eid]
    camera.position.set(
      tx + r * Math.sin(phi) * Math.sin(theta),
      ty + r * Math.cos(phi),
      tz + r * Math.sin(phi) * Math.cos(theta),
    )
    camera.lookAt(tx, ty, tz)
  }
}

export function rotatorSystem(kw: KosmaWorld, dt: number): void {
  for (const eid of query(kw.ecs, [RotatorSpeed, Rotation])) {
    Rotation.x[eid] += RotatorSpeed.x[eid] * dt
    Rotation.y[eid] += RotatorSpeed.y[eid] * dt * 5
    Rotation.z[eid] += RotatorSpeed.z[eid] * dt
  }
}

export function renderSyncSystem(kw: KosmaWorld): void {
  for (const eid of query(kw.ecs, [Position, Rotation, Scale, HasMesh])) {
    const obj = kw.meshes[HasMesh.index[eid]]
    if (!obj) continue
    obj.position.set(Position.x[eid], Position.y[eid], Position.z[eid])
    obj.rotation.set(Rotation.x[eid], Rotation.y[eid], Rotation.z[eid])
    obj.scale.set(Scale.x[eid], Scale.y[eid], Scale.z[eid])
  }
}
