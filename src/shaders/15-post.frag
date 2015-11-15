#define LUT_FLIP_Y

varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform sampler2D tDust;
uniform vec2 resolution;
uniform vec2 dustResolution;
uniform float iGlobalTime;
uniform sampler2D tLookup;

vec3 tex(vec2 uv);

#pragma glslify: blur = require('glsl-hash-blur', sample=tex, iterations=20)
#pragma glslify: lut = require('glsl-lut')
#pragma glslify: luma = require('glsl-luma')

vec3 tex(vec2 uv) {
  return texture2D(tDiffuse, uv).rgb;
}

vec4 textureBackground(sampler2D texture, vec2 uv, vec2 resolution, vec2 texResolution) {
  float tAspect = texResolution.x / texResolution.y;
  float pwidth = resolution.x;
  float pheight = resolution.y;
  float pAspect = resolution.x / resolution.y;
  
  float width = 0.0;
  float height = 0.0;  
  if (tAspect > pAspect) {
    height = pheight;
    width = height * tAspect; 
  } else {
    width = pwidth;
    height = width / tAspect;
  }
  float x = (pwidth - width) / 2.0;
  float y = (pheight - height) / 2.0;
  vec2 nUv = uv;
  nUv -= vec2(x, y) / resolution;
  nUv /= vec2(width, height) / resolution;
  return texture2D(texture, nUv);
}

void main () {
  float aspect = resolution.x / resolution.y;
  
  //jitter the noise but not every frame
  float tick = floor(fract(iGlobalTime)*20.0);
  float jitter = mod(tick * 382.0231, 21.321);
  
  vec3 blurred = vec3(0.0);
  blurred += 0.3 * blur(vUv, 0.1, 1.0 / aspect, jitter);
  
  gl_FragColor = texture2D(tDiffuse, vUv);
  
  gl_FragColor.rgb += blurred;
  
  vec2 vigUV = vUv - 0.5;
  vigUV.x *= aspect;
  float vig = length(vigUV);
  vig = smoothstep(1.6, 0.2, vig);
  gl_FragColor *= vig;
  
  
  float L = luma(blurred.rgb);
  L = smoothstep(0.015, 0.1, L);
    
  vec4 dust = textureBackground(tDust, vUv, resolution, dustResolution);
  vec3 dustyColor = gl_FragColor.rgb + dust.rgb;
  gl_FragColor.rgb = mix(gl_FragColor.rgb, dustyColor, L * 0.75);
  
  gl_FragColor.rgb = lut(gl_FragColor, tLookup).rgb;
  gl_FragColor.a = 1.0;
  
}