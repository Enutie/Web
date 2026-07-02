import * as THREE from 'three'
import { P } from './palette'
import type { Kit } from './kit'

// The dev corner: desk against the back wall, monitor running pong, keyboard,
// mouse, coffee, a tower under the desk with a pulsing power LED, and an
// office chair swiveled slightly off-axis.

export interface DevDesk {
  ledMaterial: THREE.MeshStandardMaterial
  screenPosition: THREE.Vector3
}

export function buildDevDesk(kit: Kit, parent: THREE.Object3D, screenTexture: THREE.Texture): DevDesk {
  const cx = 0.72
  const topY = 0.76

  // desk
  kit.box(parent, 1.7, 0.055, 0.72, P.deskWood, cx, topY, -1.52)
  for (const [lx, lz] of [
    [cx - 0.79, -1.82],
    [cx + 0.79, -1.82],
    [cx - 0.79, -1.22],
    [cx + 0.79, -1.22],
  ]) {
    kit.box(parent, 0.055, 0.735, 0.055, P.legDark, lx, 0.366, lz)
  }

  // monitor
  kit.box(parent, 0.26, 0.02, 0.17, P.charcoal, cx, topY + 0.038, -1.68)
  kit.box(parent, 0.05, 0.2, 0.045, P.charcoal, cx, topY + 0.14, -1.7)
  kit.box(parent, 0.78, 0.47, 0.045, P.bezel, cx, 1.2, -1.7)
  const screenMat = kit.track(
    new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false }),
  )
  kit.mesh(parent, new THREE.PlaneGeometry(0.71, 0.4), screenMat, cx, 1.2, -1.676)

  // keyboard, mouse, coffee
  kit.box(parent, 0.44, 0.028, 0.15, P.charcoal, cx - 0.12, topY + 0.042, -1.32)
  kit.box(parent, 0.07, 0.028, 0.11, P.charcoal, cx + 0.33, topY + 0.042, -1.3)
  kit.cyl(parent, 0.05, 0.05, 0.095, 10, P.bone, cx + 0.6, topY + 0.075, -1.55)
  const handle = kit.mesh(
    parent,
    new THREE.TorusGeometry(0.03, 0.009, 6, 12),
    kit.mat(P.bone),
    cx + 0.648,
    topY + 0.075,
    -1.55,
  )
  handle.rotation.y = Math.PI / 2

  // tower with power LED
  kit.box(parent, 0.2, 0.48, 0.44, P.charcoal, cx + 0.63, 0.24, -1.52)
  const ledMaterial = kit.track(
    new THREE.MeshStandardMaterial({
      color: '#2a0f0c',
      emissive: P.capRed,
      emissiveIntensity: 1,
    }),
  )
  kit.box(parent, 0.02, 0.02, 0.012, ledMaterial, cx + 0.66, 0.4, -1.294)

  // office chair, swiveled a little
  const chair = new THREE.Group()
  chair.position.set(cx - 0.05, 0, -0.78)
  chair.rotation.y = Math.PI * 0.88
  parent.add(chair)
  kit.cyl(chair, 0.03, 0.03, 0.36, 8, P.charcoal, 0, 0.27, 0)
  kit.box(chair, 0.44, 0.05, 0.42, P.seat, 0, 0.47, 0)
  kit.box(chair, 0.42, 0.5, 0.05, P.seat, 0, 0.84, 0.2)
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    const spoke = kit.box(chair, 0.3, 0.03, 0.045, P.charcoal, Math.cos(a) * 0.15, 0.07, Math.sin(a) * 0.15)
    spoke.rotation.y = -a
  }

  kit.ao(parent, 0.95, 0.42, cx, -1.5)
  kit.ao(parent, 0.34, 0.34, cx - 0.05, -0.78)

  return { ledMaterial, screenPosition: new THREE.Vector3(cx, 1.2, -1.6) }
}
