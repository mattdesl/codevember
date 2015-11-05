const budo = require('budo')
const argv = require('minimist')(process.argv.slice(2))
const path = require('path')
const babelify = require('babelify')
const open = require('opn')
const fs = require('fs')
const simpleHtml = require('simple-html-index')

const entry = argv._[0]
if (!entry) throw new Error('must specify an entry script')

const transforms = require('./config')

const entryFile = path.resolve(__dirname, 'src', entry + '.js')
budo(entryFile, {
  serve: 'static/' + entry + '.js',
  live: true,
  dir: __dirname,
  stream: process.stdout,
  defaultIndex: function (opt) {
    var html = entry + '.html'
    if (!fs.existsSync(html)) return simpleHtml(opt)
    return fs.createReadStream(html)
  },
  browserify: {
    transform: [
      babelify.configure({ presets: ['es2015'] }),
      [ 'installify', { save: true } ]
    ].concat(transforms[entry] || [])
  }
}).on('connect', function(ev) {
  const uri = ev.uri + entry + '.html'
  if (argv.open) open(uri)
})