import { register } from './registry'

export const Transform = register('Transform', {
  px: [] as number[], py: [] as number[], pz: [] as number[],
  rx: [] as number[], ry: [] as number[], rz: [] as number[],
  sx: [] as number[], sy: [] as number[], sz: [] as number[],
}, {
  description: 'World-space position, rotation, and scale of an entity.',
  fields: {
    px: 'X position', py: 'Y position', pz: 'Z position',
    rx: 'X rotation (radians)', ry: 'Y rotation (radians)', rz: 'Z rotation (radians)',
    sx: 'X scale', sy: 'Y scale', sz: 'Z scale',
  },
  example: { px: 0, py: 1, pz: 0, rx: 0, ry: 0, rz: 0, sx: 1, sy: 1, sz: 1 },
})

export const RotatorSpeed = register('RotatorSpeed', {
  x: [] as number[], y: [] as number[], z: [] as number[],
}, {
  description: 'Continuous rotation velocity applied each frame.',
  fields: { x: 'Radians/sec around X', y: 'Radians/sec around Y', z: 'Radians/sec around Z' },
  example: { x: 0, y: 1, z: 0 },
})
