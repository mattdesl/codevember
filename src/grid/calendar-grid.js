const css = require('dom-css')
const rows = 7
const cols = 4
const clamp = require('clamp')

module.exports = function gridItems (grid, cells, opt = {}) {
  const aspect = typeof opt.aspect === 'number' ? opt.aspect : 1
  const padding = opt.padding || 0
  const margin = opt.margin || 0
  const maxSize = opt.maxSize || [ Infinity, Infinity ]
  const minSize = opt.minSize || [ -Infinity, -Infinity ]
  const maxCellSize = opt.maxCellSize || [ Infinity, Infinity ]
  const minCellSize = opt.minCellSize || [ -Infinity, -Infinity ]

  resize()
  window.addEventListener('resize', resize)

  return {
    resize
  }

  function resize () {
    const padx = padding * (cols + 1)
    const pady = padding * (rows + 1)

    // parent bounds
    const width = clamp(window.innerWidth - margin * 2 - padx, minSize[0], maxSize[0])
    // const height = clamp(window.innerHeight - margin * 2 - pady, minSize[1], maxSize[1])

    const cellWidth = clamp(width / cols, minCellSize[0], maxCellSize[0])
    const cellHeight = clamp(cellWidth / aspect, minCellSize[1], maxCellSize[1])

    const gridWidth = cellWidth * cols + padx
    const gridHeight = cellHeight * rows + pady
    css(grid, {
      width: gridWidth,
      height: gridHeight
    })

    cells.forEach((cell, i) => {
      var ix = Math.floor(i % cols)
      var iy = Math.floor(i / cols)
      const x = padding + ix * (padding + cellWidth)
      const y = padding + iy * (padding + cellHeight)
      css(cell, {
        left: x,
        top: y,
        width: cellWidth,
        height: cellHeight
      })
    })
  }
}
