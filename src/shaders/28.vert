attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform mat3 normalMatrix;
uniform mat4 viewMatrix;
varying vec2 vUv;
varying mat4 vInverseViewMatrix;

#pragma glslify: inverse = require('glsl-inverse')

varying vec3 ecPosition;
varying vec3 ecNormal;

void main() {
  vec4 posW = vec4(position, 1.0);
  ecPosition = vec3(viewMatrix * modelMatrix * posW);
  ecNormal = normalMatrix * normal;
    
  vInverseViewMatrix = inverse(viewMatrix);
  vUv = uv;
  gl_Position = projectionMatrix *
              modelViewMatrix *
              vec4(position, 1.0);
}