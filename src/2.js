const clamp = require('clamp')
const createPoint = require('verlet-point/3d')
const createTouch = require('touches')
const colorStyle = require('color-style')
const newArray = require('new-array')
const random = require('random-float')
const distance = require('gl-vec2/distance')

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const surface = document.createElement('canvas')
const surfaceCtx = surface.getContext('2d')
const lowEnd = require('./is-low-end')()

const padding = 20
const app = require('canvas-loop')(ctx.canvas, {
  parent: function () {
    return [
      window.innerWidth - padding * 2,
      window.innerHeight - padding * 2
    ]
  },
  scale: Math.min(2, window.devicePixelRatio)
})

let lastPosition = [0, 0]
let lastSplatPosition = [0, 0]
let first = true
let dragging = false

createTouch(window, { target: canvas, filtered: true })
  .on('start', (ev, pos) => {
    ev.preventDefault()
    dragging = true
    lastPosition = pos.slice()
    lastSplatPosition = lastPosition.slice()
  })
  .on('move', (ev, pos) => {
    if (!dragging) return

    if (first) {
      first = false
      lastPosition = pos.slice()
      lastSplatPosition = pos.slice()
      return
    }

    if (distance(pos, lastSplatPosition) >= 5) {
      splat(pos, lastPosition)
      lastSplatPosition[0] = pos[0]
      lastSplatPosition[1] = pos[1]
    }
    lastPosition[0] = pos[0]
    lastPosition[1] = pos[1]
  })
  .on('end', () => {
    dragging = false
  })

const world = require('verlet-system/3d')({
  gravity: [0, 0, -100],
  friction: 0.99,
  bounce: 0.5,
  min: [null, null, 0]
})

const color = colorStyle.hsl([ 0, 50, 25 ]) // hsl
const points = []

canvas.style.margin = padding + 'px'
app.start()
app.once('tick', () => {
  const [ width, height ] = app.shape
  surface.width = width * app.scale
  surface.height = height * app.scale
  surfaceCtx.scale(app.scale, app.scale)
  surfaceCtx.clearRect(0, 0, width, height)
  surfaceCtx.fillStyle = '#dedede'
  surfaceCtx.fillRect(0, 0, width, height)
})
app.on('tick', tick)

function addPoints (n, origin, prevPos) {
  const hiOff = Math.random() > 0.9 ? random(30, 40) : random(0.5, 1)
  const offsetScale = random(0.05, hiOff)
  
  const newPoints = newArray(n).map(() => {
    const offset = Math.random() * offsetScale
    const newPosition = origin.slice()
    const angle = Math.random() * Math.PI * 2
    newPosition[0] += Math.cos(angle) * offset
    newPosition[1] += Math.sin(angle) * offset
    newPosition[2] = random(0.15, 3)
    
    const point = createPoint({ position: newPosition })
    point.size = random(0.015, 2.5)
    point.active = true
    point.mass = random(0.8, 1.0)
    point.type = Math.floor(random(0, 2))
    point.bounces = Math.random() > 0.75 ? Math.floor(random(1, 3)) : 0
    point.alpha = random(0.8, 1.0)
    
    const force = Math.random() * 0.3
    point.addForce([
      force * (Math.random() * 2 - 1),
      force * (Math.random() * 2 - 1),
      0
    ])
    
    const scl = 0.25
    const max = 10
    point.addForce([
      -clamp((prevPos[0] - origin[0]) * scl, -max, max),
      -clamp((prevPos[1] - origin[1]) * scl, -max, max),
      -Math.random() * 0.05
    ])
    return point
  })
  
  newPoints.forEach(x => points.push(x))
  return newPoints
}

function splat (position, lastPosition) {
  const capacity = lowEnd ? 150 : 800
  const amount = Math.floor(random(10, 150))
  const count = clamp(capacity - points.length, 0, amount)
  if (count === 0) return
  addPoints(count, position, lastPosition)
}

function tick (dt) {
  dt = Math.min(30, dt)
  const [ width, height ] = app.shape
  
  world.integrate(points, dt / 1000)
  ctx.save()
  ctx.scale(app.scale, app.scale)
  ctx.clearRect(0, 0, width, height)
  const surfWidth = surface.width / app.scale
  const surfHeight = surface.height / app.scale
  
  const tx = (width - surfWidth) / 2
  const ty = (height - surfHeight) / 2
  ctx.translate(tx, ty)
  ctx.drawImage(surface, 0, 0, surfWidth, surfHeight)
  ctx.translate(-tx, -ty)
  surfaceCtx.translate(-tx, -ty)
  surfaceCtx.beginPath()
  ctx.beginPath()
  points.forEach(pt => {
    const depth = pt.position[2]
    if (depth < pt.radius) {
      if (pt.bounces > 0) pt.bounces--
      else {
        pt.active = false
        pt.position[2] = 0
      }
    }
    
    if (pt.active) {
      renderPoint(ctx, pt)
    } else {
      renderPoint(ctx, pt)
      renderPoint(surfaceCtx, pt, pt.alpha)
    }
  })
  surfaceCtx.fillStyle = ctx.fillStyle = color
  surfaceCtx.fill()
  ctx.fill()
  surfaceCtx.translate(tx, ty)
  ctx.restore()
  
  for (let i=points.length - 1; i>=0; i--) {
    if (!points[i].active) points.splice(i, 1)
  }
}

function renderPoint (curCtx, point) {
  let x = point.position[0]
  let y = point.position[1]
  let z = point.position[2]
  const size = clamp(point.size * (1 + z), 0, 10)
  if (size <= 0) return
  curCtx.moveTo(x, y)
  curCtx.arc(x, y, size, 0, Math.PI*2, false)
}

function clearSurface () {
  
}