global.THREE = require('three')
var createOrbitViewer = require('three-orbit-viewer')(THREE)
var createText = require('three-bmfont-text')
var loadBMFont = require('load-bmfont')
var fatal = require('./fatal-error')()
var parallel = require('run-parallel')
var once = require('once')
var createSDF = require('./shaders/sdf')

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
  start(font, texture)
})

function start(font, texture) {
  var app = createOrbitViewer({
      clearColor: 'rgb(80, 80, 80)',
      clearAlpha: 1.0,
      fov: 65,
      position: new THREE.Vector3()
  })

  app.camera = new THREE.OrthographicCamera()
  app.camera.left = 0
  app.camera.top = 0
  app.camera.near = -100
  app.camera.far = 100

  var geom = createText({
    text: 'hello world',
    font: font,
    align: 'left',
    width: 700,
    flipY: texture.flipY
  })

  var material = new THREE.RawShaderMaterial(createSDF({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    depthTest: false,
    color: 'rgb(230, 230, 230)'
  }))

  var layout = geom.layout
  var text = new THREE.Mesh(geom, material)
  var padding = 20
  text.position.set(padding, layout.height + padding, 0)
    
  var textAnchor = new THREE.Object3D()
  textAnchor.add(text)
  textAnchor.scale.multiplyScalar(5)
  textAnchor.scale.multiplyScalar(1/(window.devicePixelRatio||1))
  app.scene.add(textAnchor)
  
  //update orthographic
  app.on('tick', function() {
    //update camera
    var width = app.engine.width
    var height = app.engine.height
    app.camera.right = width
    app.camera.bottom = height
    app.camera.updateProjectionMatrix()
  })
}