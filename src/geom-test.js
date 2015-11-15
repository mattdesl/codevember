global.THREE = require('three')
const loadJson = require('load-json-xhr')
const createApp = require('./three-orbit-app')
const fatal = require('./fatal-error')()

const app = createApp({
  canvas: document.querySelector('canvas')
})

loadGeometry('assets/mesh/elk.json', (err, geom) => {
  if (err) return fatal(err)
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