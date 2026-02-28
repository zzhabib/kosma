// @kosma/core — shared types, Zod schemas, and WorldSpec definitions
import { z } from 'zod'

const Vec3 = z.tuple([z.number(), z.number(), z.number()])

const TransformDef = z.object({
  position: Vec3.default([0, 0, 0]),
  rotation: Vec3.default([0, 0, 0]),
  scale: Vec3.default([1, 1, 1]),
})

const MeshDef = z.object({
  geometry: z.enum(['box', 'sphere', 'cylinder']),
  color: z.string().default('#ffffff'),
})

const RotatorDef = z.object({
  x: z.number().default(0),
  y: z.number().default(1),
  z: z.number().default(0),
})

const EntityDef = z.object({
  id: z.string(),
  components: z.object({
    transform: TransformDef.optional(),
    mesh: MeshDef.optional(),
    rotator: RotatorDef.optional(),
  }),
})

export const WorldSpecSchema = z.object({
  entities: z.array(EntityDef),
})

export type WorldSpec = z.infer<typeof WorldSpecSchema>
