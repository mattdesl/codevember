var sortByName = require('./sort-files')
const fs = require('fs')
let files = fs.readdirSync(__dirname + '/../../assets/thumbs')

files = files.filter(f => /\.(jpe?g|png)$/i.test(f))
files = files.map(f => {
  return `assets/thumbs/${f}`
})
files.sort(sortByName)

module.exports = files
