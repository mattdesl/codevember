const xhr = require('xhr')
const HDR = require('hdr').loader
const xyz2rgb = require('./xyz-pixels-to-rgb')
const toBuffer = require('arraybuffer-to-buffer')
const xyz2rgbm = require('./xyz-pixels-to-rgbm')
const noop = function () {}

module.exports = threeHdrTexture
function threeHdrTexture (uri, cb) {
  cb = cb || noop
  const texture = new THREE.DataTexture(1, 1)
  texture.format = THREE.RGBAFormat
  texture.type = THREE.UnsignedByteType
  xhr({ uri: uri, responseType: 'arraybuffer' }, function (err, resp, data) {
    if (!/^2/.test(resp.statusCode)) err = new Error('status code ' + resp.statusCode)
    if (err) return cb(err)

    var hdr = new HDR()
    hdr.once('load', function () {
      var rgbm = xyz2rgbm(this.data)
      texture.image = {
        data: rgbm,
        width: this.width,
        height: this.height
      }
      texture.needsUpdate = true
      cb(null, texture)
      cb = noop
    })
    hdr.once('error', function () {
      cb(new Error('could not decode .hdr format'))
      cb = noop
    })

    var buf = toBuffer(data)
    hdr.write(buf)
    hdr.end()
  })
  return texture
}
