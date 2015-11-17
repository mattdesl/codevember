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
  float fade = smoothstep(0.1, 0.9, dist);
  
  float steps = 4.0;
  float pattern = mod(dist, 1.0 / steps) * steps; //smoothstep(0.51, 0.49, );
  pattern = smoothstep(0.8, 0.0, abs(pattern - 0.5));
  
  gl_FragColor.rgb = mix(vec3(#5af24f), vec3(#e72b4a), pattern);
  gl_FragColor.a = opacity * fade;
  gl_FragColor.rgb *= gl_FragColor.a;
}