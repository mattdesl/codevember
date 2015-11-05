const getContext = require('get-canvas-context')
const triangle = require('a-big-triangle')
const createTexture = require('gl-texture2d')
const createShader = require('gl-shader')
const loadImage = require('img')
const createApp = require('canvas-loop')
const mapLimit = require('map-limit')
const mouse = require('touch-position')()
const clamp = require('clamp')
const words = require('superb').words.filter(x => x.length <= 5)

const glslify = require('glslify')
const frag = glslify('./shaders/5.frag')
const vert = glslify('./shaders/5.vert')

const size = 256
const gl = getContext('webgl')
const canvas = gl.canvas

document.body.appendChild(canvas)

canvas.addEventListener('touchstart', ev => ev.preventDefault())

const shader = createShader(gl, vert, frag)

let textures
const presets = [
  ['assets/3.jpg', 'assets/glass.jpg']
]

let ptr = 0
load(...presets[ptr++], start)
const click = () => load(...presets[ptr++ % presets.length])

window.addEventListener('click', click)
window.addEventListener('touchstart', click)

function load (background, displacement, cb) {
  if (textures) {
    textures.forEach(t => t.dispose())
  }
  mapLimit([ background, displacement ], 25, loadImage, (err, results) => {
    if (err) return alert(err.message)

    let backgroundImage = results[0]
    let displaceImage = results[1]
    
    if (ptr % 2 === 0) {
      const { width, height } = backgroundImage
      const ctx = getContext('2d', { width, height})
      const fontSize = 150
      ctx.font = fontSize + 'px "Noto Sans", Helvetica, sans-serif'
      ctx.fillStyle  = 'black'
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = 'white'
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      ctx.shadowColor = 'white'
      ctx.shadowBlur = 25
      ctx.fillText(words[ptr % words.length], width / 2, height / 2)
      displaceImage = ctx.canvas
    }

    textures = [ backgroundImage, displaceImage ].map(img => {
      const texture = createTexture(gl, img)
      texture.minFilter = gl.LINEAR
      texture.magFilter = gl.LINEAR
      texture.wrap = gl.REPEAT
      return texture
    })
    
    if (typeof cb === 'function') cb()
  })
}

  

function start () {
  createApp(canvas, {
    parent: () => [ size, size ],
    scale: 2
  }).on('tick', render).start()
}

function render () {
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  shader.bind()
  shader.uniforms.colorBuffer = 0
  shader.uniforms.displacement = 1
  
  const scale = 0.05
  shader.uniforms.offset = [
    clamp(scale * ((mouse[0] / window.innerWidth) * 2.0 - 1.0), -0.25, 0.25),
    clamp(scale * ((mouse[1] / window.innerHeight) * 2.0 - 1.0), -0.25, 0.25)
  ]

  canvas.style.left = Math.round((window.innerWidth - size) / 2) + 'px'
  canvas.style.top = Math.round((window.innerHeight - size) / 2) + 'px'
  textures.forEach((x, i) => x.bind(i))
  triangle(gl)
}
