module.exports = faceCentroid
function faceCentroid (vertices, face, out) {
  if (!out) out = new THREE.Vector3()
  const v1 = vertices[face.a]
  const v2 = vertices[face.b]
  const v3 = vertices[face.c]
  var x = (v1.x + v2.x + v3.x) / 3
  var y = (v1.y + v2.y + v3.y) / 3
  var z = (v1.z + v2.z + v3.z) / 3
  out.set(x, y, z)
  return out
}
