import * as THREE from 'three'
import { query, addComponent, Not } from 'bitecs'
import type { DataModel } from '@engine/engine'
import { OrbitCamera, ThreeCamera } from '@engine/components'

export const priority = 5

export default function cameraHydrationSystem({ world }: DataModel): void {
  for (const eid of query(world, [OrbitCamera, Not(ThreeCamera)])) {
    const cam = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000)
    addComponent(world, eid, ThreeCamera)
    ThreeCamera[eid] = cam
  }
}
