#extension GL_OES_standard_derivatives : enable

precision highp float;
uniform vec3 color;
uniform float opacity;
uniform float radius;
varying vec3 vPos;
#pragma glslify: noise = require('glsl-noise/simplex/4d')
#pragma glslify: aastep = require('glsl-aastep')

void main() {
  float dist = length(vPos) / radius;
  float fade = smoothstep(0.1, 1.0, dist);
  
  float steps = 10.0;
  float pattern = mod(dist, 1.0 / steps) * steps; //smoothstep(0.51, 0.49, );
  pattern = aastep(0.1, abs(pattern - 0.5));
  
  gl_FragColor.rgb = vec3(fade);
  gl_FragColor.a = opacity * pattern * fade;
}