const gridItem = require('./grid-item.hbs')
const domify = require('domify')
const content = require('./content')
const calendar = require('./calendar-grid')
const images = require('./image-urls')
const palettes = require('../../assets/thumb-palettes.json')
const css = require('dom-css')
const colorStyle = require('color-style')
const loadImage = require('img')
const classes = require('dom-classes')
const isMobile = require('../is-mobile')()

const container = document.querySelector('#grid')

if (!isMobile) { // cheap mobile test
  classes.add(document.body, 'no-touch')
}

const imageLoadDelay = 50
const items = content.map((data, i) => {
  data.day = i + 1
  const element = domify(gridItem(data))
  const [ r, g, b ] = palettes[i][0]
  const color = colorStyle(r, g, b)
  css(element, { backgroundColor: color })
  imageLoader(element, i)
  return element
})

items.forEach(item => container.appendChild(item))

const grid = calendar(container, items, {
  aspect: 1280 / 840,
  maxSize: [ 1200, 400 ],
  maxCellSize: [ Infinity, Infinity ],
  padding: 5,
  solve: () => {
    let count = 30
    let cols = 4
    if (window.innerWidth < 480) {
      cols = 1
      grid.margin = 10
    } else if (window.innerWidth < 720) {
      cols = 2
      grid.margin = 20
    } else {
      grid.margin = 40
    }
    const rows = Math.ceil(count / cols)
    return [ cols, rows ]
  },
  style: (cell, width, height) => {
    css(cell.querySelector('.title'), {
      lineHeight: height + 'px'
    })
    css(cell.querySelector('.description'), {
      lineHeight: height + 'px'
    })
  }
})

grid.resize()

function imageLoader (element, index) {
  const imgEl = element.querySelector('.image')
  classes.add(imgEl, 'image-loading')
  const src = images[index]
  setTimeout(() => {
    loadImage(src, (err, img) => {
      if (err) throw err
      classes.remove(imgEl, 'image-loading')
      classes.add(imgEl, 'image-loaded')
      css(imgEl, {
        backgroundImage: `url("${src}")`,
        backgroundSize: 'cover',
        backgroundRepeat: 'none',
        backgroundPosition: 'center center'
      })
    })
  }, imageLoadDelay)
}
