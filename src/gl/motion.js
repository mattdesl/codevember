var vec = require('gl-vec2')
var number = require('as-number')

var World = require('verlet-system')
var Point = require('verlet-point')
var newArray = require('new-array')
var randf = require('random-float')

var Simplex = require('simplex-sampler')

var tmp = [0,0]

function Motion(opt) {
    opt = opt||{}
    this.world = World()

    this._noise = new Simplex(256)
    this._smooth = true
    this._seamless = true
    this._noise.generate()

    this.speed = 1

    var count = number(opt.count, 50)
    this.points = newArray(count).map(function() {
        var p = Point({ position: [Math.random(), Math.random()] })
        p.samplePosition = [Math.random(), Math.random()]
        p.rotation = 0
        p.time = Math.random()
        p.noise = 0
        p.duration = Math.random()*2
        p.speed = Math.random()
        p.white = 0.0
        p.size = 1
        p.color = [0,0,0]
        p.fboColor = [0,0,0]

        var f = 0.001
        p.addForce([ f*randf(-1,1), f*randf(-1,1) ])
        return p
    })
}

Motion.prototype.update = function(dt) {
    this.world.integrate(this.points, dt)

    this.points.forEach(function(p) {
        var noise = this._noise

        var px = p.position[0],
            py = p.position[1],
            noiseSize = noise.size;

        var n = noise.sample(px*noiseSize, py*noiseSize);
        var angle = n * Math.PI * 2 + p.rotation
        vec.set(tmp, Math.cos(angle), Math.sin(angle))
        vec.normalize(tmp, tmp)
        vec.scale(tmp, tmp, 0.0002 * p.speed)
        p.addForce(tmp)
        p.noise = n

        p.rotation += 0.01
        p.time += dt

        var resetBounds = px < 0 || py < 0 || px > 1 || py > 1
        if (p.time > p.duration
            || resetBounds) {
            p.time = 0
            p.speed = Math.random()*this.speed
            p.duration = Math.random()*2
            // p.rotation = Math.random()

            vec.set(tmp, Math.random(), Math.random())
            p.place(tmp)
        }
    }, this)
}

module.exports = function(opt) {
    return new Motion(opt)
}