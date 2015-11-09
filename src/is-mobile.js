module.exports = function isMobile () {
  // dumb mobile test
  return /(iPad|iPhone|Android)/i.test(navigator.userAgent)
}