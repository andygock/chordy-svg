# chordy-svg

Node JS module for generating guitar chord diagrams in SVG format. Interval names are shown inside the dotted positions.

![Example 1](http://andygock.github.io/chordy-svg/Cmaj7-2-x35453.svg) ![Example 2](http://andygock.github.io/chordy-svg/C13-1-8x89aa.svg)

The [GitHub page](https://github.com/andygock/chordy-svg) may contain more up to date code than the NPM release. Please check GitHub for the most recent updates.

## Demo

You can see this library being used at <https://chords.gock.net/>

## Installation

Install module:

    npm install chordy-svg --save

## Simple example

Create a node application `test.js`. This will create a SVG diagram and write the contents to stdout.

```js
const ChordySvg = require('chordy-svg');

const voicing = {
    name: "Cmaj7",
    shape: "x35453",
    root: 2,
    comment: ""
};

const svg = new ChordySvg(voicing);
const data = svg.svg();
process.stdout.write(data);
```

If you've cloned the library from GitHub instead of using NPM, you'll need to replace `require('chordy-svg')` with the correct path, e.g `require('./chordy-svg')`

Create SVG

    node test.js > output.svg

## Input

In the example above, we used:

```js
const voicing = {
    name: "Cmaj7",
    shape: "x35453",
    root: 2,
    comment: ""
};
```

The properties for this object are:

- `name` is the name of the chord and will be displayed as a title in the SVG
- `shape` is the shape of the chord, starting from the lowest / thickest string.
    - `x`: muted or skipped string.
    - `0`: open string (open strings not properly tested yet)
    - `[0-9a-f]`: hexadecimal value refers to fret position. e.g `b` refers to fret position `11`. Only up to fret position `15` (hex `f`) is permitted.
- `root` is the root string. `0` refers to the lowest frequency / thickest string. On 6 string guitars with EADGBE tuning, `5` refers to the high E string. In the generated diagram, the dot for this position will be coloured red by default.

A second parameters to the `ChordySvg()` may be used to set more custom parameters (documentation not complete yet).

## Notes

Not fully tested for chords with open strings.
