// https://github.com/jfhbrook/node-punchcard/blob/master/punch.js
var ebcdic = require('punchcard/ebcdic')

module.exports = function txt2punch (txt) {
  var buff = txt
  if (typeof txt === 'string') {
    buff = Buffer(txt)
  }

  buff = ebcdic.toEBCDIC(buff)

  // src: http://www.divms.uiowa.edu/~jones/cards/codes.html
  return Array.prototype.map.call(buff, function (char) {
    var row = []; // Not a bitmask. ;)

    // Some characters are "special cases."
    switch (char) {
      case 0x00:
        row = [12, 0, 1, 8, 9]
        break
      case 0x20:
        row = [11, 0, 1, 8, 9]
        break
      case 0x40:
        row = []
        break
      case 0x50:
        row = [12]
        break
      case 0x60:
        row = [11]
        break
      default:
        // Defined in next section (gets hoisted)
        row = calcRow()
        break
    }

    // Most of these can be calculated.
    function calcRow () {
      // Bitmasks!
      var left = (char & 0xF0) >> 4,
        right = char & 0x0F,
        row = []

      // Handle the LHS
      if (right > 9) {
        row.push(8)
        row.push(right - 8)
      } else {
        row.push(right)
      }

      // Abusing fall-through \m/
      switch (left) {
        case 0x00:
        case 0x04:
        case 0x08:
        case 0x0C:
          row.push(12)
          break
      }

      switch (left) {
        case 0x01:
        case 0x05:
        case 0x09:
        case 0x0A:
        case 0x0D:
          row.push(11)
          break
      }

      switch (left) {
        case 0x02:
        case 0x06:
        case 0x08:
        case 0x0A:
        case 0x0E:
          row.push(10)
          break
      }

      switch (left) {
        case 0x00:
        case 0x01:
        case 0x02:
          row.push(9)
          break
      }
      return row
    }
    
    const a = row.slice(0, 9)
    a.reverse()

    const b = row.slice(9)
    return a.concat(b)
  
    // |987654321ABC|
    // var line = '            '

    // row.forEach(function (i) {
    //   line = line.substring(0, i - 1) + '▘' + line.substring(i, line.length)
    // })

    // line = line.substring(0, 9).split('').reverse().join('')
    //   + line.substring(9, line.length)

    // return '|' + line.split('').join('') + ' |'
  })
}
