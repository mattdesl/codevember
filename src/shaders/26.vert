attribute vec3 position;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform float iGlobalTime;

#pragma glslify: noise = require('glsl-noise/simplex/4d')

void main() {
  vec4 posW = vec4(position, 1.0);
  vec4 tPos = posW;
  tPos.x += noise(vec4(position.xyz, iGlobalTime));
  gl_Position = projectionMatrix *
              modelViewMatrix *
              tPos;
}