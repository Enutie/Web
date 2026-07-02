import * as THREE from 'three'
import { P } from './palette'

// Theme-reactive light rig. Two looks:
//  - day  (site light theme): bright warm hemisphere + key, lamp off
//  - night (site dark theme): "lamplit" — dim ambience, warm lamp pool,
//    stronger red fill (the signature color), brighter screen glow
// Values lerp smoothly so toggling the site theme feels like dusk falling.

export type RoomTheme = 'light' | 'dark'

interface LightLevels {
  hemi: number
  key: number
  red: number
  lamp: number
  screen: number
  bulb: number
}

// day keeps the point lights off — spill without a visible source reads as
// a wall stain in bright light; the pong screen itself stays emissive
const DAY: LightLevels = { hemi: 0.85, key: 1.9, red: 0.5, lamp: 0, screen: 0, bulb: 0.12 }
const NIGHT: LightLevels = { hemi: 0.34, key: 0.5, red: 1.6, lamp: 4.2, screen: 1.4, bulb: 1.15 }

export interface LightRig {
  setTheme(theme: RoomTheme): void
  /** advance the lerp; returns true while still animating */
  update(dt: number, elapsed: number): boolean
  jumpToTarget(): void
  /** compensate point-light falloff when the room group is scaled down —
      distances shrink with the group but light decay is world-space, so
      un-compensated lights overexpose small rooms (intensity ∝ scale²) */
  setScaleCompensation(s: number): void
}

export function createLights(
  scene: THREE.Scene,
  room: THREE.Object3D,
  lampLight: THREE.PointLight,
  bulbMaterial: THREE.MeshStandardMaterial,
  screenGlowPosition: THREE.Vector3,
  initial: RoomTheme,
): LightRig {
  const hemi = new THREE.HemisphereLight('#fff2dd', '#3a2c20', 1)
  scene.add(hemi)

  const key = new THREE.DirectionalLight('#ffe6c4', 1)
  key.position.set(4.5, 6.5, 4)
  scene.add(key)
  scene.add(key.target)

  const red = new THREE.PointLight('#c8362b', 0, 8, 2)
  red.position.set(2.6, 0.9, 2.3)
  room.add(red)

  const screenGlow = new THREE.PointLight('#cfe0d4', 0, 1.8, 2)
  screenGlow.position.copy(screenGlowPosition).add(new THREE.Vector3(0, 0.05, 0.25))
  room.add(screenGlow)

  let target: LightLevels = initial === 'dark' ? NIGHT : DAY
  const current: LightLevels = { ...target }
  let comp = 1

  function apply(elapsed: number) {
    hemi.intensity = current.hemi
    key.intensity = current.key
    red.intensity = current.red * comp
    // the lamp breathes very slightly at night
    lampLight.intensity = current.lamp * comp * (1 + Math.sin(elapsed * 1.7) * 0.025)
    screenGlow.intensity = current.screen * comp
    bulbMaterial.emissiveIntensity = current.bulb
  }
  apply(0)

  return {
    setTheme(theme) {
      target = theme === 'dark' ? NIGHT : DAY
    },
    update(dt, elapsed) {
      const k = 1 - Math.exp(-dt * 3.2)
      let animating = false
      for (const prop of Object.keys(current) as Array<keyof LightLevels>) {
        const diff = target[prop] - current[prop]
        if (Math.abs(diff) > 0.001) animating = true
        current[prop] += diff * k
      }
      apply(elapsed)
      return animating
    },
    jumpToTarget() {
      Object.assign(current, target)
      apply(0)
    },
    setScaleCompensation(s) {
      comp = s * s
      // re-apply immediately so still-render paths (reduced motion,
      // off-screen resize) don't render with a stale compensation
      apply(0)
    },
  }
}
