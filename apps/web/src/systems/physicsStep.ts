import { getPhysicsWorld } from '../physics'

export function physicsStepSystem(): void {
  getPhysicsWorld().step()
}
