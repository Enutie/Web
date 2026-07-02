import * as THREE from 'three'
import { P } from './palette'
import { Kit, lcg } from './kit'

// Bookshelf in the back corner: procedurally packed spines (a couple in
// oxblood and brass), a few painted minis on display, a small plant on top.

export function buildShelf(kit: Kit, parent: THREE.Object3D) {
  const cx = -1.25
  const cz = -1.72
  const rng = lcg(11)

  // frame
  kit.box(parent, 0.05, 1.85, 0.28, P.shelfWood, cx - 0.5, 0.925, cz)
  kit.box(parent, 0.05, 1.85, 0.28, P.shelfWood, cx + 0.5, 0.925, cz)
  kit.box(parent, 1.05, 0.05, 0.28, P.shelfWood, cx, 1.825, cz)
  kit.box(parent, 1.05, 0.05, 0.28, P.shelfWood, cx, 0.025, cz)
  const shelfYs = [0.62, 1.18]
  for (const y of shelfYs) kit.box(parent, 0.95, 0.04, 0.26, P.shelfWood, cx, y, cz)

  // book rows (bottom row + both shelves; middle shelf leaves room for minis)
  const rows: Array<{ y: number; from: number; to: number }> = [
    { y: 0.05, from: -0.45, to: 0.45 },
    { y: 0.64, from: -0.45, to: 0.02 },
    { y: 1.2, from: -0.45, to: 0.45 },
  ]
  for (const row of rows) {
    let x = row.from
    while (x < row.to - 0.05) {
      const w = 0.03 + rng() * 0.022
      const h = 0.19 + rng() * 0.09
      const color = P.books[Math.floor(rng() * P.books.length)]
      const book = kit.box(parent, w, h, 0.19, color, cx + x + w / 2, row.y + h / 2, cz)
      if (rng() < 0.12) {
        book.rotation.z = 0.1
        x += 0.02
      }
      x += w + 0.006 + (rng() < 0.15 ? 0.03 : 0)
    }
  }

  // three painted minis on the middle shelf
  const miniColors = [P.miniRed, P.miniTeal, P.miniGrey]
  for (let i = 0; i < 3; i++) {
    const x = cx + 0.14 + i * 0.14
    kit.cyl(parent, 0.035, 0.04, 0.016, 10, P.charcoal, x, 0.648, cz)
    kit.mesh(
      parent,
      new THREE.CapsuleGeometry(0.022, 0.04, 3, 8),
      kit.mat(miniColors[i]),
      x,
      0.7,
      cz,
    )
  }

  // small plant on top
  kit.cyl(parent, 0.05, 0.04, 0.08, 10, P.terracotta, cx + 0.3, 1.89, cz)
  kit.mesh(parent, new THREE.IcosahedronGeometry(0.075, 0), kit.mat(P.leaf), cx + 0.3, 1.99, cz)
  kit.mesh(parent, new THREE.IcosahedronGeometry(0.05, 0), kit.mat(P.leaf), cx + 0.36, 1.95, cz - 0.02)

  kit.ao(parent, 0.55, 0.2, cx, cz + 0.05)
}
