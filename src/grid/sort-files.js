module.exports = function sortByName (a, b) {
  var aNum = parseInt(/\d+/.exec(a)[0], 10)
  var bNum = parseInt(/\d+/.exec(b)[0], 10)
  return aNum - bNum
}