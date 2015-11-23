var assign = require('object-assign')

module.exports = function(opt) {
  opt = opt||{}
  var opacity = typeof opt.opacity === 'number' ? opt.opacity : 1
  var alphaTest = typeof opt.alphaTest === 'number' ? opt.alphaTest : 0.06
  return assign({
    uniforms: {
      opacity: { type: 'f', value: opacity },
      map: { type: 't', value: opt.map || new THREE.Texture() },
      color: { type: 'c', value: new THREE.Color(opt.color) }
    },
    vertexShader: [
      "attribute vec2 uv;",
      "attribute vec3 position;",
      "uniform mat4 projectionMatrix;",
      "uniform mat4 modelViewMatrix;",
      "varying vec2 vUv;",
      "void main() {",
        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);",
      "}"
    ].join("\n"),
    fragmentShader: [   
      "#extension GL_OES_standard_derivatives : enable",
      "precision mediump float;",
      "#define SQRT2_2 0.70710678118654757",
      "uniform float opacity;",
      "uniform vec3 color;",
      "uniform sampler2D map;",
      "varying vec2 vUv;",
      "void main() {",
        "vec4 texColor = texture2D(map, vUv);",
        "float dst = texColor.a;", 
        "float afwidth = length(vec2(dFdx(dst), dFdy(dst))) * SQRT2_2;",
        "float alpha = smoothstep(0.5 - afwidth, 0.5 + afwidth, dst);",
        "vec4 base = vec4(color, opacity * alpha);",
        "gl_FragColor = base;",
      "}"
    ].join("\n"),
    defines: {
      "USE_MAP": "",
      "ALPHATEST": Number(alphaTest || 0).toFixed(1)
    }
  }, opt)
}
