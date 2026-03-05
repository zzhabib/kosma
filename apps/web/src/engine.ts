import * as THREE from 'three'
import { query } from 'bitecs'
import { world } from './world'
import { spawnEntity, spawnCamera, spawnPointerInput } from './entities'
import { PointerInput, ThreeCamera } from './components'
import { initPhysics } from './physics'
import { startLoop } from './loop'

export async function startEngine(canvas: HTMLCanvasElement): Promise<() => void> {
  await initPhysics()
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#111111')
  scene.add(new THREE.GridHelper(20, 20, '#333333', '#222222'))
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const sun = new THREE.DirectionalLight(0xffffff, 1.5)
  sun.position.set(5, 10, 5)
  scene.add(sun)

  spawnEntity(world, {
    components: [
      { name: 'Position',     data: { x: 0,   y: 0,   z: 0   } },
      { name: 'Rotation',     data: { x: 0,   y: 0,   z: 0   } },
      { name: 'Scale',        data: { x: 1,   y: 4,   z: 1   } },
      { name: 'RotatorSpeed', data: { x: 0.4, y: 1.0, z: 0.2 } },
      { name: 'MeshDesc', data: { geometry: 0, color: 0xe74c3c } },
      { name: 'RigidbodyDesc', data: { bodyType: 0, restitution: 0.2, friction: 0.8, gravityScale: 1 } },
      { name: 'ColliderDesc', data: { shape: 0, halfExtentX: 0.5, halfExtentY: 2, halfExtentZ: 0.5 } },
    ],
  })
  // Ground plane — fixed body, wide cuboid
  spawnEntity(world, {
    components: [
      { name: 'Position',     data: { x: 0,   y: -3,   z: 0  } },
      { name: 'Rotation',     data: { x: 0,   y: 0,    z: 0  } },
      { name: 'Scale',        data: { x: 20,  y: 0.5,  z: 20 } },
      { name: 'MeshDesc',     data: { geometry: 0, color: 0x555555 } },
      { name: 'RigidbodyDesc', data: { bodyType: 2, restitution: 0.3, friction: 0.8, gravityScale: 0 } },
      { name: 'ColliderDesc', data: { shape: 0, halfExtentX: 10, halfExtentY: 0.25, halfExtentZ: 10 } },
    ],
  })

  spawnCamera(world)
  const inputEid = spawnPointerInput(world)

  // DOM → ECS bridge: accumulate raw input into PointerInput, no logic here
  let lastX = 0
  let lastY = 0
  const onPointerDown = (e: PointerEvent) => { lastX = e.clientX; lastY = e.clientY }
  const onPointerMove = (e: PointerEvent) => {
    PointerInput.dx[inputEid]      += e.clientX - lastX
    PointerInput.dy[inputEid]      += e.clientY - lastY
    PointerInput.buttons[inputEid]  = e.buttons
    lastX = e.clientX
    lastY = e.clientY
  }
  const onPointerUp      = (e: PointerEvent) => { PointerInput.buttons[inputEid] = e.buttons }
  const onContextMenu    = (e: MouseEvent)   => e.preventDefault()
  const onWheel          = (e: WheelEvent)   => { PointerInput.wheelDelta[inputEid] += e.deltaY }

  canvas.addEventListener('pointerdown',  onPointerDown)
  canvas.addEventListener('pointermove',  onPointerMove)
  canvas.addEventListener('pointerup',    onPointerUp)
  canvas.addEventListener('contextmenu',  onContextMenu)
  canvas.addEventListener('wheel',        onWheel, { passive: true })

  const onResize = () => {
    for (const eid of query(world, [ThreeCamera])) {
      ThreeCamera[eid].aspect = window.innerWidth / window.innerHeight
      ThreeCamera[eid].updateProjectionMatrix()
    }
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', onResize)

  const stopLoop = startLoop(renderer, scene, inputEid)

  return () => {
    stopLoop()
    canvas.removeEventListener('pointerdown', onPointerDown)
    canvas.removeEventListener('pointermove', onPointerMove)
    canvas.removeEventListener('pointerup',   onPointerUp)
    canvas.removeEventListener('contextmenu', onContextMenu)
    canvas.removeEventListener('wheel',       onWheel)
    window.removeEventListener('resize',      onResize)
    renderer.dispose()
  }
}
