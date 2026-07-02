import * as THREE from 'three'

// Small construction kit for the low-poly room: cached materials, tracked
// geometries and one-line helpers for the primitives everything is built from.

export interface Finish {
  rough?: number
  metal?: number
}

export class Kit {
  private materials = new Map<string, THREE.MeshStandardMaterial>()
  private geometries = new Set<THREE.BufferGeometry>()
  private extras = new Set<{ dispose(): void }>()
  private aoMaterials = new Map<number, THREE.MeshBasicMaterial>()

  /** shared flat-shaded standard material, one instance per color+finish */
  mat(color: string, f: Finish = {}): THREE.MeshStandardMaterial {
    const key = `${color}|${f.rough ?? 0.85}|${f.metal ?? 0}`
    let m = this.materials.get(key)
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color,
        roughness: f.rough ?? 0.85,
        metalness: f.metal ?? 0,
        flatShading: true,
      })
      this.materials.set(key, m)
    }
    return m
  }

  /** register a non-cached disposable (unique materials, textures) */
  track<T extends { dispose(): void }>(d: T): T {
    this.extras.add(d)
    return d
  }

  private geo<T extends THREE.BufferGeometry>(g: T): T {
    this.geometries.add(g)
    return g
  }

  mesh(
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    material: THREE.Material | THREE.Material[],
    x = 0,
    y = 0,
    z = 0,
  ): THREE.Mesh {
    const m = new THREE.Mesh(this.geo(geometry), material)
    m.position.set(x, y, z)
    parent.add(m)
    return m
  }

  /** box centered at (x,y,z) */
  box(
    parent: THREE.Object3D,
    w: number,
    h: number,
    d: number,
    material: string | THREE.Material,
    x = 0,
    y = 0,
    z = 0,
  ): THREE.Mesh {
    const mat = typeof material === 'string' ? this.mat(material) : material
    return this.mesh(parent, new THREE.BoxGeometry(w, h, d), mat, x, y, z)
  }

  /** cylinder (axis = Y) centered at (x,y,z) */
  cyl(
    parent: THREE.Object3D,
    rTop: number,
    rBottom: number,
    h: number,
    seg: number,
    material: string | THREE.Material | THREE.Material[],
    x = 0,
    y = 0,
    z = 0,
  ): THREE.Mesh {
    const mat = typeof material === 'string' ? this.mat(material) : material
    return this.mesh(parent, new THREE.CylinderGeometry(rTop, rBottom, h, seg), mat, x, y, z)
  }

  /** fake ambient-occlusion blob on the floor under furniture */
  ao(parent: THREE.Object3D, rx: number, rz: number, x: number, z: number, opacity = 0.2): THREE.Mesh {
    let m = this.aoMaterials.get(opacity)
    if (!m) {
      m = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity,
        depthWrite: false,
      })
      this.aoMaterials.set(opacity, m)
    }
    const disc = this.mesh(parent, new THREE.CircleGeometry(1, 20), m, x, 0.006, z)
    disc.rotation.x = -Math.PI / 2
    disc.scale.set(rx, rz, 1)
    disc.renderOrder = 1
    return disc
  }

  dispose() {
    for (const g of this.geometries) g.dispose()
    for (const m of this.materials.values()) m.dispose()
    for (const m of this.aoMaterials.values()) m.dispose()
    for (const d of this.extras) d.dispose()
    this.geometries.clear()
    this.materials.clear()
    this.aoMaterials.clear()
    this.extras.clear()
  }
}

/** tiny deterministic rng so the room looks identical on every load */
export function lcg(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}
