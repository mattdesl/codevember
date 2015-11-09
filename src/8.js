const createAnalyser = require('web-audio-analyser')
const createLoop = require('canvas-loop')
const createCamera = require('perspective-camera')
const createContext = require('get-canvas-context')
const badge = require('soundcloud-badge')
const newArray = require('new-array')
const beats = require('beats')
const lerp = require('lerp')
const clamp = require('clamp')
const smoothstep = require('smoothstep')
import { freq2index, frequencyAverages } from './audio-util'

const AudioContext = window.AudioContext || window.webkitAudioContext
const isMobile = require('./is-mobile')()
if (!AudioContext) {
  alert('Only supported on Desktop Chrome/FF :(')
} else {
  badge({
    client_id: 'b95f61a90da961736c03f659c03cb0cc',
    song: 'https://soundcloud.com/jeantonique/guest-feat-iris',
    dark: false,
    getFonts: true
  }, ready)
}

function ready (err, src, data, div) {
  if (err) return alert('Only supported on Desktop Chrome/FF :(')

  const bgColor = '#da7c2c'
  const context = createContext('2d')
  const canvas = context.canvas
  document.body.appendChild(canvas)
  document.body.style.background = bgColor

  const app = createLoop(canvas, {
    parent: () => {
      return [
        Math.min(window.innerWidth, 640),
        clamp(window.innerHeight, 320, 420)
      ]
    },
    scale: Math.min(2, window.devicePixelRatio)
  }).on('tick', tick)

  const camera = createCamera({
    fov: Math.PI / 4,
    near: 0.01,
    far: 100
  })

  const audio = new Audio()
  audio.crossOrigin = 'Anonymous'
  audio.src = src
  audio.play()

  const analyser = createAnalyser(audio, { stereo: false })
  const sampleRate = analyser.ctx.sampleRate
  const fftSize = analyser.analyser.fftSize
  
  const getAverage = frequencyAverages(sampleRate, fftSize)
  
  let last = 0
  let difference = 50
  const capacity = 300
  const rows = 15
  const ranges = newArray(rows).map(() => [ last, last += difference ])
    
  const previousPositions = ranges.map(() => [])
  
  const bins = ranges.map(range => {
    return {
      lo: freq2index(range[0], sampleRate, fftSize),
      hi: freq2index(range[1], sampleRate, fftSize),
      threshold: 0,
      decay: 0.001
    }
  })

  const detect = beats(bins)

  app.start()

  let scroll = 0

  function tick (dt) {
    if (!audio.duration) return
    scroll += (dt / 1000) * 50

    const frequencies = analyser.frequencies()
    const result = detect(frequencies, dt)
    const time = audio.currentTime

    const [width, height] = app.shape
    const padding = 100

    canvas.style.left = ((window.innerWidth - width) / 2) + 'px'
    canvas.style.top = ((window.innerHeight - height) / 2) + 'px'

    camera.viewport[0] = padding
    camera.viewport[1] = padding
    camera.viewport[2] = width - padding * 2
    camera.viewport[3] = height - padding * 2

    camera.position[0] = time
    camera.position[1] = 0
    camera.position[2] = 8
    camera.update()

    context.save()
    context.scale(app.scale, app.scale)
    context.clearRect(0, 0, width, height)
    context.fillStyle = bgColor
    context.fillRect(0, 0, width, height)
    context.fillStyle = 'white'

    for (let i = 0; i < bins.length; i++) {
      if (result[i]) {
        const range = ranges[i]
        const avg = getAverage(frequencies, range[0], range[1])
        const t = clamp(smoothstep(0.65, 1, avg), 0, 1)
        const radius = lerp(1, 4, t)

        const previous = previousPositions[i]
        if (previous.length > capacity) {
          previous.shift()
        }
        const prevPoint = previous[previous.length - 1]
        if (!prevPoint || Math.abs(time - prevPoint[0]) > 0.01) {
          previous.push([ time, radius ])
        }
      }
    }

    for (let i = 0; i < previousPositions.length; i++) {
      const previous = previousPositions[i]
      for (let j = 0; j < previous.length; j++) {
        const p = previous[j]

        const y3d = (i / (bins.length - 1) * 2 - 1) * 4
        const p2d = camera.project([ p[0], y3d, 0 ])
        let x = p2d[0] + (width - padding * 2) / 2
        let y = p2d[1]

        const radius = p[1]
        context.globalAlpha = Math.max(0, (x - padding) / (padding + (width - padding * 2)))
        context.beginPath()
        context.arc(x, y, radius, 0, Math.PI * 2)
        context.fill()
      }
    }
    context.restore()
  }
}
