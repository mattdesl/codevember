precision mediump float;

uniform sampler2D colorBuffer;
uniform sampler2D displacement;
uniform vec2 offset;
varying vec2 vUv;

void main() {
  vec2 dUv = texture2D(displacement, vUv).xy;
  float strength = 0.15;
  dUv = vUv + dUv * strength;
  vec2 delta = vUv - dUv;
  
  float scale = 1.5;
  vec2 uv = (dUv - 0.5) * (1.0 / scale) + 0.5;
  uv -= offset;
  
  gl_FragColor = texture2D(colorBuffer, uv);
}