const glslify = require('glslify')

const vert = glslify(`
  attribute vec3 position;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  varying vec2 vUv;

  void main() {
    gl_Position = vec4(position, 1.0);
    vUv = vec2(position.x, position.y) * 0.5 + 0.5;
  }
`, { inline: true })
const frag = glslify(`
  precision mediump float;

  #pragma glslify: grain = require('glsl-film-grain')
  #pragma glslify: blend = require('glsl-blend-soft-light')

  uniform vec3 color1;
  uniform vec3 color2;
  uniform float aspect;
  uniform vec2 scale;
  uniform float noiseAlpha;
  uniform bool aspectCorrection;
  uniform float grainScale;
  uniform float grainTime;
  uniform vec2 smooth;

  varying vec2 vUv;

  void main() {
    float gSize = 1.0 / grainScale;
    float g = grain(vUv, vec2(gSize * aspect, gSize), grainTime);

    vec2 q = vec2(vUv - 0.5);
    if (aspectCorrection) {
      q.x *= aspect;
    }
    q /= scale;
    float dst = length(q);
    dst = smoothstep(smooth.x, smooth.y, dst);

    vec3 color = mix(color1, color2, dst);
    vec3 noiseColor = blend(color, vec3(g));

    gl_FragColor.rgb = mix(color, noiseColor, noiseAlpha);
    gl_FragColor.a = 1.0;
  }
`, { inline: true })

module.exports = createBackground
function createBackground (opt) {
  opt = opt || {}
  var geometry = new THREE.PlaneGeometry(2, 2, 1)
  var material = new THREE.RawShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    side: THREE.DoubleSide,
    uniforms: {
      aspectCorrection: { type: 'i', value: false },
      aspect: { type: 'f', value: 1 },
      grainScale: { type: 'f', value: 0.005 },
      grainTime: { type: 'f', value: 0 },
      noiseAlpha: { type: 'f', value: 0.25 },
      scale: { type: 'v2', value: new THREE.Vector2(1.5, 1.5) },
      smooth: { type: 'v2', value: new THREE.Vector2(0.0, 1.0) },
      color1: { type: 'c', value: new THREE.Color('#fff') },
      color2: { type: 'c', value: new THREE.Color('#283844') }
    },
    depthTest: false
  })
  var mesh = new THREE.Mesh(geometry, material)
  mesh.style = style
  if (opt) mesh.style(opt)
  return mesh

  function style (opt) {
    opt = opt || {}
    if (Array.isArray(opt.colors)) {
      const colors = opt.colors.map(function (c) {
        if (typeof c === 'string' || typeof c === 'number') {
          return new THREE.Color(c)
        }
        return c
      })
      material.uniforms.color1.value.copy(colors[0])
      material.uniforms.color2.value.copy(colors[1])
    }
    if (typeof opt.aspect === 'number') {
      material.uniforms.aspect.value = opt.aspect
    }
    if (typeof opt.grainScale === 'number') {
      material.uniforms.grainScale.value = opt.grainScale
    }
    if (typeof opt.grainTime === 'number') {
      material.uniforms.grainTime.value = opt.grainTime
    }
    if (opt.smooth) {
      const smooth = fromArray(opt.smooth, THREE.Vector2)
      material.uniforms.smooth.value.copy(smooth)
    }
    if (typeof opt.scale !== 'undefined') {
      let scale = opt.scale
      if (typeof scale === 'number') {
        scale = [ scale, scale ]
      }
      scale = fromArray(scale, THREE.Vector2)
      material.uniforms.scale.value.copy(scale)
    }
    if (typeof opt.aspectCorrection !== 'undefined') {
      material.uniforms.aspectCorrection.value = Boolean(opt.aspectCorrection)
    }
  }

  function fromArray (array, VectorType) {
    if (Array.isArray(array)) {
      return new VectorType().fromArray(array)
    }
    return array
  }
}
