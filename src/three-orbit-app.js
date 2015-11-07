var createLoop = require('canvas-loop')
var createControls = require('orbit-controls')
var assign = require('object-assign')

module.exports = createApp
function createApp (opt) {
  opt = assign({
    distance: 2
  }, opt)
  
  var distance = typeof opt.distance === 'number' ? opt.distance : 5
  var canvas = opt.canvas
  if (!canvas) {
    canvas = document.createElement('canvas')
    document.body.appendChild(canvas)
  }
  
  var controls = createControls(assign({}, opt, {
    canvas: canvas
  }))

  var renderer = new THREE.WebGLRenderer(assign({}, opt, {
    canvas: canvas,
    devicePixelRatio: typeof opt.devicePixelRatio === 'number' 
      ? opt.devicePixelRatio : window.devicePixelRatio
  }))
  
  renderer.setClearColor(0x000000, 1)
  
  var app = createLoop(canvas, opt)

  var target = new THREE.Vector3()
  var scene = new THREE.Scene()
  var fov = typeof opt.fov === 'number' ? opt.fov : 50
  var aspect = app.shape[0] / app.shape[1]
  var near = typeof opt.near === 'number' ? opt.near : 0.001
  var far = typeof opt.far === 'number' ? opt.far : 1000
  var camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
  camera.position.fromArray(opt.position || [ 0, 0, -distance ])
  
  app.on('tick', render)
  app.on('resize', resize)
  resize()
  
  app.scene = scene
  app.camera = camera
  app.controls = controls
  app.renderer = renderer
  app.render = render
  app.resize = resize
  app.target = target
    
  return app.start()
  
  function render () {
    updateControls()
    renderer.render(scene, camera)
  }
  
  function updateControls () {
    var position = camera.position.toArray()
    var direction = target.toArray()
    controls.update(position, direction)
    camera.position.fromArray(position)
    camera.lookAt(target.fromArray(direction))
  }
  
  function resize () {
    var width = app.shape[0]
    var height = app.shape[1]
    camera.aspect = width / height
    renderer.setSize(width, height)
    camera.updateProjectionMatrix()
  }
}

  