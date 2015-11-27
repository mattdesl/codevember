precision highp float;
uniform vec3 color;
uniform float opacity;

void main() {
  gl_FragColor = vec4(color, opacity);
}