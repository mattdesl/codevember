const clamp = require('clamp')

export function index2freq (n, sampleRate, fftSize) {
  return n * sampleRate / fftSize
}

export function freq2index (freq, sampleRate, fftSize) {
  return clamp(Math.floor(freq / (sampleRate / fftSize)), 0, fftSize / 2)
}

export function frequencyAverages (sampleRate, fftSize) {
  return function getAverage (freqs, minHz, maxHz) {
    let start = freq2index(minHz, sampleRate, fftSize)
    let end = freq2index(maxHz, sampleRate, fftSize)
    const count = end - start
    let sum = 0
    for (; start < end; start++) {
      sum += freqs[start] / 255
    }
    return count === 0 ? 0 : (sum / count)
  }
}