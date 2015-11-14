#pragma glslify: noise = require('glsl-noise/simplex/4d')

attribute vec3 position;
attribute vec2 uv;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform float iGlobalTime;
varying vec2 vUv;
varying vec3 vPos;

void main() {
  vec4 posW = vec4(position, 1.0);
    
  float theta = 0.1 * noise(vec4(position.yyy * 10.0, iGlobalTime * 0.5));
  mat3 rotMat = mat3(
    vec3(cos(theta), 0.0, sin(theta)),
    vec3(0.0, 1.0, 0.0),
    vec3(-sin(theta), 0.0, cos(theta))
  );
  
  posW.xyz = rotMat * posW.xyz;
  vPos = vec3(modelMatrix * posW);
  vUv = uv;
  gl_Position = projectionMatrix *
              modelViewMatrix *
              posW;
}