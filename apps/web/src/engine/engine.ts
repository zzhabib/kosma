import * as THREE from 'three'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import { createWorld, query, observe, onRemove } from 'bitecs'
import { spawnSampleEntities } from './entities'
import { ThreeCamera, Three3D, ThreeDesc, threeBindings, RapierBody, PhysicsDesc } from './components'
import RAPIER from '@dimforge/rapier3d-compat'
import { loadStaticWorld } from './lib/loadStaticWorld'

export type EcsWorld = ReturnType<typeof createWorld>

export type InputState = {
  dx: number
  dy: number
  buttons: number
  wheelDelta: number
  keys: Set<string>
  pointerLocked: boolean
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
type SystemEntry = { id: string; fn: System; priority: number; enabled: boolean; origin: 'packaged' | 'agent'; source?: string }

const systemModules = import.meta.glob<SystemModule>('./systems/**/*.ts', { eager: true })
const systemSources = import.meta.glob<string>('./systems/**/*.ts', { query: '?raw', import: 'default', eager: true })

export class Engine {
  dataModel!: DataModel
  private renderer?: THREE.WebGLRenderer
  private canvas: HTMLCanvasElement
  private rafId = 0
  private cleanup: Array<() => void> = []
  private systemMap = new Map<string, SystemEntry>()
  private sortedSystems: SystemEntry[] = []

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
      input: { dx: 0, dy: 0, buttons: 0, wheelDelta: 0, keys: new Set(), pointerLocked: false },
    }

    const { scene, world, canvas, input } = this.dataModel

    const sky = new Sky()
    sky.scale.setScalar(10000)
    scene.add(sky)
    const skyUniforms = sky.material.uniforms
    skyUniforms['turbidity'].value = 10
    skyUniforms['rayleigh'].value = 2
    skyUniforms['mieCoefficient'].value = 0.005
    skyUniforms['mieDirectionalG'].value = 0.8

    const sunPos = new THREE.Vector3()
    sunPos.setFromSphericalCoords(1, THREE.MathUtils.degToRad(45), THREE.MathUtils.degToRad(210))
    skyUniforms['sunPosition'].value.copy(sunPos)

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshStandardMaterial({ color: '#6b8c4a', roughness: 1, metalness: 0 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    const { physics } = this.dataModel
    const groundBody = physics.createRigidBody(RAPIER.RigidBodyDesc.fixed())
    physics.createCollider(RAPIER.ColliderDesc.cuboid(500, 0.05, 500), groundBody)

    // Drop any .glb into apps/web/public/ and uncomment:
    // loadStaticWorld(`${import.meta.env.BASE_URL}my-world.glb`, scene, physics)
    loadStaticWorld(`${import.meta.env.BASE_URL}models/building-a.glb`, scene, physics, `${import.meta.env.BASE_URL}models/variation-a.png`).catch(err => console.error('Failed to load static world:', err))

    scene.add(new THREE.HemisphereLight(0x87ceeb, 0x5a7a3a, 1.2))

    const sun = new THREE.DirectionalLight(0xfffde7, 4)
    sun.position.copy(sunPos).multiplyScalar(100)
    sun.castShadow = true
    sun.shadow.camera.near = 0.5
    sun.shadow.camera.far = 500
    sun.shadow.camera.left = -50
    sun.shadow.camera.right = 50
    sun.shadow.camera.top = 50
    sun.shadow.camera.bottom = -50
    sun.shadow.mapSize.set(2048, 2048)
    scene.add(sun)

    scene.fog = new THREE.FogExp2(0xd0e8f5, 0.002)

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0

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

    for (const [key, mod] of Object.entries(systemModules)) {
      const id = key.replace(/^\.\/systems\//, '').replace(/\.ts$/, '')
      this.systemMap.set(id, { id, fn: mod.default, priority: mod.priority ?? 0, enabled: true, origin: 'packaged', source: systemSources[key] })
    }
    this.rebuildSortedSystems()

    spawnSampleEntities(world)
    this.cleanup.push(this.bindInput(canvas, input))

    this.tick(performance.now())
  }

  private rebuildSortedSystems(): void {
    this.sortedSystems = [...this.systemMap.values()]
      .filter(e => e.enabled)
      .sort((a, b) => a.priority - b.priority)
  }

  private bindInput(canvas: HTMLCanvasElement, input: InputState): () => void {
    let lastX = 0
    let lastY = 0
    const controller = new AbortController()
    const { signal } = controller

    canvas.addEventListener('pointerdown',  (e: PointerEvent) => { lastX = e.clientX; lastY = e.clientY }, { signal })
    canvas.addEventListener('pointermove',  (e: PointerEvent) => {
      if (input.pointerLocked) {
        input.dx += e.movementX
        input.dy += e.movementY
      } else {
        input.dx += e.clientX - lastX
        input.dy += e.clientY - lastY
      }
      input.buttons  = e.buttons
      lastX = e.clientX
      lastY = e.clientY
    }, { signal })
    canvas.addEventListener('pointerup',    (e: PointerEvent) => { input.buttons = e.buttons }, { signal })
    canvas.addEventListener('contextmenu',  (e: MouseEvent)   => e.preventDefault(), { signal })
    canvas.addEventListener('wheel',        (e: WheelEvent)   => { input.wheelDelta += e.deltaY }, { passive: true, signal })

    canvas.addEventListener('click', () => canvas.requestPointerLock(), { signal })
    document.addEventListener('pointerlockchange', () => {
      input.pointerLocked = document.pointerLockElement === canvas
    }, { signal })

    window.addEventListener('keydown', (e: KeyboardEvent) => { input.keys.add(e.code) }, { signal })
    window.addEventListener('keyup',   (e: KeyboardEvent) => { input.keys.delete(e.code) }, { signal })

    return () => controller.abort()
  }

  private tick(lastTime: number) {
    this.rafId = requestAnimationFrame(now => {
      const dt = Math.min((now - lastTime) / 1000, 0.1)

      for (const entry of this.sortedSystems) {
        try {
          entry.fn(this.dataModel, dt)
        } catch (err) {
          console.error(`[engine] system "${entry.id}" threw:`, err)
        }
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

  addSystem(id: string, fn: System, priority = 0, source?: string): void {
    this.systemMap.set(id, { id, fn, priority, enabled: true, origin: 'agent', source })
    this.rebuildSortedSystems()
  }

  getSystem(id: string): { id: string; priority: number; enabled: boolean; origin: 'packaged' | 'agent'; source?: string } | undefined {
    const e = this.systemMap.get(id)
    if (!e) return undefined
    return { id: e.id, priority: e.priority, enabled: e.enabled, origin: e.origin, source: e.source }
  }

  listSystems(): Array<{ id: string; priority: number; enabled: boolean; origin: 'packaged' | 'agent' }> {
    return [...this.systemMap.values()].map(({ id, priority, enabled, origin }) => ({ id, priority, enabled, origin }))
  }

  getSystemSource(id: string): string | undefined {
    return this.systemMap.get(id)?.source
  }

  removeSystem(id: string): void {
    this.systemMap.delete(id)
    this.rebuildSortedSystems()
  }

  enableSystem(id: string): void {
    const e = this.systemMap.get(id)
    if (e) { e.enabled = true; this.rebuildSortedSystems() }
  }

  disableSystem(id: string): void {
    const e = this.systemMap.get(id)
    if (e) { e.enabled = false; this.rebuildSortedSystems() }
  }
}
