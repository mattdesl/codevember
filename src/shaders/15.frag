#extension GL_OES_standard_derivatives : enable

precision highp float;
uniform vec3 color;
uniform float opacity;
uniform float iGlobalTime;
varying vec3 vPos;
uniform int mode;

#pragma glslify: hsl2rgb = require('glsl-hsl2rgb')
#pragma glslify: aastep = require('glsl-aastep')

#pragma glslify: noise = require('glsl-noise/simplex/3d')

void main() {
  gl_FragColor.rgb = color;
  gl_FragColor.a = opacity;
}