global.Promise = require('pinkie-promise')
const argv = require('minimist')(process.argv.slice(2))
const browserify = require('browserify')
const fs = require('fs')
const path = require('path')
const UglifyJS = require('uglify-js')

var files = fs.readdirSync(path.resolve(__dirname, 'src'))
files = files.filter(function (f) {
  return /^\d+\.js$/.test(f)
})

const transformConfig = require('./config')

var entry = argv._[0]
if (typeof entry === 'number') {
  entry = String(entry)
} else if (!entry) {
  entry = 'grid'
}

var isGrid = entry === 'grid'

if (entry && isGrid) {
  files = [ path.join('grid', 'index.js') ]
} else if (entry) {
  files = files.filter(function (f) {
    return path.basename(f, '.js') === entry
  })
}

Promise.all(files.map(runBuild)).catch(function (err) {
  console.error(err)
}).then(function () {
  console.log("Finished")
})

function runBuild (f) {
  return new Promise(function (resolve, reject) {
    console.log('Bundling', f)
    var b = browserify('src/' + f, {
      debug: false,
      noparse: [ 'three' ]
    })
    b.transform(require('babelify').configure({ presets: 'es2015' }))
    b.plugin(require('bundle-collapser/plugin'))
    var base = isGrid ? 'grid' : path.basename(f, '.js')
    if (isGrid) f = 'grid.js'
    var transforms = (transformConfig[base] || [])
    transforms.forEach(function (t) {
      b.transform(t)
    })
    b.bundle(function (err, src) {
      if (err) return reject(err)
      console.log('Compressing', f)
      var result = UglifyJS.minify(src.toString(), { fromString: true })
      console.log('Writing', f)
      fs.writeFile('static/' + f, result.code, function (err) {
        if (err) return reject(err)
        resolve()
      })
    })
  })
}