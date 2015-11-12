var createLoop = require('canvas-loop')
var createControls = require('orbit-controls')
var assign = require('object-assign')
var DeviceOrientationControls = require('./gl/DeviceOrientationControls')
var once = require('once')

module.exports = createApp
function createApp (opt) {
  opt = assign({
    distance: 2,
    scale: Math.min(window.devicePixelRatio, 2)
  }, opt)
  
  var distance = typeof opt.distance === 'number' ? opt.distance : 5
  var canvas = opt.canvas
  if (!canvas) {
    canvas = document.createElement('canvas')
    document.body.appendChild(canvas)
  }
  
  var renderer = new THREE.WebGLRenderer(assign({}, opt, {
    canvas: canvas,
    devicePixelRatio: opt.scale
  }))
  
  renderer.setClearColor(0x000000, 1)
  
  const iPhone = /(iPhone|iPad)/i.test(navigator.userAgent)
  const tmp2 = [0, 0]
  
  // annoying bug which sometimes shows with content scrolled down on iPhone
  if (iPhone && window.innerWidth > window.innerHeight) {
    setTimeout(() => window.scrollTo(undefined, 0), 2000)
  }
  
  var app = createLoop(canvas, assign({
    parent: () => {
      // brutal bug with iPhone where the top/bottom status bars
      // will appear unless the canvas is at least + 1 px higher than window
      var off = (window.innerWidth > window.innerHeight && iPhone) ? 1 : 0
      tmp2[0] = window.innerWidth + off
      tmp2[1] = window.innerHeight + off
      return tmp2
    }
  }, opt))

  var target = new THREE.Vector3()
  var scene = new THREE.Scene()
  var fov = typeof opt.fov === 'number' ? opt.fov : 50
  var aspect = app.shape[0] / app.shape[1]
  var near = typeof opt.near === 'number' ? opt.near : 0.001
  var far = typeof opt.far === 'number' ? opt.far : 1000
  var camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
  camera.position.fromArray(opt.position || [ 0, 0, -distance ])
  
  var deviceOrientationControls = opt.deviceOrientationControls
  var controls
  if (deviceOrientationControls) {
    controls = new DeviceOrientationControls(camera)
  } else {
    controls = createControls(assign({}, opt, {
      canvas: canvas
    }))
  }
  
  app.on('tick', render)
  app.on('resize', resize)
  resize()

  canvas.addEventListener('touchstart', (ev) => ev.preventDefault())
  
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
    if (deviceOrientationControls) {
      controls.update()
    } else {
      var position = camera.position.toArray()
      var direction = target.toArray()
      controls.update(position, direction)
      camera.position.fromArray(position)
      camera.lookAt(target.fromArray(direction))
    }
  }
  
  function resize () {
    var width = app.shape[0]
    var height = app.shape[1]
    camera.aspect = width / height
    renderer.setSize(width, height)
    camera.updateProjectionMatrix()
  }
}

  