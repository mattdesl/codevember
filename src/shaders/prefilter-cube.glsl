const vec3 x = vec3(1.0, 0.0, 0.0);
const vec3 y = vec3(0.0, 1.0, 0.0);
const vec3 z = vec3(0.0, 0.0, 1.0);

const mat3 front = mat3(x, y, z);
const mat3 back = mat3(x, y, -z);
const mat3 right = mat3(z, y, x);
const mat3 left = mat3(z, y, -x);
const mat3 top = mat3(x, z, y);
const mat3 bottom = mat3(x, z, -y);
const float specularity = 4.0;

const float size = 16.0;
const float start = ((0.5/size)-0.5)*2.0;
const float end = -start;
const float incr = 4.0 / size;

vec4 sample (mat3 side, vec3 eyedir, vec3 base_ray){
    vec3 ray = side*base_ray;
    float lambert = max(0.0, dot(ray, eyedir));
    float term = pow(lambert, specularity)*base_ray.z;
    return vec4(texture(ray).rgb*term, term);
}

vec3 prefilter (vec3 eyedir, mat4 invProjMatrix) {
  vec4 result = vec4(0.0);
  for(float xi=start; xi<=end; xi+=incr){
      for(float yi=start; yi<=end; yi+=incr){
          vec3 ray = normalize(
              (invProjMatrix * vec4(xi, yi, 0.0, 1.0)).xyz
          );
          result += sample(front, eyedir, ray);
          result += sample(back, eyedir, ray);
          result += sample(top, eyedir, ray);
          result += sample(bottom, eyedir, ray);
          result += sample(left, eyedir, ray);
          result += sample(right, eyedir, ray);
      }
  }
  result /= result.w;
  return result.rgb;
}

#pragma glslify: export(prefilter)