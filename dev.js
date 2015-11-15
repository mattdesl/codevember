const budo = require('budo')
const argv = require('minimist')(process.argv.slice(2))
const path = require('path')
const babelify = require('babelify')
const open = require('opn')
const fs = require('fs')
const simpleHtml = require('simple-html-index')

const entry = argv._[0]
if (!entry) {
  console.error('must specify an entry script, eg:\n'
    + '   npm run start 5')
  process.exit(1)
}

const transforms = require('./config')

const entryFile = path.resolve(__dirname, 'src', entry + '.js')
budo(entryFile, {
  serve: 'static/' + entry + '.js',
  live: true,
  dir: __dirname,
  // verbose: true,
  stream: process.stdout,
  defaultIndex: function (opt) {
    var html = entry + '.html'
    if (!fs.existsSync(html)) return simpleHtml(opt)
    return fs.createReadStream(html)
  },
  browserify: {
    debug: true,
    transform: [
      babelify.configure({ presets: ['es2015'] }),
      [ 'installify', { save: true } ]
    ].concat(transforms[entry] || [])
  }
}).on('connect', function(ev) {
  if (argv.open) open(ev.uri)
})