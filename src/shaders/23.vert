attribute vec3 position;
attribute vec2 uv;
attribute vec3 direction;
uniform mat4 projectionMatrix;
uniform vec2 textSize;
uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
varying vec2 vUv;
varying vec3 vPos;
varying vec2 vCenterUV;

void main() {
  vec4 posW = vec4(position, 1.0);
  vPos = posW.xyz;
  vUv = uv;
  
  vec4 modelPos = modelMatrix * posW;
  vec3 origin = vec3(0.0);
  vCenterUV = normalize(modelPos.xyz - origin.xyz).xy;
  gl_Position = projectionMatrix *
              modelViewMatrix *
              posW;
}