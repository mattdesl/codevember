const budo = require('budo')
const argv = require('minimist')(process.argv.slice(2))
const path = require('path')
const babelify = require('babelify')
const open = require('opn')
const fs = require('fs')
const simpleHtml = require('simple-html-index')

var entry = argv._[0]
if (!entry) {
  entry = 'grid'
}

const transforms = require('./config')

const entryFilename = entry === 'grid'
  ? path.join(entry, 'index.js')
  : (entry + '.js')

const entryFile = path.resolve(__dirname, 'src', entryFilename)
budo(entryFile, {
  serve: 'static/' + entry + '.js',
  live: true,
  verbose: true,
  dir: __dirname,
  stream: process.stdout,
  forceDefaultIndex: true,
  defaultIndex: function (opt) {
    var html = entry === 'grid' ? 'index.html' : entry + '.html'
    if (!fs.existsSync(html)) return simpleHtml(opt)
    return fs.createReadStream(html)
  },
  browserify: {
    debug: false,
    transform: [
      babelify.configure({ presets: ['es2015'] }),
      [ 'installify', { save: true } ]
    ].concat(transforms[entry] || [])
  }
}).on('connect', function (ev) {
  if (argv.open) open(ev.uri)
})
