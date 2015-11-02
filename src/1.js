const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const app = require('canvas-loop')(ctx.canvas, {
  scale: Math.min(2, window.devicePixelRatio)
})
app.start()

const loadSvg = require('load-svg')
const extractSvg = require('extract-svg-path').parse

const svgMesh = require('svg-mesh-3d')
const drawTriangles = require('draw-triangles-2d')
const createPoint = require('verlet-point')
const createConstraint = require('verlet-constraint')
const reindex = require('mesh-reindex')
const unindex = require('unindex-mesh')
const random = require('random-float')
const array = require('new-array')

const gl = require('webgl-context')()
const maxSize = gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 0
let lowEnd = false
if (maxSize <= 4096 * 2) {
  lowEnd = true // stupid "Low End" Mobile/FF test
}

const randomVector = (scale = 1) => {
  return array(3).map(() => random(-scale, scale))
}

const world = require('verlet-system')({
  gravity: [0, 0],
  min: [null, 0],
  max: [null, 0]
})

loadSvg('assets/feather.svg', (err, svg) => {
  if (err) return alert(err.message)
  start(extractSvg(svg))
})

function start (icon) {
  let mesh = svgMesh(icon, {
    randomization: lowEnd ? 100 : 500,
    simplify: 0.01,
    scale: 10
  })

  mesh = reindex(unindex(mesh.positions, mesh.cells))

  mesh.positions = mesh.positions.map(x => {
    const size = 125
    return [
      x[0] * size + window.innerWidth / 2,
      -x[1] * size + window.innerHeight / 2 ]
  })

  world.points = mesh.positions.map(pos => {
    return createPoint({ position: pos })
  })

  const constraints = mesh.cells.map(cell => {
    const points = cell.map(i => world.points[i])

    // adjust mass
    points.forEach(pt => {
      pt.mass = random(0.65, 1.0)
    })

    const opt = { stiffness: 1 }
    const tri = [
      createConstraint([ points[0], points[1]], opt),
      createConstraint([ points[1], points[2]], opt),
      createConstraint([ points[2], points[0]], opt)
    ]
    return tri
  }).reduce((a, b) => a.concat(b), [])

  const onClick = (ev) => {
    ev.preventDefault()
    world.gravity = [0, 600]
    world.points.forEach(point => {
      point.addForce(randomVector(5))
    })
  }

  canvas.addEventListener('click', onClick)
  canvas.addEventListener('touchstart', onClick)

  app.on('tick', (dt) => {
    dt = Math.min(dt, 30)

    const [width, height] = app.shape
    ctx.save()
    ctx.scale(app.scale, app.scale)
    ctx.clearRect(0, 0, width, height)

    const grad = ctx.createLinearGradient(-width * 0.5, 0, width * 1.5, 0)
    grad.addColorStop(0, '#e356c0')
    grad.addColorStop(1, '#e77b23')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    ctx.beginPath()
    world.max[1] = height
    constraints.forEach(c => c.solve())
    world.integrate(world.points, dt / 1000)

    const positions = world.points.map(x => x.position)
    drawTriangles(ctx, positions, mesh.cells)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.restore()
  })
}
