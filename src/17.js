global.THREE = require('three')

import createWorld from 'verlet-system/3d'
import createConstraint from 'verlet-constraint/3d'
import createPoint from 'verlet-point/3d'
import createApp from './three-orbit-app'
import randomSphere from 'gl-vec3/random'
import subtract from 'gl-vec3/subtract'
import normalize from 'gl-vec3/normalize'
import scale3 from 'gl-vec3/scale'
import lerp from 'gl-vec3/lerp'
import newArray from 'new-array'
import flattenVertices from 'flatten-vertex-data'
import random from 'random-float'

const glslify = require('glslify')
const flattenArray = (a, b) => a.concat(b)

const app = createApp({
  antialias: true,
  scale: window.devicePixelRatio
})
app.renderer.setClearColor('#3d0e3b', 1)

const radius = 0.75
const segments = 20
const capacity = 100
const origin = [ 0, 0, 0 ]

const world = createWorld()
const groups = newArray(capacity).map(() => {
  let start = origin
  let end = randomSphere([], radius)
  return newArray(segments).map((x, i) => {
    const curStep = i % 2 === 0 ? i : (i + 1)
    const t = curStep / (segments - 1)
    const pt = createPoint({
      position: lerp([], start, end, t),
      mass: random(0.8, 1.0)
    })
    return pt
  })
})

const points = groups.reduce(flattenArray, [])

const constraints = groups.map(group => {
  const opt = { stiffness: 1 }
  const cGroup = []
  for (let i = group.length - 2; i >= 0; i--) {
    const c = createConstraint([ group[i], group[i + 1] ], opt)
    cGroup.push(c)
  }
  return cGroup
}).reduce(flattenArray, [])

const geometry = new THREE.BufferGeometry()
const vertices = new Float32Array(capacity * segments * 3)
const attrib = new THREE.BufferAttribute(vertices, 3)
geometry.addAttribute('position', attrib)
updatePoints()

const material = new THREE.RawShaderMaterial({
  vertexShader: glslify(__dirname + '/shaders/17.vert'),
  fragmentShader: glslify(__dirname + '/shaders/17.frag'),
  uniforms: {
    color: { type: 'c', value: new THREE.Color('#5be72b') },
    opacity: { type: 'f', value: 0.95 },
    radius: { type: 'f', value: radius }
  },
  wireframe: true,
  wireframeLinewidth: 1.25,
  depthTest: false,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  transparent: true
})

// Three r69 doesn't set this...
app.renderer.getContext().lineWidth(material.wireframeLinewidth)

const mesh = new THREE.Mesh(geometry, material)
app.scene.add(mesh)

window.addEventListener('click', forcePush)
window.addEventListener('touchend', forcePush)
forcePush()

app.on('tick', dt => {
  dt = Math.min(dt, 30) / 1000
  constraints.forEach(c => c.solve())

  // pin center
  groups.forEach(group => {
    group[0].place(origin)
  })

  world.integrate(points, dt)
  updatePoints()

  mesh.rotation.y += dt * 0.25
})

function updatePoints () {
  const positions = points.map(x => [
    x.position[0],
    x.position[1],
    x.position[2]
  ])
  flattenVertices(positions, vertices)
  attrib.needsUpdate = true
}

function forcePush () {
  groups.forEach(group => {
    const p1 = group[group.length - 1]
    const p2pos = randomSphere([], Math.random() * radius)
    const force = subtract([], p2pos, p1.position)
    normalize(force, force)
    for (let i = group.length - 2; i >= 0; i--) {
      group[i].addForce(scale3([], force, 0.009))
    }
  })
}
