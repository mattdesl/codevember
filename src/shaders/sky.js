// http://threejs.org/examples/#webgl_shaders_sky

/**
 * @author zz85 / https://github.com/zz85
 *
 * Based on "A Practical Analytic Model for Daylight"
 * aka The Preetham Model, the de facto standard analytic skydome model
 * http://www.cs.utah.edu/~shirley/papers/sunsky/sunsky.pdf
 *
 * First implemented by Simon Wallner
 * http://www.simonwallner.at/projects/atmospheric-scattering
 *
 * Improved by Martin Upitis
 * http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR
 *
 * Three.js integration by zz85 http://twitter.com/blurspline
*/

var glslify = require('glslify')

THREE.ShaderLib[ 'sky' ] = {

  uniforms: {

    luminance:   { type: "f", value: 1 },
    turbidity:   { type: "f", value: 2 },
    reileigh:  { type: "f", value: 1 },
    mieCoefficient:  { type: "f", value: 0.005 },
    mieDirectionalG: { type: "f", value: 0.8 },
    sunPosition:   { type: "v3", value: new THREE.Vector3() }

  },

  vertexShader: [

    "varying vec3 vWorldPosition;",

    "void main() {",

      "vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
      "vWorldPosition = worldPosition.xyz;",

      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}",

  ].join( "\n" ),

  fragmentShader: glslify(__dirname + '/sky.frag')

};

module.exports = function Sky () {

  var skyShader = THREE.ShaderLib[ "sky" ];
  var skyUniforms = THREE.UniformsUtils.clone( skyShader.uniforms );
  
  var skyMat = new THREE.ShaderMaterial( {
    fragmentShader: skyShader.fragmentShader,
    vertexShader: skyShader.vertexShader,
    uniforms: skyUniforms,
    side: THREE.DoubleSide,
  } );

  var skyGeo = new THREE.SphereGeometry( 450000, 32, 15 );
  var skyMesh = new THREE.Mesh( skyGeo, skyMat );

  // Expose variables
  this.mesh = skyMesh;
  this.uniforms = skyUniforms;
};