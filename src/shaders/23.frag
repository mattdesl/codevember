#extension GL_OES_standard_derivatives : enable
precision mediump float;
#define SQRT2_2 0.70710678118654757

uniform float opacity;
uniform vec3 color;
uniform sampler2D map;
uniform vec2 iResolution;
uniform float iGlobalTime;
varying vec2 vUv;

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
  
  float sdfDst = sdf;
  // float stroke = noise(vec3(sdf * 10.0, 0.0, iGlobalTime));
  // stroke = clamp(stroke, 0.0, 0.2);
  // float alpha = aastep(0.2, 1.0 * stroke);
  // vec3 rendered = render(sdf);
  
  float size = 0.05;
  vec2 pos = mod(vUv.xy, vec2(size)) - vec2(size / 2.0);
  float center = length(pos - 0.5);
  gl_FragColor = vec4(vec3(center), 1.0);
  
  // sdf += noise(vec3(center, 0.0, 0.0));
  // float alpha = aastep(0.5, sdf);
  // gl_FragColor = vec4(color, opacity * alpha);
  
  // float alpha = 0.0;
  // alpha += aastep(0.5, sdf + 0.25 * noise(vec3(vUv * 10.0, iGlobalTime)));
  // alpha -= aastep(0.5, sdf + 0.05 * noise(vec3(vUv * 500.0, iGlobalTime)));
  // vec3 colorA = vec3(#484848);
  // vec3 colorB = vec3(#45c4ee);
  // vec4 baseA = vec4(colorA, opacity * alpha);
  
  // alpha = 0.0;
  // float dst = 0.0;
  // dst += 0.5 * (sdf + 0.15 * noise(vec3(vUv * 10.0, iGlobalTime)));
  // dst += 0.5 * (sdf + 0.05 * noise(vec3(vUv * 400.0, iGlobalTime)));
  // alpha = aastep(0.5, dst);
  // vec4 baseB = vec4(colorB, opacity * alpha);
  // gl_FragColor = blend(baseA, baseB);
}