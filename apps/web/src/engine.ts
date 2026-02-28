import * as THREE from 'three'
import { WorldSpecSchema } from '@kosma/core'
import {
  createKosmaWorld, bootstrapWorld,
  bootstrapCamera, orbitCameraSystem,
  OrbitCamera,
  rotatorSystem, renderSyncSystem,
} from './world'

// Hardcoded demo spec — stands in for what the LLM will eventually produce
const DEMO_SPEC = WorldSpecSchema.parse({
  entities: [
    {
      id: 'red-box',
      components: {
        transform: { position: [-2.5, 0, 0] },
        mesh: { geometry: 'box', color: '#e74c3c' },
        rotator: { x: 0.4, y: 1.0, z: 0 },
      },
    },
    {
      id: 'blue-sphere',
      components: {
        transform: { position: [0, 0, 0] },
        mesh: { geometry: 'sphere', color: '#3498db' },
        rotator: { x: 0, y: 0.6, z: 0.3 },
      },
    },
    {
      id: 'green-cylinder',
      components: {
        transform: { position: [2.5, 0, 0] },
        mesh: { geometry: 'cylinder', color: '#2ecc71' },
        rotator: { x: 0.2, y: 1.5, z: 0.1 },
      },
    },
  ],
})

export function startEngine(canvas: HTMLCanvasElement): () => void {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#111111')
  scene.add(new THREE.GridHelper(20, 20, '#333333', '#222222'))

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)

  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const sun = new THREE.DirectionalLight(0xffffff, 1.5)
  sun.position.set(5, 10, 5)
  scene.add(sun)

  const kw = createKosmaWorld()
  bootstrapWorld(kw, DEMO_SPEC, scene)
  const camEid = bootstrapCamera(kw, { theta: Math.PI / 4, phi: Math.PI / 3, radius: 8 })

  // Pointer input — right drag: orbit, middle drag: pan
  let lastX = 0
  let lastY = 0
  const onPointerDown = (e: PointerEvent) => { lastX = e.clientX; lastY = e.clientY }
  const onPointerMove = (e: PointerEvent) => {
    const dx = e.clientX - lastX
    const dy = e.clientY - lastY
    lastX = e.clientX
    lastY = e.clientY
    if (e.buttons === 2) {
      OrbitCamera.theta[camEid] -= dx * 0.005
      OrbitCamera.phi[camEid] = Math.max(0.05, Math.min(Math.PI - 0.05, OrbitCamera.phi[camEid] + dy * 0.005))
    } else if (e.buttons === 4) {
      const scale = OrbitCamera.radius[camEid] * 0.0015
      const m = camera.matrixWorld.elements
      const rx = m[0]; const ry = m[1]; const rz = m[2]
      const ux = m[4]; const uy = m[5]; const uz = m[6]
      OrbitCamera.targetX[camEid] -= (dx * rx - dy * ux) * scale
      OrbitCamera.targetY[camEid] -= (dx * ry - dy * uy) * scale
      OrbitCamera.targetZ[camEid] -= (dx * rz - dy * uz) * scale
    }
  }
  const onContextMenu = (e: MouseEvent) => e.preventDefault()
  const onWheel = (e: WheelEvent) => {
    OrbitCamera.radius[camEid] = Math.max(2, Math.min(30, OrbitCamera.radius[camEid] + e.deltaY * 0.01))
  }

  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('contextmenu', onContextMenu)
  canvas.addEventListener('wheel', onWheel, { passive: true })

  let rafId: number
  let lastTime = performance.now()

  function loop() {
    rafId = requestAnimationFrame(loop)
    const now = performance.now()
    const dt = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    rotatorSystem(kw, dt)
    renderSyncSystem(kw)
    orbitCameraSystem(kw, camera)
    renderer.render(scene, camera)
  }

  loop()

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', onResize)

  return () => {
    cancelAnimationFrame(rafId)
    canvas.removeEventListener('pointerdown', onPointerDown)
    canvas.removeEventListener('pointermove', onPointerMove)
    canvas.removeEventListener('contextmenu', onContextMenu)
    canvas.removeEventListener('wheel', onWheel)
    window.removeEventListener('resize', onResize)
    renderer.dispose()
  }
}
