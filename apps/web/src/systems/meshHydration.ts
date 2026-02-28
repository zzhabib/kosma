import * as THREE from 'three'
import { query, addComponent, Not } from 'bitecs'
import type { EcsWorld } from '../world'
import { MeshDesc, ThreeMesh } from '../components'

const GEOMETRIES = [
  () => new THREE.BoxGeometry(),
  () => new THREE.SphereGeometry(0.5, 16, 16),
  () => new THREE.CylinderGeometry(0.5, 0.5, 1, 16),
] as const

export function meshHydrationSystem(world: EcsWorld, scene: THREE.Scene): void {
  for (const eid of query(world, [MeshDesc, Not(ThreeMesh)])) {

    const geomFn = GEOMETRIES[MeshDesc.geometry[eid]] ?? GEOMETRIES[0]
    const mesh = new THREE.Mesh(
      geomFn(),
      new THREE.MeshStandardMaterial({ color: MeshDesc.color[eid] }),
    )
    scene.add(mesh)
    addComponent(world, eid, ThreeMesh)
    ThreeMesh[eid] = mesh
  }
}
