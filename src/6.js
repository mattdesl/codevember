global.THREE = require('three')
const BinauralFIR = require('binauralfir')
const xhr = require('xhr')
const lerp = require('lerp')
const unlerp = require('unlerp')
const Reverb = require('soundbank-reverb')
const once = require('once')
const ease = require('eases/expo-in-out')
const error = require('./desktop-only')

const createText = require('three-bmfont-text')
const loadFont = require('load-bmfont')
const Shader = require('./shaders/sdf.js')
const isMobile = require('./is-mobile')()

const createOrbit = require('./three-orbit-app')
const app = createOrbit({
  distance: 7,
  position: [-2.9, 3.0, 3.5],
  near: 0.01,
  distanceBounds: [ 0.25, 10 ],
  far: 100
})

let textGeometry, textMesh
let audioContext, sourceNode
let textOpts = {}

const geometry = new THREE.IcosahedronGeometry(1, 1)
const material = new THREE.MeshBasicMaterial({
  wireframe: true,
  opacity: 0.1,
  transparent: true,
  color: 0xffffff
})
const dome = new THREE.Mesh(geometry, material)
app.scene.add(dome)

const fontConfig = {
  image: 'assets/KelsonSans.png',
  font: 'assets/KelsonSans.fnt'
}

const AudioContext = window.AudioContext || window.webkitAudioContext
if (!AudioContext) {
  alert('Needs WebGL & WebAudio support!')
} else {
  audioContext = new AudioContext()
  setupText(isMobile ? 'tap to load' : 'loading')
  if (isMobile) { 
    window.addEventListener('touchend', once(function() {
      // create empty buffer
      var buffer = audioContext.createBuffer(1, 1, 22050)
      var dummy = audioContext.createBufferSource()
      dummy.buffer = buffer
      dummy.connect(audioContext.destination)
      dummy.noteOn(0)
      dummy.disconnect()
      
      reloadText('loading')
      
      xhr({
        uri: 'assets/bluejean_short.mp3',
        responseType: 'arraybuffer'
      }, (err, resp, arrayBuf) => {
        if (err) return error(err)
        audioContext.decodeAudioData(arrayBuf, function(buffer) {
          sourceNode = audioContext.createBufferSource()
          sourceNode.buffer = buffer
          sourceNode.loop = true
          sourceNode.start(0)
          
          setTimeout(() => {
            load()
          }, 10)
        }, (err) => {
          error(err)
        });
      })
    }), false)
  } else {
    const audio = new Audio()
    audio.src = 'assets/bluejean.mp3'
    sourceNode = audioContext.createMediaElementSource(audio)
    load()
    audio.play()
  }
}

function setupText (initialMessage) {
  const texture = THREE.ImageUtils.loadTexture(fontConfig.image)
  const textMaterial = new THREE.ShaderMaterial(Shader({
    map: texture,
    side: THREE.DoubleSide,
    depthTest: false,
    transparent: true,
    color: 'rgb(230, 230, 230)'
  }))

  loadFont(fontConfig.font, (err, font) => {
    if (err) return error(err)
    textOpts = {
      font: font,
      align: 'center',
      text: ''
    }
    textGeometry = createText(textOpts)
    
    textMesh = new THREE.Mesh(textGeometry, textMaterial)
    
    reloadText(initialMessage)
    
    const anchor = new THREE.Object3D()
    const scalar = -0.01
    anchor.scale.set(-scalar, scalar, scalar)
    anchor.add(textMesh)
    app.scene.add(anchor)
    
    anchor.position.fromArray([-0.4, 0.5, 0.5])
    anchor.lookAt(app.camera.position)
  })
}

function reloadText (msg) {
  textOpts.text = msg
  textGeometry.update(textOpts)
  textMesh.position.x = -textGeometry.layout.width/2
  textMesh.position.y = textGeometry.layout.height/2
}

function load () {
  xhr({
    uri: 'assets/complete_hrtfs.json'
  }, (err, resp, body) => {
    if (err) return error(err)
    var result = eval(body)
  
    reloadText('zoom in to hear!')
    start(result)
  })
}

function start (hrtfs) {
  var targetNode = audioContext.destination
  
  // HRTF files loading
  for (var i = 0; i < hrtfs.length; i++) {
    var buffer = audioContext.createBuffer(2, 512, audioContext.sampleRate)
    var bufferChannelLeft = buffer.getChannelData(0)
    var bufferChannelRight = buffer.getChannelData(1)
    for (var e = 0; e < hrtfs[i].fir_coeffs_left.length; e++) {
      bufferChannelLeft[e] = hrtfs[i].fir_coeffs_left[e]
      bufferChannelRight[e] = hrtfs[i].fir_coeffs_right[e]
    }
    hrtfs[i].buffer = buffer
  }

  
  const binauralFIRNode = new BinauralFIR({
    audioContext: audioContext
  })

  // Set HRTF dataset
  binauralFIRNode.HRTFDataset = hrtfs

  // Connect Audio Nodes
  sourceNode.connect(binauralFIRNode.input)
  
  const reverb = Reverb(audioContext)
  reverb.connect(targetNode)
  reverb.time = 3.5 //seconds 
  reverb.wet.value = 1  
  reverb.filterType = 'lowpass'
  reverb.cutoff.value = 8500 //Hz 
  
  binauralFIRNode.connect(reverb)
  binauralFIRNode.setPosition(0, 0, 1)
  
  const sphereGeom = new THREE.IcosahedronGeometry(0.15, 1)
  const sphereMat = new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 0xffffff,
    opacity: 0.25,
    transparent: true
  })
  const hotSpot = new THREE.Mesh(sphereGeom, sphereMat)
  hotSpot.position.z = -1
  app.scene.add(hotSpot)
  
  binauralFIRNode.setPosition(0, 0, 1)
  
  let time = 0
  let hasShownRotate = false
  app.on('tick', (dt) => {
    time += dt / 1000
    let angleX = app.controls.theta
    let angleY = (app.controls.phi - Math.PI / 2) / (Math.PI / 2) * 0.5 + 0.5
    
    angleX = Math.round(angleX * 180 / Math.PI)
  
    const controls = app.controls
    let dist = 1 - unlerp(controls.distanceBounds[0], controls.distanceBounds[1], controls.distance)
    if (dist > 0.5 && !hasShownRotate) {
      hasShownRotate = true
      reloadText('spin to hear binaural')
    }
    
    reverb.dry.value = dist
    binauralFIRNode.setPosition(angleX, lerp(-180, 180, angleY), 1)
    
    let bounce = (Math.sin(Math.cos(time * 6)) * 0.5 + 0.5)
    bounce = 1.0 + ease(bounce) * 0.5
    hotSpot.scale.set(bounce, bounce, bounce)
  })
}
