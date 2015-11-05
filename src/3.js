const clamp = require('clamp')
const THREE = require('three')
const createOrbitViewer = require('three-orbit-viewer')(THREE)
const createAnalyser = require('web-audio-analyser')
const lerp = require('lerp')
const glslify = require('glslify')
const newArray = require('new-array')

const AudioContext = window.AudioContext || window.webkitAudioContext

// dumb mobile test
const isMobile = /(iPad|iPhone|Android)/i.test(navigator.userAgent)

require('soundcloud-badge')({
  client_id: 'b95f61a90da961736c03f659c03cb0cc',
  song: 'https://soundcloud.com/else-official/else-zephyr',
  dark: true,
  getFonts: true
}, function (err, src, data, div) {
  const app = createOrbitViewer({
    clearColor: 0xffffff,
    clearAlpha: 1,
    fov: 60,
    contextAttributes: {
      antialias: false,
      alpha: false
    },
    devicePixelRatio: Math.min(2, window.devicePixelRatio),
    position: new THREE.Vector3(0, 0, -2)
  })
  app.controls.noRotate = true
  app.controls.noPan = true
  app.controls.noZoom = true

  var play = document.querySelector('.play')
  let audio
  if (!err) {
    audio = new Audio()
    audio.crossOrigin = 'Anonymous'
    audio.src = src
  } else {
    console.warn("No music!")
    console.error(err)
  }
  
  const geometry = new THREE.TorusGeometry(0.95, 0.15, 65, 200)
  const freqLow = newArray(geometry.vertices.length, 0.0)
  const freqMid = freqLow.slice()
  const freqHigh = freqLow.slice()
    
  const material = new THREE.ShaderMaterial({
    vertexShader: glslify('./shaders/3.vert'),
    fragmentShader: glslify('./shaders/3.frag'),
    uniforms: {
      iGlobalTime: { type: 'f', value: 0 },
      ring: { type: 'i', value: 0 },
      color: { type: 'c', value: new THREE.Color() },
      opacity: { type: 'f', value: 0.25 }
    },
    // blending: THREE.AdditiveBlending,
    transparent: true,
    attributes: {
      freqLow: { type: 'f', value: freqLow },
      freqMid: { type: 'f', value: freqMid },
      freqHigh: { type: 'f', value: freqHigh }
    },
    // depthTest: false,
    defines: {
      USE_MAP: ''
    },
    wireframe: true
  })
  
  const attribList = Object.keys(material.attributes).map(k => material.attributes[k])
  
  const colors = [
    '#000000',
    '#df18a4',
    '#188ddf' 
  ]
  
  const rings = newArray(3).map((_, i) => {
    const mat = material.clone()
    mat.uniforms.ring.value = i
    mat.uniforms.color.value.set(colors[i % colors.length])
    return new THREE.Mesh(geometry, mat)
  })
  
  let analyser, sampleRate, fftSize
  if (audio && AudioContext) {
    analyser = createAnalyser(audio, { stereo: false })
    const analyserNode = analyser.analyser
    sampleRate = analyser.ctx.sampleRate
    fftSize = analyserNode.fftSize
  }
  
  if (!isMobile || !audio) {
    start()
  } else {
    play.style.display = 'flex'
    document.body.removeChild(play)
    document.body.appendChild(play)
    play.addEventListener('click', start, false)
  }
  
  app.on('tick', dt => {
    rings.forEach(ring => {
      ring.material.uniforms.iGlobalTime.value += dt / 1000
      const time = ring.material.uniforms.iGlobalTime.value * 0.5
      const off = 0.15
      ring.rotation.y = Math.sin(time) * off
      ring.rotation.x = Math.sin(Math.cos(time)) * off
    })
    if (analyser)
      compute()
  })
  
  function start () {
    document.body.removeChild(play)
    if (audio) audio.play()
    rings.forEach((ring, i, list) => {
      let a = lerp(0.5, 0.7, i / (list.length - 1))
      if (isMobile) a *= 0.7
      ring.scale.set(a, a, a)
      app.scene.add(ring)
    })
  }

  function compute () {
    const freqs = analyser.frequencies()
    const lowBass = getAverage(freqs, 0, 50)
    // const highBass = getAverage(freqs, 80, 320)
    const midrange = getAverage(freqs, 320, 1280)
    const lowTreble = getAverage(freqs, 4000, 4500)
    // const highTreble = getAverage(freqs, 20480, sampleRate)

    for (var i=0; i < freqLow.length; i++) {
      freqLow[i] = lowBass
      freqMid[i] = midrange
      freqHigh[i] = lowTreble
    }
    
    attribList.forEach(attrib => {
      attrib.needsUpdate = true
    })
  }

  function getAverage (freqs, minHz, maxHz) {
    let start = freq2index(minHz, sampleRate, fftSize)
    let end = freq2index(maxHz, sampleRate, fftSize)
    const count = end - start
    let sum = 0
    for (; start < end; start++) {
      sum += freqs[start] / 255
    }
    return sum / count
  }
})

function index2freq (n, sampleRate, fftSize) {
  return n * sampleRate / fftSize
}

function freq2index (freq, sampleRate, fftSize) {
  return clamp(Math.floor(freq / (sampleRate / fftSize)), 0, fftSize / 2)
}
