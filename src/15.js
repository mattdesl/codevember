global.THREE = require('three')
import createView from './three-orbit-app'
import desktopOnly from './desktop-only'
import isMobile from './is-mobile'
import unindex from 'unindex-mesh'
import reindex from 'mesh-reindex'
import quantize from 'quantize-vertices'
import rescale from 'rescale-vertices'
import getBounds from 'vertices-bounding-box'
import randomSphere from 'gl-vec3/random'
import parallel from 'run-parallel'
import meshData from 'snowden/lo'

const createComplex = require('three-simplicial-complex')(THREE)
const error = require('./fatal-error')()
const glslify = require('glslify')
const EffectComposer = require('three-effectcomposer')(THREE)
const PostShader = require('./shaders/15-post')

if (isMobile()) {
  desktopOnly()
  // const element = error(`
  //   <div>This demo may not perform well on mobile. Click
  //   <button class="continue">here</button> to continue.
  //   </div>`)
  // const cont = document.querySelector('.continue')
  //   console.log(element)
  
  // // cont.addEventListener('click', (ev) => {
  // //   // element.parentNode.removeChild(element)
  // //   // load()
  // // })
} else {
  load()
}

function load () {
  parallel([
    next => loadTexture('assets/15-lut.png', next),
    next => loadTexture('assets/dust.jpg', next)
  ], (err, [ lut, dust ]) => {
    if (err) {
      return error(err)
    }
    start3D(meshData, lut, dust)
  })
}

function start3D (meshData, lookup, dust) {
  let effects = []
  let time = 0

  const app = createView({
    distance: 7,
    antialias: false,
    scale: 1,
    distanceBounds: [1, 9],
    position: [0, 0, 4]
  })

  app.renderer.setClearColor('#181818', 1)

  let complex = reindex(unindex(meshData.positions, meshData.cells))
  const bbox = getBounds(complex.positions)
  complex.positions = quantize(complex.positions, 5)
  complex.positions = rescale(complex.positions, bbox)
  const geom = createComplex(complex)

  const attribs = []
  complex.cells.forEach(() => {
    const dir = new THREE.Vector3().fromArray(randomSphere([]))
    attribs.push(dir, dir, dir)
  })

  const mat = new THREE.RawShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    attributes: {
      direction: { type: 'v3', value: attribs }
    },
    uniforms: {
      mouse: { type: 'v3', value: new THREE.Vector3() },
      color: { type: 'c', value: new THREE.Color() },
      opacity: { type: 'f', value: 0.01 },
      mode: { type: 'i', value: 0 },
      iGlobalTime: { type: 'f', value: 0 }
    },
    depthTest: false,
    depthWrite: false,
    wireframe: true,
    blending: THREE.AdditiveBlending,
    fragmentShader: glslify(__dirname + '/shaders/15.frag'),
    vertexShader: glslify(__dirname + '/shaders/15.vert')
  })

  const mesh = new THREE.Mesh(geom, mat)
  app.scene.add(mesh)
  mesh.position.y = 0.25
  mesh.scale.multiplyScalar(0.35)

  setupPost()
  app.on('tick', (dt) => {
    time += dt / 1000
    mat.uniforms.iGlobalTime.value = time
    effects.forEach(effect => {
      if (effect.uniforms.resolution) effect.uniforms.resolution.value.set(app.shape[0], app.shape[1])
      if (effect.uniforms.iGlobalTime) effect.uniforms.iGlobalTime.value = time
      if (effect.uniforms.theta) effect.uniforms.theta.value = app.controls.theta
    })
  })

  function setupPost () {
    const composer = new EffectComposer(app.renderer)
    app.composer = composer

    composer.addPass(new EffectComposer.RenderPass(app.scene, app.camera))

    const post = new EffectComposer.ShaderPass(PostShader)
    effects.push(post)
    post.renderToScreen = true
    composer.addPass(post)

    effects.forEach(effect => {
      if (effect.uniforms.tLookup) effect.uniforms.tLookup.value = lookup
      if (effect.uniforms.tDust) effect.uniforms.tDust.value = dust
      if (effect.uniforms.dustResolution) {
        effect.uniforms.dustResolution.value.set(dust.image.width, dust.image.height)
      }
    })
  }
}

function loadTexture (path, cb) {
  cb = cb || noop
  THREE.ImageUtils.loadTexture(path, undefined, (tex) => {
    tex.minFilter = tex.magFilter = THREE.LinearFilter
    cb(null, tex)
  }, () => {
    cb(new Error('could not load ' + path))
  })
}
