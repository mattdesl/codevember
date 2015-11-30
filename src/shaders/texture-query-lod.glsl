float mipmapLevel (in vec2 uv) {
  vec2  dxVtc = dFdx(uv);
  vec2  dyVtc = dFdy(uv);
  float deltaMaxSqr = max(dot(dxVtc, dxVtc), dot(dyVtc, dyVtc));
  float mml = 0.5 * log2(deltaMaxSqr);
  return max(0.0, mml);
}

#pragma glslify: export(mipmapLevel)