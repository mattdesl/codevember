const getGL = require('webgl-context')
module.exports = function isLowEnd () {
  const gl = getGL()
  const maxSize = gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 0
  if (maxSize <= 4096 * 2) {
    return true // stupid "Low End" Mobile/FF test
  }
  return false
}