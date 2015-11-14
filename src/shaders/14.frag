#extension GL_OES_standard_derivatives : enable

precision highp float;
uniform vec3 color;
uniform float opacity;
uniform float iGlobalTime;
varying vec2 vUv;
varying vec3 vPos;
uniform int mode;

#pragma glslify: hsl2rgb = require('glsl-hsl2rgb')
#pragma glslify: aastep = require('glsl-aastep')

#pragma glslify: noise = require('glsl-noise/simplex/3d')

void main() {
  float dst = 0.0;
  float timeOff = sin(iGlobalTime * 0.01) * 80.0;
  
  // float yPos
  vec3 samplePos = vec3(vUv.x * 1.0, vUv.y * 20.0 + timeOff, timeOff * 0.15);
  
  #ifdef DESKTOP
    samplePos.y += 3.5 * noise(vec3(vPos.xy * 1.0, timeOff * 0.05));
    samplePos.y += 0.05 * noise(vec3(vPos.xy * 5.0, timeOff * 0.5));
    samplePos.y += 0.5 * noise(vec3(vPos.xy * 7.0, timeOff));
  #endif
  
  float absOff = 1.0;
  if (mode == 1) {
    absOff = 0.5;
  }
  
  float cDist = length(vPos.xy) - 0.5;
  cDist = abs(cDist - absOff);
  float circle = smoothstep(0.0, 1.5, cDist);
  samplePos.xy *= circle;
  
  dst += noise(samplePos);
  
  float smooth = dst;
  dst = aastep(0.25, dst);
  
  float hue = mix(0.4, 0.2, vUv.x);
  float light = mix(0.4, 0.6, vUv.y);
  float hueOff = sin(timeOff * 0.5) * 0.5 + 0.5;
  hueOff += (hue * 2.0 - 1.0) * 0.4;
  
  gl_FragColor.rgb = hsl2rgb(hueOff, 0.75, light);
  gl_FragColor.a = dst;
  gl_FragColor.a *= opacity;
}