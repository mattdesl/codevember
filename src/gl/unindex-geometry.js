// via @samsy
module.exports = unindexGeometry
function unindexGeometry (geometry) {
  let vertices = geometry.vertices
  let faces = geometry.faces
  let vertexUv = geometry.faceVertexUvs[0]
  let temp = new THREE.Geometry()

  var c = 0
  for (var i = 0; i < faces.length; i++) {
    temp.vertices.push(vertices[faces[i].a].clone())
    temp.vertices.push(vertices[faces[i].b].clone())
    temp.vertices.push(vertices[faces[i].c].clone())
    temp.faceVertexUvs[0][i] = vertexUv[i]

    let face = new THREE.Face3(c++, c++, c++)
    if (faces[i].vertexNormals[0]) {
      face.vertexNormals[0] = faces[i].vertexNormals[0].clone()
      face.vertexNormals[1] = faces[i].vertexNormals[1].clone()
      face.vertexNormals[2] = faces[i].vertexNormals[2].clone()
    }
    face.normal = faces[i].normal.clone()
    temp.faces[i] = face
  }

  return temp
}
