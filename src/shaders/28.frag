precision highp float;

#pragma glslify: envMapEquirect  = require('./envmap-equirect.glsl')
#pragma glslify: toLinear = require('glsl-gamma/in')
#pragma glslify: toGamma  = require('glsl-gamma/out')
#pragma glslify: tonemap  = require('./tonemap-filmic')

uniform vec3 color;
uniform float opacity;
uniform sampler2D map;
varying vec2 vUv;
varying mat4 vInverseViewMatrix;

varying vec3 ecPosition;
varying vec3 ecNormal;

//White balance middle grey we are targetting for a good scene exposure
//https://en.wikipedia.org/wiki/Middle_gray
const float MIDDLE_GREY = 0.18;

vec3 fixSeams(vec3 vec, float mipmapIndex) {
    float scale = 1.0 - exp2(mipmapIndex) / 256.0;
    float M = max(max(abs(vec.x), abs(vec.y)), abs(vec.z));
    if (abs(vec.x) != M) vec.x *= scale;
    if (abs(vec.y) != M) vec.y *= scale;
    if (abs(vec.z) != M) vec.z *= scale;
    return vec;
}

vec3 fixSeamsStatic(vec3 vec, float invRecMipSize) {
    float scale = invRecMipSize;
    float M = max(max(abs(vec.x), abs(vec.y)), abs(vec.z));
    if (abs(vec.x) != M) vec.x *= scale;
    if (abs(vec.y) != M) vec.y *= scale;
    if (abs(vec.z) != M) vec.z *= scale;
    return vec;
}


/*
* Get an exposure using the Standard Output Sensitivity method.
* Accepts an additional parameter of the target middle grey.
*/
float getStandardOutputBasedExposure(float aperture,
                                     float shutterSpeed,
                                     float iso) {
  float q = 0.65;
  //float l_avg = (1000.0f / 65.0f) * sqrt(aperture) / (iso * shutterSpeed);
  float l_avg = (1.0 / q) * sqrt(aperture) / (iso * shutterSpeed);
  //float l_avg = sqrt(aperture) / (iso * shutterSpeed);
  return MIDDLE_GREY / l_avg;
}

void main() {
  vec3 ecEyeDir = normalize(-ecPosition);
  vec3 wcEyeDir = vec3(vInverseViewMatrix * vec4(ecEyeDir, 0.0));
  vec3 wcNormal = vec3(vInverseViewMatrix * vec4(ecNormal, 0.0));

  vec3 reflectionWorld = normalize(reflect(-wcEyeDir, wcNormal));
  vec2 envUV = envMapEquirect(reflectionWorld);
  vec3 outCol = texture2D(map, envUV, 4.0).rgb;
  outCol = toLinear(outCol);
  outCol.rgb *= getStandardOutputBasedExposure(16.0, 0.5, 100.0);
  outCol.rgb = tonemap(outCol.rgb);
  outCol = toGamma(outCol);
  gl_FragColor = vec4(outCol * color, opacity);
}