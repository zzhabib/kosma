import type { DataModel } from '@engine/engine'

export const priority = 30

export default function physicsStepSystem({ physics }: DataModel): void {
  physics.step()
}
