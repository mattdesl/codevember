global.THREE = require('three')

const qs = require('query-string')
const touches = require('touches')

const query = qs.parse(window.location.search)
const interactive = String(query.interactive) !== 'false'

const Line = require('./gl/ThreeLine25D')(THREE)
const glslify = require('glslify')

const sphere = require('icosphere')(2)
const triangulate = require('delaunay-triangulate')

var app = require('./three-orbit-app')({
  // rotate: false,
  position: [ 0, 0, -1 ],
  distance: 3,
  distanceBounds: [ 1, 100 ],
  antialias: true,
  zoom: interactive,
  rotate: interactive
})
app.renderer.setClearColor('#dd6524', 1)

const cells = triangulate(sphere.positions)
const path = cells.map(cell => {
  const [a, b, c] = cell
  return [
    sphere.positions[a],
    sphere.positions[b],
    sphere.positions[c]
  ]
}).reduce((a, b) => a.concat(b), [])

// create our geometry
const outerGeo = Line(sphere.positions)
const innerGeo = Line(path)

// create a material using a basic shader
var material = createMaterial()
material.uniforms.thickness.value = 0.2

const outer = new THREE.Mesh(outerGeo, material)
app.scene.add(outer)

const material2 = createMaterial()
material2.uniforms.opacity.value = 0.5
material2.uniforms.thickness.value = 0.15
material2.uniforms.color.value.setStyle('#6c180d')

const inner = new THREE.Mesh(innerGeo, material2)
inner.scale.multiplyScalar(0.75)
app.scene.add(inner)

let time = 0
app.on('tick', dt => {
  dt = Math.min(dt, 30)
  dt /= 1000
  time += dt

  inner.rotation.y -= Math.sin(time * 0.001) * 0.001
  outer.rotation.y += dt * 0.1
  outer.rotation.x += dt * 0.05

  material.uniforms.iGlobalTime.value = time
  material2.uniforms.iGlobalTime.value = time
})



if (!interactive) {
  app.once('tick', () => {
    app.stop()
  })

  touches(window, { filtered: true }).on('start', ev => {
    app.start()
  }).on('end', ev => {
    app.stop()
  })
}

function createMaterial () {
  return new THREE.RawShaderMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    uniforms: {
      aspect: { type: 'f', value: 1 },
      thickness: { type: 'f', value: 0.01 },
      opacity: { type: 'f', value: 1 },
      iGlobalTime: { type: 'f', value: 0 },
      color: { type: 'c', value: new THREE.Color('#fff') }
    },
    attributes: {
      lineMiter: { type: 'f', value: 0 },
      lineNormal: { type: 'v2', value: new THREE.Vector2() }
    },
    vertexShader: glslify(__dirname + '/shaders/27.vert'),
    fragmentShader: glslify(__dirname + '/shaders/27.frag')
  })
}
