mat3 rot_x( float a ) {

  float s = sin( a ), c = cos( a );

  return mat3(
    1.0 , 0.0 , 0.0 ,
    0.0 , +c  , +s  ,
    0.0 , -s  , +c  );
}

mat3 rot_y( float a ) {

  float s = sin( a ), c = cos( a );

  return mat3(
    +c  , 0.0 , -s  ,
    0.0 , 1.0 , 0.0 ,
    +s  , 0.0 , +c  );
} 

mat3 rot_z( float a ) {

  float s = sin( a ), c = cos( a );

  return mat3(
    +c  , +s  , 0.0 ,
    -s  , +c  , 0.0 ,
    0.0 , 0.0 , 1.0 );
}

mat3 rot_zyx( vec3 xyz ) {

  return rot_z( xyz.z ) * rot_x( xyz.x ) * rot_y( xyz.y );

}

#pragma glslify: export(rot_zyx)