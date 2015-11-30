vec3 rgbmDecode (in vec4 rgbm) {
  return 6.0 * rgbm.rgb * rgbm.a;
}

#pragma glslify: export(rgbmDecode)