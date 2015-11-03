const budo = require('budo')
const argv = require('minimist')(process.argv.slice(2))
const path = require('path')
const babelify = require('babelify')
const open = require('opn')
const fs = require('fs')

const entry = argv._[0]
if (!entry) throw new Error('must specify an entry script')

const entryFile = path.resolve(__dirname, 'src', entry + '.js')
budo(entryFile, {
  serve: 'static/' + entry + '.js',
  live: true,
  dir: __dirname,
  stream: process.stdout,
  defaultIndex: function () {
    return fs.createReadStream(entry + '.html')
  },
  browserify: {
    transform: [
      babelify.configure({ presets: ['es2015'] }),
      [ 'installify', { save: true } ]
    ]
  }
}).on('connect', function(ev) {
  const uri = ev.uri + entry + '.html'
  if (argv.open) open(uri)
})