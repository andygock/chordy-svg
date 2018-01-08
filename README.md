# chordy-svg

Node JS module for generating guitar chord diagrams in SVG format. Interval names are shown inside the dotted positions.

![Example 1](http://andygock.github.io/chordy-svg/Cmaj7-2-x35453.svg) ![Example 2](http://andygock.github.io/chordy-svg/C13-1-8x89aa.svg)

## Demo

You can see this library being used at <https://chords.gock.net/>

## Installation

Install module:

    npm install chordy-svg --save

## Simple example

Create a node application `test.js`

```js
require('chordy-svg');

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

Create SVG

    node test.js > output.svg

## Notes

Not fully tested for chords with open strings.
