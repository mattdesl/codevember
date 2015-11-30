vec4 rgbmEncode (in vec3 color) {
  float minB = 0.000001;
  vec4 rgmb = vec4(0.0);
  color *= 1.0 / 6.0;
  rgbm.a = clamp(max(max(color.r, color.g), max(color.b, minB)), 0.0, 1.0);
  rgbm.a = ceil(rgbm.a * 255.0) / 255.0;
  rgbm.rgb = color / rgbm.a;
  return rgbm;
}

#pragma glslify: export(rgbmEncode)