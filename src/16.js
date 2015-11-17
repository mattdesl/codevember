import audioDemo from './util/audio-demo-2d'
import { getAnalyserAverages } from './audio-util'
import bezierCurve from 'bezier-curve'

const curve = [
  [-0.9, 0],
  [-0.5, -0.5],
  [0.5, -0.5],
  [0.9, 0]
]
const controls = curve.slice(1).reduce((a, b) => a.concat(b), [])

const tracks = [
  'https://soundcloud.com/roman-mars/99-invisible-161-show-of-force',
  'https://soundcloud.com/roman-mars/184-rajneeshpuram',
  'https://soundcloud.com/roman-mars/99-invisible-110-structural-integrity',
  'https://soundcloud.com/roman-mars/99-invisible-167-voices-in-the-wire',
  'https://soundcloud.com/roman-mars/99-invisible-162-mystery-house'
]

const track = tracks[Math.floor(Math.random() * tracks.length)]
const demo = audioDemo(track)

demo.on('render', (context, analyser) => {
  const [ width, height ] = demo.shape

  // male speech - 85-180 Hz
  const avg = getAnalyserAverages(analyser, 85, 180)
  context.translate(width / 2, height / 2)
  
  const radius = Math.min(200, Math.min(width, height) / 2)
  context.scale(radius, radius)
  
  const point = bezierCurve(avg, curve)
  context.beginPath()
  context.lineWidth = 3 / radius
  context.lineCap = 'round'
  context.strokeStyle = '#ca211d'
  context.moveTo(0, 0.35)
  context.lineTo(...point)
  context.stroke()
  
  context.lineWidth = 5 / radius
  context.beginPath()
  context.moveTo(...curve[0])
  context.bezierCurveTo(...controls)
  context.strokeStyle = '#000'
  context.stroke()
})
  