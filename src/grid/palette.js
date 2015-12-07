var fs = require('fs')
var path = require('path')
var getPixels = require('get-pixels')
var getPalette = require('get-rgba-palette')
var mapLimit = require('map-limit')
var thumbs = path.resolve(process.cwd(), process.argv[2])
var sortByName = require('./sort-files')

var files = fs.readdirSync(thumbs).filter(function (f) {
  return /\.(jpe?g|png)$/i.test(f)
})
files.sort(sortByName)
console.error(files)

mapLimit(files, 5, function (item, next) {
  var file = path.resolve(thumbs, item)
  getPixels(file, function (err, pixels) {
    if (err) return next(err)
    var data = pixels.data
    var palette = getPalette(data, 3)
    next(null, palette)
  })
}, function (err, results) {
  if (err) throw err
    // console.error(results)
  // var dict = results.reduce(function (dict, item) {
  //   dict[item.file] = item.palette
  //   return dict
  // }, {})
  console.log(JSON.stringify(results))
})

