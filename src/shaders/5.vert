attribute vec4 position;
varying vec2 vUv;

void main() {
  vUv = (position.xy + 1.0) * 0.5;
  vUv.y = 1.0 - vUv.y;
  gl_Position = position;
}