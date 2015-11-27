global.THREE = require('three')
const createOrbit = require('./three-orbit-app')
const createText = require('three-bmfont-text')
const loadBMFont = require('load-bmfont')
const fatal = require('./fatal-error')()
const parallel = require('run-parallel')
const once = require('once')
const glslify = require('glslify')
const marvel = require('marvel-characters/characters.json')
const shuffle = require('array-shuffle')

parallel([
  (next) => loadBMFont('assets/KelsonSans.fnt', next),
  (next) => {
    next = once(next)
    THREE.ImageUtils.loadTexture('assets/KelsonSans.png', undefined,
      (tex) => next(null, tex),
      (err) => next(err))
  }
], (err, [font, texture]) => {
  if (err) return fatal(err)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  start(font, texture)
})

function start (font, texture) {
  const app = createOrbit({
    position: [0, 0, 1],
    near: 0.01,
    antialias: false,
    scale: Math.min(2, window.devicePixelRatio),
    distance: 60,
    far: 1000
  })
  app.renderer.setClearColor(0xffffff, 1)

  const textOpts = {
    text: '',
    width: 500,
    letterSpacing: -5,
    lineHeight: 20,
    font: font,
    align: 'center',
    flipY: texture.flipY
  }
  const geom = createText(textOpts)

  const material = new THREE.RawShaderMaterial({
    uniforms: {
      opacity: { type: 'f', value: 1 },
      color: { type: 'c', value: new THREE.Color('#000') },
      map: { type: 't', value: texture },
      iGlobalTime: { type: 'f', value: 0 },
      textSize: { type: 'v2', value: new THREE.Vector2() },
    },
    vertexShader: glslify(__dirname + '/shaders/23.vert'),
    fragmentShader: glslify(__dirname + '/shaders/23.frag'),
    map: texture,
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: false,
    depthTest: false,
    color: 'rgb(230, 230, 230)'
  })

  var text = new THREE.Mesh(geom, material)

  var textAnchor = new THREE.Object3D()
  textAnchor.add(text)
  app.scene.add(textAnchor)

  const scalar = -0.1
  textAnchor.scale.set(-scalar, scalar, scalar)

  let time = 0
  app.on('tick', function (dt) {
    time += dt / 1000
    material.uniforms.iGlobalTime.value = time
  })

  updateText(shuffle(marvel).slice(0, 100).join(', '))

  function updateText (copy) {
    textOpts.text = copy.toLowerCase()
    geom.update(textOpts)
    const layout = geom.layout
    text.position.set(-layout.width / 2, layout.height / 2, 0)
    console.log(layout.width, layout.height)
    material.uniforms.textSize.value.set(layout.width, layout.height)
  }
}
