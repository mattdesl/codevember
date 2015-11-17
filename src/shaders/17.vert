attribute vec3 position;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
varying vec3 vPos;

void main() {
  vec4 posW = vec4(position, 1.0);
  vPos = posW.xyz;
  gl_Position = projectionMatrix *
              modelViewMatrix *
              posW;
}