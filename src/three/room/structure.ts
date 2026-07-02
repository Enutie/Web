import type * as THREE from 'three'
import { P } from './palette'
import type { Kit } from './kit'

// Room shell: a 4×4 corner diorama. Back wall along z=-2, side wall along
// x=-2, plank floor, dark plinth underneath so it reads as a model on a base.

export const ROOM = {
  half: 2, // floor is 4×4 centered on origin
  wallH: 2.35,
  wallT: 0.12,
  wallX: -1.88, // inner face of the side wall
  wallZ: -1.88, // inner face of the back wall
}

export function buildStructure(kit: Kit, parent: THREE.Object3D) {
  // plinth
  kit.box(parent, 4.36, 0.16, 4.36, P.plinth, 0, -0.22, 0)

  // plank floor (8 planks along x, alternating tones)
  const tones = [P.floorA, P.floorB, P.floorC]
  for (let i = 0; i < 8; i++) {
    kit.box(parent, 4, 0.14, 0.48, tones[i % 3], 0, -0.07, -2 + 0.25 + i * 0.5)
  }

  // walls
  kit.box(parent, 4.24, ROOM.wallH, ROOM.wallT, P.wall, 0.06, ROOM.wallH / 2, -2.06)
  kit.box(parent, ROOM.wallT, ROOM.wallH, 4.24, P.wall, -2.06, ROOM.wallH / 2, 0.06)

  // baseboards
  kit.box(parent, 4.1, 0.09, 0.045, P.baseboard, 0.05, 0.045, -1.955)
  kit.box(parent, 0.045, 0.09, 4.1, P.baseboard, -1.955, 0.045, 0.05)

  // round rug, oxblood with a bone rim — the token echo on the floor
  kit.cyl(parent, 0.95, 0.95, 0.022, 28, P.rugRim, 0.55, 0.011, 0.55)
  kit.cyl(parent, 0.8, 0.8, 0.02, 28, P.rugRed, 0.55, 0.026, 0.55)
}
