global.THREE = require('three')
const loadJson = require('load-json-xhr')
const createApp = require('./three-orbit-app')

const app = createApp({
  canvas: document.querySelector('canvas')
})

loadGeometry('assets/mesh/elk.json', (err, geom) => {
  if (err) return error(err)
  //   `
  //   <div>Could not load resource.</div>
  //   <div>Try loading <a href="http://mattdesl.github.io/codevember/1.html">the demo</a>.</div>
  // `)
  console.log('ready')
})

function setup () {
  
}

function loadGeometry (path, cb) {
  const loader = new THREE.JSONLoader();
  loadJson(path, (err, data) => {
    if (err) return cb(err)
    else cb(null, loader.parse(data))
  })
}