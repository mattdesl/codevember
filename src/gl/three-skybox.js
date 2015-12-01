const noop = function () {}

module.exports = getSkybox
function getSkybox (urls, cb = noop) {
  var cubeTex = THREE.ImageUtils.loadTextureCube(urls, undefined,
    (tex) => cb(null, tex),
    () => cb(new Error('error loading cube texture')))

  var material = new THREE.ShaderMaterial({
    uniforms: {
      'tCube': { type: 't', value: cubeTex },
      'tFlip': { type: 'f', value: -1 }
    },
    vertexShader: [
      'varying vec3 vWorldPosition;',
      THREE.ShaderChunk[ 'logdepthbuf_pars_vertex' ],
      'void main() {',
      ' vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
      ' vWorldPosition = worldPosition.xyz;',
      ' gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
      THREE.ShaderChunk[ 'logdepthbuf_vertex' ],
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform samplerCube tCube;',
      'uniform float tFlip;',
      'varying vec3 vWorldPosition;',
      THREE.ShaderChunk[ 'logdepthbuf_pars_fragment' ],
      'void main() {',
      ' gl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );',
      THREE.ShaderChunk[ 'logdepthbuf_fragment' ],
      '}'
    ].join('\n'),
    fog: false,
    side: THREE.BackSide,
    depthWrite: false
  })

  var geometry = new THREE.BoxGeometry(5000, 5000, 5000)
  return new THREE.Mesh(geometry, material)
}
