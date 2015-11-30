global.THREE = require('three')

const createBackground = require('./gl/three-vignette-background')
const unindex = require('./gl/unindex-geometry')
const error = require('./fatal-error')()
const glslify = require('glslify')
const threeHdrTexture = require('./gl/three-hdr-texture')
const randomSphere = require('gl-vec3/random')
const runParallel = require('run-parallel')
const isMobile = require('./is-mobile')()

const app = require('./three-orbit-app')({
  distance: 5,
  distanceBounds: [ 3, 100 ]
})
const ext = app.renderer.getContext().getExtension('OES_standard_derivatives')
if (!ext) {
  error(`This device does not support OES_standard_derivatives`)
}

let material
const bg = createBackground()
app.scene.add(bg)

updateBackground()

runParallel([
  (next) => threeHdrTexture('assets/apartment/Apartment_Reflection.hdr', next),
  (next) => threeHdrTexture('assets/apartment/Apartment_Diffuse.hdr', next),
  (next) => loadTexture('assets/burlap-normals.jpg', next)
], (err, textures) => {
  if (err) return error(err)

  const segs = isMobile ? 50 : 128
  let geometry = new THREE.SphereGeometry(1, segs, segs / 2)
  geometry = unindex(geometry)

  const randomDirections = geometry.faces.map(face => {
    const tmp = randomSphere([], 1)
    const center = new THREE.Vector3().fromArray(tmp)
    return [
      center, center, center
    ]
  }).reduce((a, b) => a.concat(b), [])

  material = createMaterial({
    randomDirection: { type: 'v3', value: randomDirections }
  })

  const [ map, diffuseMap, normalMap ] = textures
  textures.forEach(setTextureParams)
  material.uniforms.map.value = map
  material.uniforms.diffuseMap.value = diffuseMap
  material.uniforms.normalMap.value = normalMap

  const mesh = new THREE.Mesh(geometry, material)
  app.scene.add(mesh)
})

let time = 0
app.on('tick', (dt) => {
  time += dt / 1000
  if (material) material.uniforms.iGlobalTime.value = time
  updateBackground()
})

function updateBackground () {
  const [ width, height ] = app.shape
  bg.style({
    aspect: width / height,
    grainScale: 1.5 / Math.min(width, height),
    colors: [ '#6d87a0', '#082b1b' ]
  })
}

function setTextureParams (map) {
  map.generateMipmaps = false
  map.minFilter = THREE.LinearFilter
  map.magFilter = THREE.LinearFilter
  map.anisotropy = app.renderer.getMaxAnisotropy()
  map.wrapS = THREE.RepeatWrapping
  map.wrapT = THREE.RepeatWrapping
}

function createMaterial (attrib) {
  return new THREE.RawShaderMaterial({
    attributes: attrib,
    uniforms: {
      map: { type: 't', value: new THREE.Texture() },
      normalMap: { type: 't', value: new THREE.Texture() },
      diffuseMap: { type: 't', value: new THREE.Texture() },
      opacity: { type: 'f', value: 1 },
      iGlobalTime: { type: 'f', value: 0 },
      color: { type: 'c', value: new THREE.Color() }
    },
    shading: THREE.SmoothShading,
    vertexShader: glslify(__dirname + '/shaders/29.vert'),
    fragmentShader: glslify(__dirname + '/shaders/29.frag')
  })
}

function loadTexture (src, next) {
  THREE.ImageUtils.loadTexture(src, undefined, tex => {
    next(null, tex)
  }, () => {
    next(new Error(`could not load asset ${src}`))
  })
}
