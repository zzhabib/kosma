import * as THREE from 'three'
import { createWorld, query } from 'bitecs'
import { spawnCamera, spawnPointerInput } from './entities'
import { PointerInput, ThreeCamera } from './components'
import RAPIER from '@dimforge/rapier3d-compat'

export type EcsWorld = ReturnType<typeof createWorld>

export type DataModel = {
  physics: RAPIER.World,
  scene: THREE.Scene,
  world: EcsWorld,
  canvas: HTMLCanvasElement,
}

export type System = (dataModel: DataModel, dt: number) => void

type SystemModule = { default: System; priority?: number }

const systemModules = import.meta.glob<SystemModule>('./systems/*.ts', { eager: true })

const systems: System[] = Object.values(systemModules)
  .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
  .map(m => m.default)

export class Engine {
  private dataModel!: DataModel
  private renderer?: THREE.WebGLRenderer
  private canvas: HTMLCanvasElement
  private rafId = 0
  private cleanup: Array<() => void> = []

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  async start() {
    await RAPIER.init()

    this.dataModel = {
      canvas: this.canvas,
      physics: new RAPIER.World({ x: 0, y: -9.81, z: 0 }),
      scene: new THREE.Scene(),
      world: createWorld(),
    }

    const { scene, world, canvas } = this.dataModel

    scene.background = new THREE.Color('#111111')
    scene.add(new THREE.GridHelper(20, 20, '#333333', '#222222'))
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const sun = new THREE.DirectionalLight(0xffffff, 1.5)
    sun.position.set(5, 10, 5)
    scene.add(sun)

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    const onResize = () => {
      for (const eid of query(world, [ThreeCamera])) {
        ThreeCamera[eid].aspect = window.innerWidth / window.innerHeight
        ThreeCamera[eid].updateProjectionMatrix()
      }
      this.renderer!.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)
    this.cleanup.push(() => window.removeEventListener('resize', onResize))

    spawnCamera(world)
    const inputEid = spawnPointerInput(world)

    let lastX = 0
    let lastY = 0
    const onPointerDown = (e: PointerEvent) => { lastX = e.clientX; lastY = e.clientY }
    const onPointerMove = (e: PointerEvent) => {
      PointerInput.dx[inputEid]     += e.clientX - lastX
      PointerInput.dy[inputEid]     += e.clientY - lastY
      PointerInput.buttons[inputEid] = e.buttons
      lastX = e.clientX
      lastY = e.clientY
    }
    const onPointerUp   = (e: PointerEvent) => { PointerInput.buttons[inputEid] = e.buttons }
    const onContextMenu = (e: MouseEvent)   => e.preventDefault()
    const onWheel       = (e: WheelEvent)   => { PointerInput.wheelDelta[inputEid] += e.deltaY }

    canvas.addEventListener('pointerdown',  onPointerDown)
    canvas.addEventListener('pointermove',  onPointerMove)
    canvas.addEventListener('pointerup',    onPointerUp)
    canvas.addEventListener('contextmenu',  onContextMenu)
    canvas.addEventListener('wheel',        onWheel, { passive: true })
    this.cleanup.push(() => {
      canvas.removeEventListener('pointerdown',  onPointerDown)
      canvas.removeEventListener('pointermove',  onPointerMove)
      canvas.removeEventListener('pointerup',    onPointerUp)
      canvas.removeEventListener('contextmenu',  onContextMenu)
      canvas.removeEventListener('wheel',        onWheel)
    })

    this.tick(performance.now(), inputEid)
  }

  private tick(lastTime: number, inputEid: number) {
    this.rafId = requestAnimationFrame(now => {
      const dt = Math.min((now - lastTime) / 1000, 0.1)

      for (const system of systems) {
        system(this.dataModel, dt)
      }

      const { scene, world } = this.dataModel
      const [camEid] = query(world, [ThreeCamera])
      if (camEid !== undefined) {
        this.renderer!.render(scene, ThreeCamera[camEid])
      }

      PointerInput.dx[inputEid]         = 0
      PointerInput.dy[inputEid]         = 0
      PointerInput.wheelDelta[inputEid] = 0

      this.tick(now, inputEid)
    })
  }

  stop() {
    cancelAnimationFrame(this.rafId)
    for (const fn of this.cleanup) fn()
    this.renderer?.dispose()
  }
}
