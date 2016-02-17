const fatal = require('./fatal-error')()

module.exports = error
function error (err) {
  if (err) console.error(err)
  return fatal(`
    <div>Only supported on Desktop Chrome & FireFox.</div>
    <div>See my other <strong>#codevember</strong> demos at
    <a target="_top" href="https://github.com/mattdesl/codevember">
    https://github.com/mattdesl/codevember</a>.</div>
  `)
}