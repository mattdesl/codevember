# codevember

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Desktop recommended for all demos. Some are mobile-friendly.

See here for the full grid and basic descriptions:

http://mattdesl.github.io/codevember/

![screenshots](http://i.imgur.com/B31tgZc.jpg)

## Running

Clone this repo, then:

```sh
npm install

# start day 1 demo
npm start 1

# start day 5 and launch browser
npm start -- 1 --open
```

You can `npm run start -- 5 --open` to launch day 5 and open the browser to [http://localhost:9966/](http://localhost:9966/).

To build all demos:

```sh
npm run build
```

To build one demo:

```sh
node build.js 2
```

To run main grid:

```sh
npm start
```

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/codevember/blob/master/LICENSE.md) for details.
