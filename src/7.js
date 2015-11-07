global.THREE = require('three')
const random = require('random-float')
const geoPieceRing = require('geo-piecering')
const geoArc = require('geo-arc')
const geoChevron = require('geo-chevron')
const createComplex = require('three-simplicial-complex')(THREE)
const createApp = require('./three-orbit-app')
const { PI } = Math

const app = createApp({
  distance: 7,
  position: [-2.9, 3.0, 3.5],
  near: 0.01,
  distanceBounds: [ 0.25, 10 ],
  far: 100
})

app.renderer.setClearColor(0x31a9ee, 1.0)

const colors = [ '#ffffff' ]
// '#9e9e9e', '#6d6d6d', '#414141'

const materials = [
  new THREE.MeshBasicMaterial({
    wireframe: true,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide
  }),
  new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide
  })
]
const meshes = []

function addCore () {
  addGeom(geoPieceRing({
    y: random(-3.5, 3),
    height: random(0.01, 1.0),
    radius: random(0.1, 1.5),
    numPieces: Math.floor(random(5, 20)),
    quadsPerPiece: 1,
    pieceSize: (PI * 2 ) * 1 / random(20, 40)
  }))

  const radius = random(0, 2)
  addGeom(geoArc({
    y: random(-3.5, 3),
    startRadian: random(-PI, PI),
    endRadian: random(-PI, PI),
    innerRadius: radius,
    outerRadius: radius + random(0.05, 0.15),
    numBands: 4,
    numSlices: 90,
  }))
}

function addArrows (offset) {
  return addGeom(geoChevron({
    startRadian: 0,
    width: 1,
    depth: 1,
    thickness: 0.5
  }), { offset: offset, mirror: true, material: new THREE.MeshBasicMaterial({
    color: 0xffffff, side: THREE.DoubleSide
  }) })
}

const arrows = addArrows(3)
arrows.rotationFactor = 0.1

for (var i=0; i<32; i++) {
  addCore()  
}

function addGeom (complex, opt) {
  opt = opt || {}
  const geom = createComplex(complex)
  
  let mat
  if (opt.material) {
    mat = opt.material
  } else {
    mat = materials[Math.floor(Math.random() * materials.length)].clone()
    mat.color.set(colors[Math.floor(Math.random() * colors.length)])
    mat.opacity = random(0.5, 1.0)
  }
  
  let mesh = new THREE.Mesh(geom, mat)
  mesh.position.fromArray(opt.position || [0, 0, 0])

  if (opt.mirror) {
    const offset = opt.offset || 0
    const group = new THREE.Object3D()
    for (var i=0; i<4; i++) {
      const a = PI * 2 * (i / 4)
      const m2 = mesh.clone()
      m2.rotation.y = -a
      m2.position.x = Math.cos(a) * offset 
      m2.position.z = Math.sin(a) * offset
      group.add(m2)
    }
    meshes.push(group)
    mesh = group
  } else {
    meshes.push(mesh)
  }
  mesh.rotationFactor = random(-1, 1)
  return mesh
}

meshes.forEach(m => app.scene.add(m))

app.on('tick', (dt) => {
  meshes.forEach((m, i) => {
    m.rotation.y += (dt/1000) * m.rotationFactor
  })
})