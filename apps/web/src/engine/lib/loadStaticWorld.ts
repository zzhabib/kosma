import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import RAPIER from '@dimforge/rapier3d-compat'

export async function loadStaticWorld(url: string, scene: THREE.Scene, physics: RAPIER.World, textureUrl?: string): Promise<void> {
  const [gltf, texture] = await Promise.all([
    new GLTFLoader().loadAsync(url),
    textureUrl ? new THREE.TextureLoader().loadAsync(textureUrl) : Promise.resolve(null),
  ])

  if (texture) texture.colorSpace = THREE.SRGBColorSpace

  scene.add(gltf.scene)
  gltf.scene.updateMatrixWorld(true)

  const vertices: number[] = []
  const indices: number[] = []

  gltf.scene.traverse(obj => {
    if (!(obj instanceof THREE.Mesh)) return

    obj.castShadow = true
    obj.receiveShadow = true

    if (texture) {
      const mat = obj.material as THREE.MeshStandardMaterial
      mat.map = texture
      mat.needsUpdate = true
    }

    const geo = obj.geometry as THREE.BufferGeometry
    const pos = geo.getAttribute('position')
    const vertexOffset = vertices.length / 3

    const worldPos = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      worldPos.fromBufferAttribute(pos, i).applyMatrix4(obj.matrixWorld)
      vertices.push(worldPos.x, worldPos.y, worldPos.z)
    }

    const idx = geo.index
    if (idx) {
      for (let i = 0; i < idx.count; i++) {
        indices.push(idx.getX(i) + vertexOffset)
      }
    } else {
      for (let i = 0; i < pos.count; i++) {
        indices.push(i + vertexOffset)
      }
    }
  })

  if (vertices.length === 0) return

  const body = physics.createRigidBody(RAPIER.RigidBodyDesc.fixed())
  physics.createCollider(
    RAPIER.ColliderDesc.trimesh(new Float32Array(vertices), new Uint32Array(indices)),
    body
  )
}
