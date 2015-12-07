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

const container = document.querySelector('#grid')

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

calendar(container, items, {
  aspect: 1280 / 840,
  maxSize: [ 1200, 400 ],
  maxCellSize: [ Infinity, Infinity ],
  padding: 5,
  margin: 40
})

function imageLoader (element, index) {
  const imgEl = element.querySelector('.image')
  classes.add(imgEl, 'image-loading')
  const src = images[index]
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
}