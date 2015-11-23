const punch = require('./util/punch-card')
const sunTzu = require('sun-tzu-quotes')

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const CARD_WIDTH = 0.7
const CARD_HEIGHT = 1.0
const punchColumns = 14
const punchRows = 8

let text
canvas.addEventListener('click', next)
canvas.addEventListener('touchend', next)
window.addEventListener('resize', renderCard)
next()

function next () {
  text = sunTzu()
  document.querySelector('#quote').innerText = text
  renderCard()
}

function renderCard () {
  const size = 70
  const spacing = 0.05
  const words = getCardChunks(text)
  const width = window.innerWidth

  const count = words.length
  const computedWidth = (width + spacing * size)
  const cols = Math.floor(computedWidth / ((CARD_WIDTH + spacing) * size))
  const rows = Math.ceil(count / cols)
  const height = rows * (CARD_HEIGHT * size) + (rows - 1) * (spacing * size)

  const scale = window.devicePixelRatio
  canvas.width = width * scale
  canvas.height = height * scale
  canvas.style.width = '100%'
  canvas.style.height = 'auto'

  ctx.save()
  ctx.scale(scale, scale)
  ctx.clearRect(0, 0, width, height)
  ctx.scale(size, size)
  ctx.translate(CARD_WIDTH / 2, CARD_HEIGHT / 2)
  words.forEach((word, i) => {
    const x1 = Math.floor(i % cols)
    const y1 = Math.floor(i / cols)
    const x = x1 * CARD_WIDTH + x1 * spacing
    const y = y1 * CARD_HEIGHT + y1 * spacing
    ctx.translate(x, y)
    ctx.beginPath()
    renderCardBackground()
    ctx.fillStyle = '#CEB274'
    ctx.fill()
    ctx.beginPath()
    renderCardPunches(punch(word))
    ctx.fillStyle = '#5a513c'
    ctx.fill()
    ctx.translate(-x, -y)
  })
  ctx.restore()
}

function renderCardBackground () {
  const [ width, height ] = [ CARD_WIDTH, CARD_HEIGHT ]
  const [ x, y ] = [ -width / 2, -height / 2 ]
  const edge = 0.10
  ctx.moveTo(x, y)
  ctx.lineTo(x + width - edge, y)
  ctx.lineTo(x + width, y + edge)
  ctx.lineTo(x + width, y + height)
  ctx.lineTo(x, y + height)
  ctx.lineTo(x, y)
}

function renderCardPunches (rows) {
  const spacing = 0.02
  const header = 0.12
  const [ x, y ] = [ -CARD_WIDTH / 2, -CARD_HEIGHT / 2 + header ]

  const cellWidth = (CARD_WIDTH + spacing) / punchColumns - spacing
  const cellHeight = 0.75 * ((CARD_HEIGHT + spacing) / punchRows - spacing)

  rows.forEach((row, rowIndex) => {
    row.forEach(colIndex => {
      ctx.rect(
        x + colIndex * cellWidth + colIndex * spacing,
        y + rowIndex * cellHeight + rowIndex * spacing,
        cellWidth,
        cellHeight)
    })
  })
}

function getCardChunks (text) {
  return text.split(/\s+/g)
    .map(x => x.replace(/[^A-Z1-9]+/ig, ''))
    .filter(Boolean)
    .map((x, i, list) => {
      const cap = i < list.length - 1 ? (punchRows - 1) : punchRows
      if (x.length > cap) {
        let str = x
        const chunks = []
        while (str.length > 0) {
          const chunk = str.slice(0, cap)
          str = str.slice(cap)
          chunks.push(chunk)
        }
        if (i < list.length - 1 && chunks.length) {
          chunks[chunks.length - 1] += ' '
        }
        return chunks
      }
      if (i < list.length - 1) {
        x = x + ' '
      }
      return [ x ]
    })
    .reduce((a, b) => a.concat(b), [])
}
