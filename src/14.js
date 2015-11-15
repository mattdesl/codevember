global.THREE = require('three')
import createView from './three-orbit-app'
import createErrorPage from './fatal-error'
import isMobile from './is-mobile'
import injectDefines from 'glsl-inject-defines'

const error = createErrorPage()
const mobile = isMobile()
const glslify = require('glslify')
const EffectComposer = require('three-effectcomposer')(THREE)
const fxaa = require('three-shader-fxaa')(THREE)
const PostShader = require('./shaders/14-post')

const app = createView({
  distance: 7,
  scale: mobile ? 1 : undefined,
  position: [0, 0, 4],
  antialias: false,
  alpha: false
})

app.renderer.setClearColor(mobile ? 0x252525 : 0x121212, 1)

const geometries = [
  new THREE.TorusKnotGeometry(1, 0.85, 4, 5, 5, 24),
  new THREE.TorusKnotGeometry(1, 0.5, 64, 32, 6, 24),
  new THREE.TorusKnotGeometry(1, 0.85, 24, 5, 16, 24),
  new THREE.TorusKnotGeometry(1, 0.5, 64, 32, 14, 24),
  new THREE.TorusKnotGeometry(1, 0.4, 64, 20, 4, 24),
  new THREE.TorusKnotGeometry(1, 0.2, 50, 14, 3, 24)
]

let ptr = mobile ? 1 : 0
const fragShader = glslify(__dirname + '/shaders/14.frag')
const defines = {}
if (!mobile) defines.DESKTOP = true

const mat = new THREE.RawShaderMaterial({
  color: 0xffffff,
  transparent: true,
  side: THREE.DoubleSide,
  uniforms: {
    color: { type: 'c', value: new THREE.Color() },
    opacity: { type: 'f', value: 1 },
    mode: { type: 'i', value: 0 },
    iGlobalTime: { type: 'f', value: 0 }
  },
  fragmentShader: injectDefines(fragShader, defines),
  vertexShader: glslify(__dirname + '/shaders/14.vert')
})

const meshes = geometries.map(x => new THREE.Mesh(x, mat))
meshes.forEach((mesh, i) => {
  mesh.visible = i === ptr
  app.scene.add(mesh)
})

app.canvas.addEventListener('click', onClick)
app.canvas.addEventListener('touchstart', onClick)

function onClick (ev) {
  ev.preventDefault()
  meshes[ptr].visible = false
  ptr = (ptr + 1) % meshes.length
  meshes[ptr].visible = true
  mat.uniforms.mode.value = Math.round(Math.random())
}

let effects = []
let time = 0

if (!mobile) {
  setupPost()
}

app.on('tick', (dt) => {
  time += dt / 1000
  mat.uniforms.iGlobalTime.value = time

  effects.forEach(effect => {
    if (effect.uniforms.resolution) effect.uniforms.resolution.value.set(app.shape[0], app.shape[1])
    if (effect.uniforms.iGlobalTime) effect.uniforms.iGlobalTime.value = time
  })
})

function setupPost () {
  app.stop()
  
  const composer = new EffectComposer(app.renderer)
  app.composer = composer

  composer.addPass(new EffectComposer.RenderPass(app.scene, app.camera))

  const fxaaPass = new EffectComposer.ShaderPass(fxaa())
  effects.push(fxaaPass)
  composer.addPass(fxaaPass)

  const post = new EffectComposer.ShaderPass(PostShader)
  effects.push(post)
  post.renderToScreen = true
  composer.addPass(post)
  
  THREE.ImageUtils.loadTexture('assets/14-lut.png', undefined, (tex) => {
    tex.minFilter = tex.magFilter = THREE.LinearFilter
    effects.forEach(effect => {
      if (effect.uniforms.tLookup) {
        effect.uniforms.tLookup.value = tex
      }
    })
    app.start()
  }, error)

}
