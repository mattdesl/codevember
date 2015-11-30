attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;
attribute vec3 randomDirection;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform mat3 normalMatrix;
uniform mat4 viewMatrix;
uniform float iGlobalTime;
varying vec2 vUv;
varying mat4 vInverseViewMatrix;
varying mat4 vInverseProjMatrix;

#pragma glslify: inverse = require('glsl-inverse')
#pragma glslify: noise = require('glsl-noise/simplex/4d')
#pragma glslify: ease = require('glsl-easings/quartic-in-out')

varying vec3 ecPosition;
varying vec3 ecNormal;

void main() {
  vec4 posW = vec4(position, 1.0);
  
  float anim = ease(sin(iGlobalTime * 2.0) * 0.5 + 0.5);
  float dir = 0.0;
  
  float spin = length(position.xz);
  dir += anim * noise(vec4(position.xyz * 2.0 * spin, anim));
  posW.xyz += randomDirection * dir;
  
  ecPosition = vec3(viewMatrix * modelMatrix * posW);
  ecNormal = normalMatrix * normal;
    
  vInverseViewMatrix = inverse(viewMatrix);
  vInverseProjMatrix = inverse(projectionMatrix);
  vUv = uv;
  gl_Position = projectionMatrix *
              modelViewMatrix *
              posW;
}