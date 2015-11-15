#pragma glslify: noise = require('glsl-noise/simplex/4d')

attribute vec3 position;
attribute vec3 direction;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform vec3 mouse;
uniform float iGlobalTime;
varying vec3 vPos;

void main() {
  vec4 posW = vec4(position, 1.0);

  vec3 offset = vec3(0.0);
  offset += direction * noise(vec4(posW.xyz * 1.0, iGlobalTime)) * 0.5;
  posW.xyz = posW.xyz + offset;
  
  gl_Position = projectionMatrix *
              modelViewMatrix *
              posW;
}