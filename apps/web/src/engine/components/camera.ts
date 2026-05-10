import { register } from './registry'

export const OrbitCamera = register('OrbitCamera', {
  theta:   [] as number[],
  phi:     [] as number[],
  radius:  [] as number[],
  targetX: [] as number[],
  targetY: [] as number[],
  targetZ: [] as number[],
}, {
  description: 'Spherical orbit camera. Controlled by mouse drag and scroll.',
  fields: {
    theta: 'Horizontal angle (radians)', phi: 'Vertical angle (radians)',
    radius: 'Distance from target',
    targetX: 'Look-at X', targetY: 'Look-at Y', targetZ: 'Look-at Z',
  },
  example: { theta: 0.785, phi: 1.047, radius: 8, targetX: 0, targetY: 0, targetZ: 0 },
})

export const FPCamera = register('FPCamera', {
  pitch:     [] as number[],
  yaw:       [] as number[],
  eyeHeight: [] as number[],
}, {
  description: 'First-person camera. pitch/yaw track look direction; eyeHeight offsets camera above physics body center.',
  fields: {
    pitch: 'Vertical look angle (radians, clamped ±PI/2)',
    yaw: 'Horizontal look angle (radians)',
    eyeHeight: 'Camera offset above body center (meters)',
  },
  example: { pitch: 0, yaw: 0, eyeHeight: 0.8 },
})
