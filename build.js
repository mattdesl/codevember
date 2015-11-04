const browserify = require('browserify')
const fs = require('fs')
const path = require('path')
const UglifyJS = require('uglify-js')

var files = fs.readdirSync(path.resolve(__dirname, 'src'))
files = files.filter(function (f) {
  return /^\d+\.js$/.test(f)
})

const transforms = {
  '3': ['glslify']
}

files.forEach(function (f) {
  console.log('Bundling', f)
  var b = browserify('src/' + f, {
    debug: false
  })
  b.transform(require('babelify').configure({ presets: 'es2015' }))
  b.plugin(require('bundle-collapser/plugin'))
  var base = path.basename(f, '.js')
  ;(transforms[base] || []).forEach(function (t) {
    b.transform(t)
  })
  b.bundle(function (err, src) {
    if (err) throw err
    console.log('Compressing', f)
    var result = UglifyJS.minify(src.toString(), { fromString: true })
    console.log('Writing', f)
    fs.writeFile('static/' + f, result.code, function (err) {
      if (err) throw err
    })
  })
})
