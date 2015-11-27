window.THREE = require('three')
window._typeface_js = { faces: THREE.FontUtils.faces, loadFace: THREE.FontUtils.loadFace }
THREE.typeface_js = window._typeface_js

const googleEquirect = require('google-panorama-equirectangular')
const googlePano = require('google-panorama-by-location')
const error = require('./fatal-error')()
const simplex = new (require('simplex-noise'))()
require('./gl/helvetiker.typeface')()
const mouse = require('touch-position')()

const app = require('./three-orbit-app')({
  position: [0, 0, 0.00001],
  near: 0.01,
  far: 10000,
  fov: 56,
  zoom: false,
  alpha: false,
  rotateSpeed: 0.15,
  distanceBounds: [0, 10],
  distance: 0,
  pinch: false
})

const cubeCamera = new THREE.CubeCamera(1, 1000, 256)
app.scene.add(cubeCamera)

const cubeTarget = cubeCamera.renderTarget
const geometry = new THREE.SphereGeometry(1000, 32, 32)

const mat4 = new THREE.Matrix4().makeRotationY(Math.PI / 2)
mat4.scale(new THREE.Vector3(-1, 1, 1))
geometry.applyMatrix(mat4)

const material = new THREE.MeshBasicMaterial({
  map: new THREE.Texture(),
  side: THREE.DoubleSide
})

const panosphere = new THREE.Mesh(geometry, material)
app.scene.add(panosphere)

const envMaterial = new THREE.MeshBasicMaterial({
  side: THREE.DoubleSide,
  envMap: cubeTarget,
  reflectivity: 0.8,
  combine: THREE.MultiplyOperation
})

let mesh, textGeo, textMesh
app.on('tick', dt => {
  const x = 0.1 * ((mouse[0] / window.innerWidth) * 2 - 1)
  const y = 0.1 * ((mouse[1] / window.innerHeight) * 2 - 1)
  if (textMesh) textMesh.rotation.y = x
  if (textMesh) textMesh.rotation.x = y
})

const list = [
  { location: [40.490026, -75.07292000000001], heading: -Math.PI },
  [0.203972, 37.45297400000004],
  { location: [30.185036, -84.724629], heading: Math.PI },
  { location: [41.403286, 2.1746729999999843], heading: Math.PI / 2 },
  [-26.9383, -68.74484799999999],
  { location: [-64.731934, -62.594516999999996], heading: Math.PI / 1.5 },
  { location: [27.175515, 78.04145199999994], heading: -Math.PI / 5 }
]
var uniqueRandomArray = require('unique-random-array')
var random = uniqueRandomArray(list)

newLocation(random())

function newLocation (item) {
  if (Array.isArray(item)) {
    item = { location: item, heading: 0 }
  }
  googlePano(item.location, (err, res) => {
    if (err) return error(err)
    const { id, tiles } = res
    panosphere.rotation.y = item.heading
    console.log([res.latitude, res.longitude])
    googleEquirect(id, {
      zoom: 3,
      tiles,
      crossOrigin: 'Anonymous'
    }).on('complete', image => {
      material.map.image = image
      material.map.needsUpdate = true
      cubeCamera.updateCubeMap(app.renderer, app.scene)
      updateText(res.location.description)
    })
  })
}

function updateText (text) {
  if (mesh) {
    app.scene.remove(mesh)
    textGeo.dispose()
  }

  textGeo = new THREE.TextGeometry(text, {
    size: 64,
    height: 2,
    curveSegments: 2,
    font: 'helvetiker',
    weight: 'normal',
    style: 'normal',
    bevelThickness: 4,
    bevelSize: 1.5,
    bevelEnabled: true
  })

  textGeo.computeBoundingBox()
  const mat4 = new THREE.Matrix4().makeTranslation(
    -(textGeo.boundingBox.max.x - textGeo.boundingBox.min.x) / 2,
    -(textGeo.boundingBox.max.y - textGeo.boundingBox.min.y) / 4,
    0
  )

  textGeo.applyMatrix(mat4)
  textGeo.computeFaceNormals()

  textMesh = new THREE.Mesh(textGeo, envMaterial)
  mesh = new THREE.Object3D()
  mesh.add(textMesh)
  app.scene.add(mesh)

  const heading = -Math.PI / 2
  const r = 650
  const x = Math.cos(heading) * r
  const z = Math.sin(heading) * r
  mesh.position.x = x
  mesh.position.z = z
}
