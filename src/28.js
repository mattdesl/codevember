global.THREE = require('three')

const createBackground = require('./gl/three-vignette-background')
const googlePano = require('google-panorama-by-location')
const googleEquirect = require('google-panorama-equirectangular')
const qs = require('query-string')
const error = require('./fatal-error')()
const glslify = require('glslify')

const app = require('./three-orbit-app')({
  distance: 4
})

document.querySelector('.loader').style.display = 'none'

const potCanvas = document.createElement('canvas')
potCanvas.width = 1024
potCanvas.height = potCanvas.width / 2
const potCtx = potCanvas.getContext('2d')

const bg = createBackground()
app.scene.add(bg)

let time = 0
app.on('tick', (dt) => {
  time += dt / 1000

  const [ width, height ] = app.shape
  bg.style({
    aspect: width / height
  })
})

const smooth = qs.parse(window.location.search).smooth === 'true'
const geometry = new THREE.TorusKnotGeometry(0.45, 0.25, 128, 256)
const material = createMaterial(!smooth)

const mesh = new THREE.Mesh(geometry, material)
app.scene.add(mesh)

const random = require('unique-random-array')([
  [14.584186, 120.979963],
  [27.175515, 78.04145199999994],
  [10.642237, 122.23580400000003],
  [17.571335, 120.388777],
  [68.196537, 13.531821000000036],
  [0.203972, 37.45297400000004],
  [30.185036, -84.724629],
  [41.403286, 2.1746729999999843],
  [60.070408, 6.542394000000058]
])

mesh.visible = false
setScene(random())

setInterval(function () {
  setScene(random())
}, 2000)

function setScene (location) {
  googlePano(location, (err, res) => {
    if (err) return error(err)
    const { id, tiles } = res
    console.log([res.latitude, res.longitude])
    googleEquirect(id, {
      zoom: 2,
      tiles,
      crossOrigin: 'Anonymous'
    }).on('complete', image => {
      potCtx.clearRect(0, 0, potCanvas.width, potCanvas.height)
      potCtx.drawImage(image, 0, 0, potCanvas.width, potCanvas.height)

      const material = mesh.material
      const tex = material.uniforms.map.value
      tex.generateMipmaps = true
      tex.minFilter = THREE.LinearMipMapLinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping
      tex.image = potCanvas
      tex.needsUpdate = true
      mesh.visible = true
    })
  })
}

function createMaterial (flat) {
  return new THREE.RawShaderMaterial({
    uniforms: {
      map: { type: 't', value: new THREE.Texture() },
      opacity: { type: 'f', value: 1 },
      color: { type: 'c', value: new THREE.Color() }
    },
    shading: flat ? THREE.FlatShading : THREE.SmoothShading,
    vertexShader: glslify(__dirname + '/shaders/28.vert'),
    fragmentShader: glslify(__dirname + '/shaders/28.frag')
  })
}