var insertCSS = require('insert-css')
var assign = require('object-assign')
var domify = require('domify')
var once = require('once')
var fonts = require('google-fonts')

var css = `
#fatal-error {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 100000;
  top: 0;
  left: 0;
  padding: 20px;
  box-sizing: border-box;
  font-size: 16px;
  margin: 0;
  color: #000;
}
.fatal-error-stack-line {
  padding-left: 20px;
}
.fatal-error-stack-line:first-child {
  padding-left: 0px;
  font-weight: bold;
}
a, a:visited, a:active {
  text-decoration: none;
  color: #48a0cd;
}
a:hover {
  text-decoration: underline;
}
`

module.exports = createErrorPage
function createErrorPage (opt) {
  opt = opt || {}
  var dark = opt.dark
  var pre = opt.pre
  var googleFonts = opt.googleFonts !== false
  var stack = opt.stack

  var setupCSS = once(function setupCSS () {
    if (googleFonts) {
      fonts.add({ 'Open Sans': [300, 600] })
    }
    insertCSS(css)
  })

  function create () {
    setupCSS()

    var element = document.createElement('div')
    element.setAttribute('id', 'fatal-error')
    document.body.appendChild(element)

    assign(element.style, {
      font: pre
        ? '16px monospace'
        : '15px "Open Sans", Helvetica, sans-serif',
      background: dark ? '#313131' : '#fff',
      color: dark ? '#e9e9e9' : '#000',
      'word-wrap': pre ? 'break-word' : undefined
    })

    return element
  }

  function splitStack (lines) {
    return lines.map(function (str) {
      return '<div class="fatal-error-stack-line">' +
      str + '</div>'
    }).join('\n')
  }

  return function showError (err) {
    var msg = err
    if (err instanceof Error) {
      msg = stack ? err.stack : err.message
    }

    if (typeof msg === 'string') {
      msg = (msg || '').trim()
      if (stack) {
        var lines = msg.split('\n')
        if (lines.length > 0) msg = splitStack(lines)
      }
    }

    var element = document.querySelector('#fatal-error')
    if (!element) {
      element = create()
    }

    while (element.firstChild) { // clear children
      element.removeChild(element.firstChild)
    }

    if (Array.isArray(msg)) {
      msg.forEach(function (line) {
        element.appendChild(domify(line))
      })
    } else {
      element.appendChild(domify(msg))
    }
    return element
  }
}
