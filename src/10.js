global.THREE = require('three')
const lerp = require('lerp')
const createOrbit = require('./three-orbit-app')
const simplex = new (require('simplex-noise'))
const newArray = require('new-array')
const random = require('random-float')
const touch = require('touch-position')()
const smoothstep = require('smoothstep')
const randomSphere = require('gl-vec2/random')
const clamp = require('clamp')
const isLowEnd = require('./is-low-end')()
const isMobile = require('./is-mobile')()
const geoChevron = require('geo-chevron')
const createComplex = require('three-simplicial-complex')(THREE)

const app = createOrbit({
  position: [0, 0, 0.0001],
  near: 0.00001,
  far: 2000000,
  zoom: false,
  alpha: false,
  pinch: false,
  deviceOrientationControls: isMobile
})

app.renderer.setClearColor(0x000000, 1)

const sunSphere = new THREE.Object3D()
const vec2 = new THREE.Vector2()

const distance = 400000
const planeSize = 150
const planeY = -2
const planeSegs = 30
const Sky = require('./shaders/sky')
const sky = new Sky()
app.scene.add(sky.mesh)

const createPoint = require('verlet-point/3d')
const world = require('verlet-system/3d')({
  gravity: [ 0, 0, 0 ],
  min: [null, planeY],
})
const ray = new THREE.Ray()
const mouseVec = new THREE.Vector2()
const tmpVec2 = new THREE.Vector3()
const tmpVec3 = new THREE.Vector3()
const lastHit = new THREE.Vector3()
const plane3 = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1)
const points = []
const tmpArray3 = [0, 0, 0]

const floor = createFloor()
const poppies = createPoppies(floor)

// if (isMobile) { // point user toward sun
  const arrowGeo = createComplex(geoChevron({
    startRadian: 0,
    width: 1,
    depth: 1,
    thickness: 0.5
  }))
  const arrow = new THREE.Mesh(arrowGeo, new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    depthTest: false,
    wireframe: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    opacity: 0.5
  }))
  arrow.scale.multiplyScalar(0.5)
  arrow.position.y = planeY
  arrow.rotation.y = Math.PI/2
  app.scene.add(arrow)
// }

document.body.style.overflow = 'hidden'
document.body.style.margin = '0'
document.body.style.background = 'black'

let time = 6000
app.on('tick', (dt) => {
  dt = Math.min(30, dt) / 1000
  time += dt

  mouseVec.x = (touch[0] / window.innerWidth) * 2 - 1
  mouseVec.y = -(touch[1] / window.innerHeight) * 2 + 1
  const camera = app.camera
  ray.origin.setFromMatrixPosition(camera.matrixWorld)
  ray.direction.set(mouseVec.x, mouseVec.y, 0.5).unproject(camera).sub(ray.origin).normalize()
  const intersection = ray.intersectPlane(plane3, tmpVec2)
  if (intersection) {
    intersection.y = 0
    points.forEach((point) => {
      tmpVec3.fromArray(point.position)
      tmpVec3.y = 0
      
      var length = tmpVec3.distanceTo(lastHit)
      var mult = 1 - clamp(length / 1, -1, 1)
      var speed = 0.01
      tmpVec3.sub(lastHit).multiplyScalar(mult * speed).clamp(-1, 1)
      tmpArray3[0] = tmpVec3.x
      tmpArray3[2] = tmpVec3.z
      point.addForce(tmpArray3)
    })
    
    lastHit.copy(intersection)
  }
  
  const uniforms = sky.uniforms
  uniforms.turbidity.value = 10
  uniforms.reileigh.value = 2
  uniforms.luminance.value = 1
  uniforms.mieCoefficient.value = 0.005
  uniforms.mieDirectionalG.value = 0.8

  const anim = (Math.sin(time * 0.05) * 0.5 + 0.5)
  const inclination = lerp(0.499, 0, anim)
  const azimuth = 0.25 + time * 0.001
  const theta = Math.PI * (inclination - 0.5)
  const phi = 2 * Math.PI * (azimuth - 0.5)

  sunSphere.position.x = distance * Math.cos(phi)
  sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta)
  sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta)
  sky.uniforms.sunPosition.value.copy(sunSphere.position)

  world.integrate(points, dt)
  poppies.forEach((mesh, i) => {
    const pos = points[i].position
    mesh.position.set(pos[0], pos[1], pos[2])
  })
})

function createFloor () {
  const floorGeom = new THREE.PlaneGeometry(planeSize, planeSize, planeSegs, planeSegs)
  floorGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2))
  turbulent(floorGeom)

  const floorMat = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    wireframe: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    opacity: 0.05,
    color: '#c47f2d',
  })
  const floor = new THREE.Mesh(floorGeom, floorMat)
  floor.position.y = planeY
  app.scene.add(floor)
  return floor
}

function turbulent (geom) {
  var verts = geom.vertices
  for (var i = 0; i < verts.length; i++) {
    var v = verts[i]
    v.y = sample(v.x, v.z)
  }
  geom.verticesNeedUpdate = true
}

function sample (x, z) {
  var dist = vec2.set(x, z).length() / planeSize
  dist = smoothstep(0, 0.5, dist)
  var strength = 1
  var scale = 1
  scale += 2 * dist
  strength += 1 * (1 - dist)
  return dist + scale * simplex.noise2D(x * strength, z * strength)
}

function funkUp (geom) {
  var verts = geom.vertices
  for (var i = 0; i < verts.length; i++) {
    var v = verts[i]
    var scale = 1
    var strength = 5
    v.x += scale * simplex.noise3D(0, v.y * strength, v.z * strength)
    v.y += scale * simplex.noise3D(v.x * strength, 0, v.z * strength)
    v.z += scale * simplex.noise3D(v.x * strength, v.y * strength, 0)
  }
  geom.verticesNeedUpdate = true
}

function createPoppies (groundToCast) {
  var geometries = [
    new THREE.TetrahedronGeometry(1, 0),
    new THREE.TetrahedronGeometry(1, 0),
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.IcosahedronGeometry(1, 0)
  ]
  geometries.forEach(funkUp)

  var materials = [
    new THREE.MeshBasicMaterial({
      color: '#ca211d',
      blending: THREE.AdditiveBlending,
      transparent: true,
    })
  ]
  const scatter = planeSize / 6
  const caster = new THREE.Raycaster()
  const tmp2 = []
  return newArray(isLowEnd ? 1000 : 4000).map((_, i) => {
    const geom = geometries[Math.floor(random(geometries.length))]
    const mat = materials[Math.floor(random(materials.length))]
    const mesh = new THREE.Mesh(geom, mat)
    
    const lo = planeSize * 0.005
    const hi = planeSize * 0.25
    
    const sphere = randomSphere(tmp2, random(lo, hi))
    mesh.position.x = sphere[0]
    mesh.position.z = sphere[1]
    caster.ray.origin.set(mesh.position.x, 10, mesh.position.z)
    caster.ray.direction.set(0, -1, 0)
    const results = caster.intersectObject(groundToCast)

    if (results.length > 0) {
      mesh.position.copy(results[0].point)
      mesh.position.y += planeY
    } else { // will probably never get here
      mesh.position.y = planeY + sample(mesh.position.x, mesh.position.z)
    }

    mesh.rotation.x = random(-Math.PI * 2, Math.PI * 2)
    mesh.rotation.y = random(-Math.PI * 2, Math.PI * 2)
    mesh.rotation.z = random(-Math.PI * 2, Math.PI * 2)
    mesh.scale.multiplyScalar(random(0.01, 0.07))
    app.scene.add(mesh)

    const body = createPoint({
      position: mesh.position.toArray(),
      mass: random(0.1, 0.5),
      radius: Math.abs(mesh.position.y - planeY)
    })
    points.push(body)
    return mesh
  })
}
