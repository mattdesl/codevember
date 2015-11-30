module.exports = texelCoordSolidAngle

// https://seblagarde.wordpress.com/2012/06/10/amd-cubemapgen-for-physically-based-rendering/
function areaElement (x, y) {
  return Math.atan2(x * y, Math.sqrt(x * x + y * y + 1))
}

function texelCoordSolidAngle (u, v, size) {
  // scale up to [-1, 1] range (inclusive), offset by 0.5 to point to texel center.
  var _u = (2.0 * (u + 0.5) / size) - 1.0
  var _v = (2.0 * (v + 0.5) / size) - 1.0

  // fixSeams
  _u *= 1.0 - 1.0 / size
  _v *= 1.0 - 1.0 / size

  var invResolution = 1.0 / size

  // U and V are the -1..1 texture coordinate on the current face.
  // Get projected area for this texel
  var x0 = _u - invResolution
  var y0 = _v - invResolution
  var x1 = _u + invResolution
  var y1 = _v + invResolution
  var solidAngle = areaElement(x0, y0) - areaElement(x0, y1) - areaElement(x1, y0) + areaElement(x1, y1)

  // fixSeams cut
  if ((u === 0 && v === 0) || (u === size - 1 && v === 0) || (u === 0 && v === size - 1) || (u === size - 1 && v === size - 1)) {
    solidAngle /= 3
  } else if (u === 0 || v === 0 || u === size - 1 || v === size - 1) {
    solidAngle *= 0.5
  }

  return solidAngle
}
