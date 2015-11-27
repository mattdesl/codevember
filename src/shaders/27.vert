attribute vec3 position;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform float iGlobalTime;

uniform float thickness;
attribute float lineMiter;
attribute vec2 lineNormal;

#pragma glslify: noise = require('glsl-noise/simplex/4d')

void main() {
  float n = noise(vec4(position.xyz, iGlobalTime));
  float computedThickness = thickness * n;
  vec2 normal = clamp(lineNormal, vec2(-1.0), vec2(1.0));
  float miter = clamp(lineMiter, -1.0, 1.0);
  vec2 pointPos = position.xy + vec2(lineNormal * computedThickness / 2.0 * miter);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pointPos, position.z, 1.0);
}