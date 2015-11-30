let complex = sphere(1, { segments: 32 })
let geometry = Simplicial(complex)
complex.cells.forEach((cell, i) => {
  const [ a, b, c ] = cell
  const uvs = complex.uvs
  geometry.faceVertexUvs[0].push([
    new THREE.Vector2().fromArray(uvs[a]),
    new THREE.Vector2().fromArray(uvs[b]),
    new THREE.Vector2().fromArray(uvs[c])
  ])

  const normals = complex.normals
  geometry.faces[i].vertexNormals = [
    new THREE.Vector3().fromArray(normals[a]),
    new THREE.Vector3().fromArray(normals[b]),
    new THREE.Vector3().fromArray(normals[c])
  ]
})