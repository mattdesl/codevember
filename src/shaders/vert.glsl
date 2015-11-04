
#pragma glslify: noise = require('glsl-noise/simplex/4d')

varying vec3 vNorm;
varying vec2 vUv;
uniform int ring;
attribute float freqLow;
attribute float freqMid;
attribute float freqHigh;

uniform float iGlobalTime;
void main() {
  vUv = uv;
  vNorm = position.xyz;
  
  float freq = 0.0;
  if (ring == 0) freq = freqLow;
  else if (ring == 1) freq = freqMid;
  else if (ring == 2) freq = freqHigh;
  
  float angle = atan(position.y, position.x) * 1024.0 + iGlobalTime;
  vec3 offset = position.xyz;
  float movement = sin(cos(iGlobalTime));
  offset.z = noise(vec4(position.xy * freq, angle, movement)) * 1.25;
  gl_Position = projectionMatrix *
              modelViewMatrix *
              vec4(offset, 1.0);
}