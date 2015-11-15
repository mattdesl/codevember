precision highp float;
uniform vec3 color;
uniform float opacity;
uniform float iGlobalTime;

void main() {
  gl_FragColor.rgb = color;
  gl_FragColor.a = opacity;
}