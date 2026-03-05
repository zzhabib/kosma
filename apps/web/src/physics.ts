import RAPIER from '@dimforge/rapier3d-compat'

let world: RAPIER.World

export async function initPhysics(): Promise<void> {
  await RAPIER.init()
  world = new RAPIER.World({ x: 0, y: -9.81, z: 0 })
}

export function getPhysicsWorld(): RAPIER.World {
  return world
}

export { RAPIER }
