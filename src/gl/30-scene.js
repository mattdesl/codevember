global.THREE = require('three')
const newArray = require('new-array')
const random = require('random-float')
const randomInt = require('random-int')
const randomRadian = () => random(-Math.PI, Math.PI)
const randomRotation = () => newArray(3).map(randomRadian)
const randomSphere = require('gl-vec3/random')
const simplex = new (require('simplex-noise'))()

export const mainColor = new THREE.Color('#000')
export const altColor = new THREE.Color('#fff')

const bgColor1 = new THREE.Color('#fff')
const bgColor2 = new THREE.Color('#283844')
const altBgColor1 = invert(bgColor1)
const altBgColor2 = invert(bgColor2)
const tmpColors = [ new THREE.Color(), new THREE.Color() ]

function invert (color) {
  return new THREE.Color(1 - color.r, 1 - color.g, 1 - color.b)
}

export function updateBackground (app, bg, colorTween) {
  const [ width, height ] = app.shape
  tmpColors[0].copy(bgColor1).lerp(altBgColor1, colorTween)
  tmpColors[1].copy(bgColor2).lerp(altBgColor2, colorTween)
  bg.style({
    aspect: width / height,
    aspectCorrection: false,
    scale: 2.5,
    colors: tmpColors,
    grainScale: 1.5 / Math.min(width, height)
  })
}

export function createPlanet () {
  var meshScale = 0.2
  const outerGeom = new THREE.IcosahedronGeometry(1, 0)
  const innerGeom = new THREE.IcosahedronGeometry(0.95, 1)
  const torusGeom = new THREE.TorusGeometry(2.0, 0.008, 4, 8)
  const ringGeom = new THREE.RingGeometry(2.0, 2.1, 8)
  const rotX = new THREE.Matrix4().makeRotationX(-Math.PI / 2)
  torusGeom.applyMatrix(rotX)
  ringGeom.applyMatrix(rotX)

  const container = new THREE.Object3D()
  const white = new THREE.MeshBasicMaterial({ color: altColor })
  const black = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: mainColor })
  const blackWire = new THREE.MeshBasicMaterial({ color: mainColor, wireframe: true })

  container.add(new THREE.Mesh(innerGeom, white))
  container.add(new THREE.Mesh(outerGeom, blackWire))

  const blackNoDepth = black.clone()
  blackNoDepth.depthTest = false
  const dot = new THREE.Mesh(outerGeom, blackNoDepth)
  dot.scale.multiplyScalar(0.75)
  const dotContainer = new THREE.Object3D()
  dotContainer.add(dot)
  container.add(dotContainer)

  // only needed to show at sides
  container.add(new THREE.Mesh(torusGeom, black))

  const ring2 = new THREE.Mesh(torusGeom, black)
  ring2.scale.multiplyScalar(0.75)
  const ring2Container = new THREE.Object3D()
  ring2Container.add(ring2)
  container.add(ring2Container)
  container.add(new THREE.Mesh(ringGeom, black))

  container.scale.multiplyScalar(meshScale)
  return container
}

export function createStars (count) {
  const geometry = new THREE.TetrahedronGeometry(1, 0)
  const material = new THREE.MeshBasicMaterial({
    color: mainColor
  })
  const meshes = newArray(count).map(() => {
    const mesh = new THREE.Mesh(geometry, material.clone())
    mesh.material.opacity = random(0.01, 0.5)
    mesh.scale.multiplyScalar(random(0.1, 1.5))
    mesh.rotation.fromArray(randomRotation())
    mesh.position.fromArray(randomSphere([], random(200, 400)))
    return mesh
  })
  return meshes
}

export function createAsteroids (count, app) {
  const geometries = newArray(6).map(asteroidGeom)
  const material = new THREE.MeshBasicMaterial({
    color: mainColor,
    transparent: true,
    wireframe: true
  })
  const meshes = newArray(count).map(() => {
    const geometry = geometries[randomInt(geometries.length)]
    const mesh = new THREE.Mesh(geometry, material.clone())
    mesh.material.opacity = random(0.05, 0.1)
    mesh.scale.multiplyScalar(random(0.1, 1.5))
    mesh.rotation.fromArray(randomRotation())
    mesh.direction = new THREE.Vector3().fromArray(randomSphere([]))
    mesh.position.fromArray(randomSphere([], random(15, 70)))
    return mesh
  })
  if (app) app.on('tick', tick)
  return meshes

  function tick (dt) {
    dt = dt / 1000
    meshes.forEach(mesh => {
      mesh.rotation.x += dt * 0.1 * mesh.direction.x
      mesh.rotation.y += dt * 0.5 * mesh.direction.y
    })
  }

  function asteroidGeom () {
    const geometry = new THREE.TetrahedronGeometry(1, randomInt(1, 2))
    geometry.vertices.forEach(v => {
      let steps = 3
      let s = Math.pow(2, steps)
      let a = 0.75
      for (let i = 0; i < steps; i++) {
        v.x += a * simplex.noise3D(v.x * s * 0, v.y * s, v.z * s)
        v.y += a * simplex.noise3D(v.x * s, v.y * s * 0, v.z * s)
        v.z += a * simplex.noise3D(v.x * s, v.y * s, v.z * s * 0)
        s *= 0.25
        a *= 1 / steps * i
      }
    })
    geometry.computeFaceNormals()
    geometry.verticesNeedsUpdate = true
    return geometry
  }
}
