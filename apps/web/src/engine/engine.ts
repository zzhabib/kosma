import * as THREE from 'three'
import { createWorld, query, observe, onRemove } from 'bitecs'
import { spawnSampleEntities } from './entities'
import { ThreeCamera, Three3D, ThreeDesc, threeBindings, RapierBody, PhysicsDesc } from './components'
import RAPIER from '@dimforge/rapier3d-compat'

export type EcsWorld = ReturnType<typeof createWorld>

export type InputState = {
  dx: number
  dy: number
  buttons: number
  wheelDelta: number
}

export type DataModel = {
  physics: RAPIER.World,
  scene: THREE.Scene,
  world: EcsWorld,
  canvas: HTMLCanvasElement,
  input: InputState,
}

export type System = (dataModel: DataModel, dt: number) => void

type SystemModule = { default: System; priority?: number }

const systemModules = import.meta.glob<SystemModule>('./systems/**/*.ts', { eager: true })

const systems: System[] = Object.values(systemModules)
  .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
  .map(m => m.default)

export class Engine {
  dataModel!: DataModel
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
      input: { dx: 0, dy: 0, buttons: 0, wheelDelta: 0 },
    }

    const { scene, world, canvas, input } = this.dataModel

    scene.background = new THREE.Color('#111111')
    scene.add(new THREE.GridHelper(20, 20, '#333333', '#222222'))
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const sun = new THREE.DirectionalLight(0xffffff, 1.5)
    sun.position.set(5, 10, 5)
    scene.add(sun)

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true

    const onResize = () => {
      for (const eid of query(world, [ThreeCamera])) {
        ThreeCamera[eid].aspect = window.innerWidth / window.innerHeight
        ThreeCamera[eid].updateProjectionMatrix()
      }
      this.renderer!.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)
    this.cleanup.push(() => window.removeEventListener('resize', onResize))

    observe(world, onRemove(Three3D as any), (eid: number) => {
      const obj = Three3D[eid] as any
      if (!obj) return
      scene.remove(obj)
      obj.geometry?.dispose()
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      mats.forEach((m: any) => m?.dispose())
      const binding = threeBindings.get(ThreeDesc[eid]?.type)
      if (binding) (binding as any)[eid] = undefined
      ;(Three3D as any)[eid] = undefined
    })

    observe(world, onRemove(RapierBody as any), (eid: number) => {
      const body = RapierBody[eid]
      if (body) this.dataModel.physics.removeRigidBody(body)
      ;(RapierBody as any)[eid] = undefined
    })

    spawnSampleEntities(world)
    this.cleanup.push(this.bindInput(canvas, input))

    this.tick(performance.now())
  }

  private bindInput(canvas: HTMLCanvasElement, input: InputState): () => void {
    let lastX = 0
    let lastY = 0
    const controller = new AbortController()
    const { signal } = controller

    canvas.addEventListener('pointerdown',  (e: PointerEvent) => { lastX = e.clientX; lastY = e.clientY }, { signal })
    canvas.addEventListener('pointermove',  (e: PointerEvent) => {
      input.dx      += e.clientX - lastX
      input.dy      += e.clientY - lastY
      input.buttons  = e.buttons
      lastX = e.clientX
      lastY = e.clientY
    }, { signal })
    canvas.addEventListener('pointerup',    (e: PointerEvent) => { input.buttons = e.buttons }, { signal })
    canvas.addEventListener('contextmenu',  (e: MouseEvent)   => e.preventDefault(), { signal })
    canvas.addEventListener('wheel',        (e: WheelEvent)   => { input.wheelDelta += e.deltaY }, { passive: true, signal })

    return () => controller.abort()
  }

  private tick(lastTime: number) {
    this.rafId = requestAnimationFrame(now => {
      const dt = Math.min((now - lastTime) / 1000, 0.1)

      for (const system of systems) {
        system(this.dataModel, dt)
      }

      const { scene, world, input } = this.dataModel
      const [camEid] = query(world, [ThreeCamera])
      if (camEid !== undefined) {
        this.renderer!.render(scene, ThreeCamera[camEid])
      }

      input.dx         = 0
      input.dy         = 0
      input.wheelDelta = 0

      this.tick(now)
    })
  }

  stop() {
    cancelAnimationFrame(this.rafId)
    for (const fn of this.cleanup) fn()
    this.renderer?.dispose()
  }
}
