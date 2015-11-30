vec2 cubeToUV( vec3 v, float texelSize ) {
  // Horizontal cross layout:
  //
  //  Y   Char: Axis
  // xzXZ   Case: Sign
  //  y

  vec3 absV = abs( v );

  // Intersect unit cube

  float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
  v *= scaleToCube;
  absV *= scaleToCube;

  // Apply scale to cut the seams

  // two texels less per square (one texel will do for NEAREST)
  vec2 zoom = 1.0 - 2.0 * vec2( 4.0, 3.0 ) * texelSize;
  v.xy *= zoom;

  // Unwrap

  // space: -1 ... 1 range for each square
  //
  //  #   dim    := ( 4 , 3 )
  // #X##   
  //  #     center := ( 1 , 1 )

  vec2 planar = v.xy;

  float almostATexel = 1.5 * texelSize;
  float almostOne = 1.0 - almostATexel;

  if ( absV.z >= almostOne ) {

    if ( v.z > 0.0 )
      planar.x = 4.0 - v.x;

  } else if ( absV.x >= almostOne ) {

    float signX = sign( v.x );
    planar.x = v.z * signX * zoom.x + 2.0 * signX;

  } else if ( absV.y >= almostOne ) {

    float signY = sign( v.y );
    planar.y = v.z * signY  * zoom.y + 2.0 * signY;

  }

  // Transform to UV space

  // scale := 0.5 / dim
  // translate := ( center + 0.5 ) / dim
  return vec2( 0.125, 0.16666666 ) * planar + vec2( 0.375, 0.5 );
}

#pragma glslify: export(cubeToUV)