export type SoAComponent = Record<string, unknown[]>

export const registry = new Map<string, SoAComponent>()

export type ComponentDoc = {
  description: string
  fields?: Record<string, string>
  example: Record<string, unknown>
  notes?: string
}

export const docRegistry = new Map<string, ComponentDoc>()

export const register = <T extends SoAComponent>(name: string, component: T, doc?: ComponentDoc): T => {
  registry.set(name, component)
  if (doc) docRegistry.set(name, doc)
  return component
}

export type Slice<T extends Record<string, unknown[]>> = {
  [K in keyof T]: T[K] extends (infer U)[] ? U : never
}
