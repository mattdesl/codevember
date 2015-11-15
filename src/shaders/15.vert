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
  vec3 modelPos = vec3(modelMatrix * posW);
    
  // float theta = 0.1 * noise(vec4(position.yyy * 10.0, iGlobalTime * 0.5));
  // mat3 rotMat = mat3(
  //   vec3(cos(theta), 0.0, sin(theta)),
  //   vec3(0.0, 1.0, 0.0),
  //   vec3(-sin(theta), 0.0, cos(theta))
  // );
  // posW.xyz = rotMat * posW.xyz;
  
  // vec3 center = vec3(0.0);
  // center = 25.0 * smoothstep(0.3, 0.2, length(posW));
  
  float timeOff = clamp(iGlobalTime / 50.0, 0.0, 1.0);
  
  vec3 offset = vec3(0.0);
  
  offset += direction * noise(vec4(posW.xyz * 1.0, iGlobalTime)) * 0.5;
  
  vec3 modelMouse = vec4(modelMatrix * vec4(mouse, 1.0)).xyz;
  float dist = distance(modelMouse, modelPos.xyz) / 1.0;
  dist = smoothstep(0.3, 0.0, dist);
  dist = clamp(dist, 0.0, 1.0);
  
  offset += direction * dist * 2.0;
  
  posW.xyz = posW.xyz + offset;
  
  gl_Position = projectionMatrix *
              modelViewMatrix *
              posW;
}