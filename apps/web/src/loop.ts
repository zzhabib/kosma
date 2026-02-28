import * as THREE from 'three'
import { query } from 'bitecs'
import { world } from './world'
import { ThreeCamera, PointerInput } from './components'
import { rotatorSystem } from './systems/rotator'
import { orbitCameraInputSystem } from './systems/orbitCameraInput'
import { orbitCameraSystem } from './systems/orbitCamera'
import { renderSyncSystem } from './systems/renderSync'
import { meshHydrationSystem } from './systems/meshHydration'

export function startLoop(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  inputEid: number,
): () => void {
  let rafId: number
  let lastTime = performance.now()

  function tick() {
    rafId = requestAnimationFrame(tick)
    const now = performance.now()
    const dt = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    meshHydrationSystem(world, scene)
    rotatorSystem(world, dt)
    orbitCameraInputSystem(world)
    orbitCameraSystem(world)
    renderSyncSystem(world)

    const [camEid] = query(world, [ThreeCamera])
    if (camEid !== undefined) {
      renderer.render(scene, ThreeCamera[camEid])
    }

    // Reset per-frame input deltas after systems have consumed them
    PointerInput.dx[inputEid]         = 0
    PointerInput.dy[inputEid]         = 0
    PointerInput.wheelDelta[inputEid] = 0
  }

  tick()
  return () => cancelAnimationFrame(rafId)
}
