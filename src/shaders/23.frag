#extension GL_OES_standard_derivatives : enable
precision highp float;
#define SQRT2_2 0.70710678118654757

uniform float opacity;
uniform vec3 color;
uniform sampler2D map;
uniform vec2 iResolution;
uniform float iGlobalTime;
uniform vec2 textSize;
varying vec2 vUv;
varying vec3 vPos;
varying vec2 vCenterUV;

#pragma glslify: noise = require('glsl-noise/simplex/3d')
#pragma glslify: noise2d = require('glsl-noise/simplex/2d')
#pragma glslify: aastep = require('glsl-aastep')
#pragma glslify: blend = require('./src-over')

#pragma glslify: hsl2rgb = require('glsl-hsl2rgb')

// vec3 render (float sdf) {
//   float hue = noise(vec3(vUv.x * 0.0, sdf * 5.0, 0.0));
//   return hsl2rgb(vec3(hue, 0.5, 0.5));
// }

void main() {
  vec4 texColor = texture2D(map, vUv);
  float sdf = texColor.a;
  
  vec2 pos = vec2(vPos.xy / textSize);
  pos.y *= -1.0;
  pos -= 0.5;
  pos.x *= abs(textSize.x / textSize.y);
  
  float timeOff = iGlobalTime * 0.2;
  float alpha = 0.0;
  alpha += aastep(0.5, sdf + 0.25 * noise(vec3(vUv * 1150.0, timeOff)));
  alpha -= aastep(0.5, sdf + 0.25 * noise(vec3(vUv * 50.0, timeOff)));
  alpha += aastep(0.6, sdf + 0.0 * noise(vec3(vUv * 500.0, timeOff)));
  
  float mask = length(pos);
  mask = aastep(0.5, mask);
  // float size = 1.0;
  // vec2 tPos = mod(pos.xy, vec2(size)) - vec2(size / 2.0);
  // float pattern = aastep(0.25, length(tPos) / size);
  alpha -= 0.75 * mask;
  
  vec3 colorA = vec3(#000);
  vec3 colorB = vec3(#ff0000);
  vec4 baseA = vec4(colorA, opacity * alpha);
  gl_FragColor = baseA;
}