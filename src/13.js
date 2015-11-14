import createLoop from 'canvas-loop'
import soundcloud from 'soundcloud-badge'
import random from 'random-float'
import desktopOnly from './desktop-only'
import createAnalyser from 'web-audio-analyser'
import newArray from 'new-array'
import parallel from 'run-parallel'
import loadImage from 'img'
import error from './fatal-error'
import beats from 'beats'
import { freq2index } from './audio-util'
import SimplexNoise from 'simplex-noise'

const AudioContext = window.AudioContext || window.webkitAudioContext

// dumb mobile test
const isMobile = /(iPad|iPhone|Android)/i.test(navigator.userAgent)
const simplex = new SimplexNoise()

if (isMobile || !AudioContext) {
  desktopOnly()
} else {
  parallel([
    (next) => {
      loadImage('assets/paper.png', next)
    },
    (next) => {
      soundcloud({
        client_id: 'b95f61a90da961736c03f659c03cb0cc',
        song: 'https://soundcloud.com/partyomo/partynextdoor-kehlanis-freestyle',
        dark: true,
        getFonts: true
      }, (err, src, data, div) => {
        if (err) return next(err)
        next(null, { src, data, div })
      })
    }
  ], onload)
}

function onload (err, [image, audioResult]) {
  if (err) return error(err)
  const { src, div } = audioResult
  const audio = new window.Audio()
  audio.crossOrigin = 'Anonymous'
  audio.src = src

  const analyser = createAnalyser(audio, { stereo: false })
  const analyserNode = analyser.analyser
  const sampleRate = analyser.ctx.sampleRate
  const fftSize = analyserNode.fftSize
  audio.play()

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  document.body.insertBefore(canvas, div)
  document.body.style.margin = '0'
  document.body.style.overflow = 'hidden'

  const detect = beats([ {
    lo: freq2index(50, sampleRate, fftSize),
    hi: freq2index(100, sampleRate, fftSize),
    threshold: 0,
    decay: 0.001
  }, {
    lo: freq2index(2000, sampleRate, fftSize),
    hi: freq2index(2500, sampleRate, fftSize),
    threshold: 0,
    decay: 0.01
  } ])

  const pattern = ctx.createPattern(image, 'repeat')
  const padding = 10
  const app = createLoop(canvas, {
    parent: () => {
      return [
        window.innerWidth - padding * 2,
        window.innerHeight - padding * 2
      ]
    },
    scale: Math.min(2, window.devicePixelRatio)
  })

  const types = [ 'arc', 'square' ]
  const colors = [ '#da7a33', '#33da95' ]
  const bodies = newArray(500).map((_, i) => {
    return {
      position: [ random(-1, 1), random(-1, 1) ],
      type: types[Math.floor(random(1) * types.length)],
      color: colors[Math.floor(random(1) * colors.length)],
      fill: random(1) > 0.5,
      thickness: random(0.5, 2.5),
      arc: random(1) < (1 / types.length) ? random(Math.PI) : (Math.PI * 2),
      radius: random(0.01, 0.02),
      rotation: random(-Math.PI, Math.PI)
    }
  })

  let time = 0
  app.start().on('tick', render)

  function render (dt) {
    if (!audio.duration) return
    time += Math.min(dt, 30) / 1000

    const frequencies = analyser.frequencies()
    const result = detect(frequencies, dt)

    const [width, height] = app.shape
    const scale = app.scale
    ctx.save()
    ctx.scale(scale, scale)
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = pattern
    ctx.fillRect(0, 0, width, height)
    ctx.translate(width / 2, height / 2)

    const note = result[0] / 255
    const size = Math.max(width, height) / 2 + note * 5

    ctx.scale(size, size)
    bodies.forEach(body => {
      ctx.lineWidth = body.thickness / size
      renderBody(body, result)
    })

    ctx.restore()

    canvas.style.left = ((window.innerWidth - width) / 2) + 'px'
    canvas.style.top = ((window.innerHeight - height) / 2) + 'px'
  }

  function renderBody (body, notes) {
    let [x, y] = body.position
    body.rotation += 0.02 * body.radius

    body.position[0] += 0.01 * simplex.noise3D(x * 2, y * 2, time) * notes[0] / 255
    body.position[1] += 0.01 * simplex.noise3D(x * 2, y * 2, time) * notes[0] / 255

    let { radius, rotation } = body
    radius += simplex.noise3D(x * 10, y * 10, notes[1] / 255) * 0.01

    ctx.rotate(rotation)
    ctx.beginPath()
    if (body.type === 'arc') {
      ctx.arc(x, y, radius, 0, body.arc)
    } else {
      ctx.rect(x - radius, y - radius, radius * 2, radius * 2)
    }
    ctx.fillStyle = ctx.strokeStyle = body.color
    if (body.fill) ctx.fill()
    else ctx.stroke()
    ctx.rotate(-rotation)
  }
}
