import loadImage from 'img'
import createErrorPage from './fatal-error'
import SimplexNoise from 'simplex-noise'
import randomInt from 'random-int'
import random from 'random-float'

const simplex = new SimplexNoise()
const error = createErrorPage()
const canvas = document.createElement('canvas')
document.body.appendChild(canvas)
const ctx = canvas.getContext('2d')

loadImage('assets/paper1-diffuse.jpg', (err, img) => {
  if (err) return error(err)
  const [ width, height ] = [ 450, 450 ]
  const scale = window.devicePixelRatio
  const pattern = ctx.createPattern(img, 'repeat')
  canvas.width = width * scale
  canvas.height = height * scale
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'

  render()
  window.addEventListener('touchend', render)
  window.addEventListener('click', render)
  
  function render () {
    ctx.save()
    ctx.scale(scale, scale)
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = pattern
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = 'black'
    draw()
  }

  function draw () {
    const blockCount = randomInt(10, 40)
    const blockSize = width / blockCount
    const cols = width / blockSize
    const count = blockCount * (height + blockCount * 2)
    const rows = Math.ceil(count / cols)
    const half = blockSize / 2
    ctx.beginPath()
    ctx.translate(half, half)
    for (let i = 0; i < (rows * cols); i++) {
      const x = Math.floor(i % cols) * blockSize
      const y = Math.floor(i / cols) * blockSize
      let s = random(0.01, 0.05)
      let n = simplex.noise3D(x * s, y * s, Date.now() / 1000)
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
      ctx.lineTo(x, y + blockSize / 2 * n)
    }
    ctx.lineWidth = 1.5
    ctx.lineJoin = 'round'
    ctx.globalAlpha = 0.95
    ctx.stroke()
    ctx.translate(-half, -half)
  }
})
