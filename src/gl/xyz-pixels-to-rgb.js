var xyz = require('xyz-utils')
var tmp = [0, 0, 0]
var tmp2 = [0, 0, 0]
module.exports = xyzToRGB

function xyzToRGB (xyzArray) {
  var ret = new Float32Array(xyzArray.length)
  for (var i = 0; i < xyzArray.length; i += 3) {
    tmp[0] = xyzArray[i]
    tmp[1] = xyzArray[i + 1]
    tmp[2] = xyzArray[i + 2]
    xyz.toRGB(tmp, tmp2)
    ret[i] = tmp2[0]
    ret[i + 1] = tmp2[1]
    ret[i + 2] = tmp2[2]
  }
  return ret
}
