#extension GL_OES_standard_derivatives : enable
precision highp float;

#pragma glslify: envMapEquirect  = require('./envmap-equirect.glsl')
#pragma glslify: toLinear = require('glsl-gamma/in')
#pragma glslify: toGamma  = require('glsl-gamma/out')
#pragma glslify: tonemap  = require('./tonemap-filmic')
#pragma glslify: rgbmDecode = require('./rgbm-decode')
#pragma glslify: perturb = require('glsl-perturb-normal') 

uniform vec3 color;
uniform float opacity;
uniform sampler2D map;
uniform sampler2D diffuseMap;
uniform sampler2D normalMap;
varying vec2 vUv;
varying mat4 vInverseViewMatrix;
varying mat4 vInverseProjMatrix;

varying vec3 ecPosition;
varying vec3 ecNormal;

//White balance middle grey we are targetting for a good scene exposure
//https://en.wikipedia.org/wiki/Middle_gray
const float MIDDLE_GREY = 0.18;

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

vec4 textureEnv (sampler2D sampler, vec3 dir) {
  vec2 envUV = envMapEquirect(dir);
  return vec4(toLinear(rgbmDecode(texture2D(sampler, envUV))), 1.0);
}

void main() {
  vec3 ecEyeDir = normalize(-ecPosition);
  vec3 wcEyeDir = vec3(vInverseViewMatrix * vec4(ecEyeDir, 0.0));
  vec3 wcNormal = vec3(vInverseViewMatrix * vec4(ecNormal, 0.0));

  vec3 N = normalize(wcNormal);
  vec3 reflectionWorld = normalize(reflect(-wcEyeDir, wcNormal));
  vec3 normalRGB = texture2D(normalMap, vUv * 1.5).rgb;
  normalRGB = normalRGB * 2.0 - 1.0;
  normalRGB = mix(vec3(0.0, 0.0, 1.0), normalRGB, 0.75);
  
  //perturb the normal 
  vec3 pNormal = perturb(normalRGB, reflectionWorld, wcEyeDir, vUv);
  
  vec3 reflectCol = textureEnv(map, pNormal).rgb;
  vec3 diffuseCol = textureEnv(diffuseMap, pNormal).rgb;
  
  // this is not at all accurate, just finding stuff that looks pleasing.
  vec3 outCol = diffuseCol + reflectCol;
  outCol.rgb *= getStandardOutputBasedExposure(16.0, 0.5, 50.0);
  outCol.rgb = tonemap(outCol.rgb);
  outCol = toGamma(outCol);
  gl_FragColor = vec4(outCol * color, opacity);
}