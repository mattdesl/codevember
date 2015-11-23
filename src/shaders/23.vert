attribute vec3 position;
attribute vec2 uv;
attribute vec3 direction;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
varying vec2 vUv;

void main() {
  vec4 posW = vec4(position, 1.0);
  vUv = uv;
  gl_Position = projectionMatrix *
              modelViewMatrix *
              posW;
}