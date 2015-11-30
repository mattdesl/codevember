var xyz = require('xyz-utils')
var tmp = [0, 0, 0]
var tmp1 = [0, 0, 0]
var tmpRGBM = [0, 0, 0, 0]
const clamp = require('clamp')

module.exports = xyzToRGBM
function xyzToRGBM (xyzArray) {
  var pixelCount = xyzArray.length / 3
  var ret = new Uint8Array(pixelCount * 4)
  for (var i = 0; i < pixelCount; i++) {
    tmp[0] = xyzArray[i * 3]
    tmp[1] = xyzArray[i * 3 + 1]
    tmp[2] = xyzArray[i * 3 + 2]
    xyz.toRGB(tmp, tmp1)  // xyz to rgb
    encode(tmp1, tmpRGBM) // rgb to rgbm
    ret[i * 4] = tmpRGBM[0]
    ret[i * 4 + 1] = tmpRGBM[1]
    ret[i * 4 + 2] = tmpRGBM[2]
    ret[i * 4 + 3] = tmpRGBM[3]
  }
  return ret
}

function encode (color, out) {
  if (!out) out = [ 0, 0, 0, 0 ]
  var minB = 0.000001
  var coeff = 1 / 6
  var r = color[0] * coeff
  var g = color[1] * coeff
  var b = color[2] * coeff
  var a = clamp(Math.max(Math.max(r, g), Math.max(b, minB)), 0.0, 1.0)
  a = Math.ceil(a * 255.0) / 255.0
  out[0] = clamp(Math.ceil(r / a * 255), 0, 255)
  out[1] = clamp(Math.ceil(g / a * 255), 0, 255)
  out[2] = clamp(Math.ceil(b / a * 255), 0, 255)
  out[3] = clamp(Math.ceil(a * 255), 0, 255)
  return out
}
