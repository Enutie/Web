import * as THREE from 'three'
import { P } from './palette'
import type { Kit } from './kit'

// Acoustic guitar leaning in the front corner against the side wall.
// Figure-8 body from two flattened cylinders with a spruce top, dark sides.

export function buildGuitar(kit: Kit, parent: THREE.Object3D) {
  const g = new THREE.Group()
  g.position.set(-1.62, 0.02, 1.5)
  g.rotation.set(0.07, 0.4, -0.17)
  parent.add(g)

  const side = kit.mat(P.guitarSide)
  const top = kit.mat(P.guitarTop, { rough: 0.6 })
  // cylinder material order: [side, top, bottom]
  const bodyMats = [side, top, top]

  // bouts (axis rotated onto x so the top faces +x, out from the wall)
  const lower = kit.cyl(g, 0.245, 0.245, 0.085, 18, bodyMats, 0, 0.26, 0)
  lower.rotation.z = -Math.PI / 2
  const upper = kit.cyl(g, 0.18, 0.18, 0.085, 18, bodyMats, 0, 0.47, 0)
  upper.rotation.z = -Math.PI / 2

  // sound hole + bridge on the top face
  const hole = kit.mesh(
    g,
    new THREE.CircleGeometry(0.055, 16),
    kit.mat('#241a12'),
    0.0435,
    0.36,
    0,
  )
  hole.rotation.y = Math.PI / 2
  kit.box(g, 0.014, 0.028, 0.11, P.fretboard, 0.046, 0.2, 0)

  // neck, fretboard, string hint, headstock
  kit.box(g, 0.04, 0.6, 0.05, P.guitarNeck, 0.026, 0.82, 0)
  kit.box(g, 0.012, 0.56, 0.044, P.fretboard, 0.052, 0.82, 0)
  kit.box(g, 0.004, 0.72, 0.02, P.bone, 0.059, 0.75, 0)
  kit.box(g, 0.036, 0.14, 0.062, P.guitarSide, 0.028, 1.18, 0)
  // tuning pegs
  for (let i = 0; i < 3; i++) {
    for (const s of [-1, 1]) {
      kit.mesh(
        g,
        new THREE.SphereGeometry(0.0095, 6, 5),
        kit.mat(P.brass, { rough: 0.4, metal: 0.55 }),
        0.028,
        1.135 + i * 0.038,
        s * 0.042,
      )
    }
  }

  kit.ao(parent, 0.3, 0.24, -1.56, 1.52)
}
