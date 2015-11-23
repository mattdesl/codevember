global.THREE = require('three')
const createOrbit = require('./three-orbit-app')
const createText = require('three-bmfont-text')
const loadBMFont = require('load-bmfont')
const fatal = require('./fatal-error')()
const parallel = require('run-parallel')
const once = require('once')
const glslify = require('glslify')

parallel([
  (next) => loadBMFont('assets/KelsonSans.fnt', next),
  (next) => {
    next = once(next)
    THREE.ImageUtils.loadTexture('assets/KelsonSans.png', undefined,
      (tex) => next(null, tex),
      (err) => next(err))
  }
], (err, [ font, texture ]) => {
  if (err) return fatal(err)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  start(font, texture)
})

function start(font, texture) {
  const app = createOrbit({
    position: [-0.25, 0.5, 1],
    near: 0.01,
    distance: 12,
    far: 1000
  })
  
  app.renderer.setClearColor(0xffffff, 1)
  
  // app.camera = new THREE.OrthographicCamera()
  // app.camera.left = 0
  // app.camera.top = 0
  // app.camera.near = -100
  // app.camera.far = 100

  var geom = createText({
    text: 'lorem ipsum',
    font: font,
    align: 'center',
    // width: 700,
    flipY: texture.flipY
  })

  var material = new THREE.RawShaderMaterial({
    uniforms: {
      opacity: { type: 'f', value: 1 },
      color: { type: 'c', value: new THREE.Color('#000') },
      map: { type: 't', value: texture },
      iGlobalTime: { type: 'f', value: 0 },
      iResolution: { type: 'v2', value: new THREE.Vector2() }
    },
    vertexShader: glslify(__dirname + '/shaders/23.vert'),
    fragmentShader: glslify(__dirname + '/shaders/23.frag'),
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    depthTest: false,
    color: 'rgb(230, 230, 230)'
  })

  var layout = geom.layout
  var text = new THREE.Mesh(geom, material)
  // var padding = 20
  text.position.set(-layout.width / 2, 0, 0)
  
  var textAnchor = new THREE.Object3D()
  textAnchor.add(text)
  app.scene.add(textAnchor)
  
  const scalar = -0.1
  textAnchor.scale.set(-scalar, scalar, scalar)
  // textAnchor.lookAt(app.camera.position)
  // textAnchor.scale.multiplyScalar(5)
  // textAnchor.scale.multiplyScalar(1/(window.devicePixelRatio||1))
  
  let time = 0
  //update orthographic
  app.on('tick', function(dt) {
    time += dt / 1000
    
    material.uniforms.iGlobalTime.value = time
    
    //update camera
    // var width = app.engine.width
    // var height = app.engine.height
    // app.camera.right = width
    // app.camera.bottom = height
    // app.camera.updateProjectionMatrix()
  })
}