import * as THREE from 'three'
import { P } from './palette'
import type { Kit } from './kit'

// The hobby bench against the side wall: cutting mat, paint pots (one red,
// obviously), water cup with brushes, two minis, a sketchbook with a pencil —
// and the brass work lamp that carries the room at night.

export interface HobbyDesk {
  lampLight: THREE.PointLight
  bulbMaterial: THREE.MeshStandardMaterial
}

export function buildHobbyDesk(kit: Kit, parent: THREE.Object3D): HobbyDesk {
  const cz = 0.5
  const topY = 0.78

  // bench
  kit.box(parent, 0.72, 0.055, 1.8, P.benchWood, -1.52, topY, cz)
  for (const [lx, lz] of [
    [-1.82, cz - 0.84],
    [-1.22, cz - 0.84],
    [-1.82, cz + 0.84],
    [-1.22, cz + 0.84],
  ]) {
    kit.box(parent, 0.055, 0.755, 0.055, P.legDark, lx, 0.376, lz)
  }

  // cutting mat + mini being painted
  kit.box(parent, 0.5, 0.012, 0.36, P.matGreen, -1.48, topY + 0.034, 0.22)
  kit.cyl(parent, 0.05, 0.055, 0.02, 10, P.charcoal, -1.48, topY + 0.05, 0.24)
  kit.mesh(
    parent,
    new THREE.CapsuleGeometry(0.028, 0.05, 3, 8),
    kit.mat(P.miniRed),
    -1.48,
    topY + 0.115,
    0.24,
  )
  // a second mini, still bare plastic
  kit.cyl(parent, 0.04, 0.045, 0.018, 10, P.charcoal, -1.32, topY + 0.037, 0.06)
  kit.mesh(
    parent,
    new THREE.CapsuleGeometry(0.024, 0.042, 3, 8),
    kit.mat(P.miniGrey),
    -1.32,
    topY + 0.095,
    0.06,
  )

  // paint pots along the wall edge
  const caps = [P.capRed, P.capBrass, P.capBlue]
  for (let i = 0; i < 3; i++) {
    const z = 0.66 + i * 0.115
    kit.cyl(parent, 0.036, 0.036, 0.056, 10, P.bone, -1.72, topY + 0.056, z)
    kit.cyl(parent, 0.037, 0.037, 0.02, 10, caps[i], -1.72, topY + 0.094, z)
  }

  // water cup + brushes
  kit.cyl(parent, 0.05, 0.044, 0.1, 10, P.cupGrey, -1.7, topY + 0.078, 1.06)
  for (const tilt of [0.24, -0.18]) {
    const brush = kit.cyl(parent, 0.008, 0.008, 0.19, 6, P.guitarNeck, -1.7, topY + 0.16, 1.06)
    brush.rotation.z = tilt
    brush.rotation.x = tilt * 0.6
  }

  // sketchbook + pencil
  kit.box(parent, 0.3, 0.016, 0.4, P.bone, -1.45, topY + 0.036, 1.32)
  const pencil = kit.cyl(parent, 0.007, 0.007, 0.14, 6, P.brass, -1.36, topY + 0.052, 1.28)
  pencil.rotation.x = Math.PI / 2
  pencil.rotation.z = 0.35

  // brass work lamp at the wall-end of the bench
  const lamp = new THREE.Group()
  lamp.position.set(-1.7, topY + 0.028, -0.22)
  parent.add(lamp)
  const brassMat = kit.mat(P.brass, { rough: 0.4, metal: 0.55 })
  kit.cyl(lamp, 0.075, 0.085, 0.024, 12, brassMat, 0, 0, 0)
  const pivot1 = new THREE.Group()
  pivot1.rotation.z = -0.42
  lamp.add(pivot1)
  kit.box(pivot1, 0.026, 0.34, 0.026, brassMat, 0, 0.17, 0)
  const pivot2 = new THREE.Group()
  pivot2.position.y = 0.335
  pivot2.rotation.z = 1.55
  pivot1.add(pivot2)
  kit.box(pivot2, 0.024, 0.3, 0.024, brassMat, 0, 0.15, 0)
  // shade: narrow at the arm, opening downward-ish
  kit.cyl(pivot2, 0.03, 0.095, 0.13, 12, brassMat, 0, 0.32, 0)
  const bulbMaterial = kit.track(
    new THREE.MeshStandardMaterial({
      color: '#f7ecd4',
      emissive: '#ffd9a0',
      emissiveIntensity: 1,
    }),
  )
  kit.mesh(pivot2, new THREE.SphereGeometry(0.026, 8, 6), bulbMaterial, 0, 0.28, 0)
  const lampLight = new THREE.PointLight(P.lampWarm, 0, 3.4, 2)
  lampLight.position.set(0, 0.26, 0)
  pivot2.add(lampLight)

  kit.ao(parent, 0.42, 0.95, -1.52, cz)

  return { lampLight, bulbMaterial }
}
