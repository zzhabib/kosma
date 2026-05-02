import * as THREE from 'three'
import { query, addComponent, Not } from 'bitecs'
import type { DataModel } from '@engine/engine'
import { ThreeDesc, Three3D, getThreeBinding } from '@engine/components'

export const priority = 10

export default function threeHydrationSystem({ world, scene }: DataModel): void {
  for (const eid of query(world, [ThreeDesc, Not(Three3D)])) {
    const spec = ThreeDesc[eid]
    let obj: THREE.Object3D

    if (spec.geometry) {
      const geo = new (THREE as any)[spec.geometry.type](...(spec.geometry.args ?? []))
      const mat = new (THREE as any)[spec.material!.type](spec.material?.params ?? {})
      const mesh = new THREE.Mesh(geo, mat)
      mesh.castShadow = true
      mesh.receiveShadow = true
      obj = mesh
    } else {
      obj = new (THREE as any)[spec.type](...(spec.args ?? []))
    }

    scene.add(obj)

    addComponent(world, eid, Three3D)
    Three3D[eid] = obj

    const binding = getThreeBinding(spec.type)
    addComponent(world, eid, binding)
    binding[eid] = obj

    console.log(`Hydrated entity ${eid} as Three.js ${spec.type}`)
  }
}
