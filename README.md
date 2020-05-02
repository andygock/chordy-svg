# chordy-svg

Node JS module for generating guitar chord diagrams in SVG format. Interval names are shown inside the dotted positions.

![Example 1](http://andygock.github.io/chordy-svg/Cmaj7-2-x35453.svg) ![Example 2](http://andygock.github.io/chordy-svg/C13-1-8x89aa.svg)

A `<defs>` element is written which contains the notes of the chord. This in turn can later be used by the user for audio previews etc.

```xml
<defs xmlns="http://www.w3.org/2000/svg" id="tonal">
  <style id="SvgjsStyle1101"/>
  <notes id="tonal-notes">C3:G3:B3:E4:G4</notes>
  <semitones id="tonal-semitones">8:15:19:24:27</semitones>
  <comment id="chord-comment"/>
</defs>
```

The [GitHub page](https://github.com/andygock/chordy-svg) may contain more up to date code than the NPM release. Please check GitHub for the most recent updates.

It uses:

- [SVG.js](http://svgjs.com/) for SVG manipulation.
- [svgdom](https://github.com/svgdotjs/svgdom) to allow SVG.js to run server-side.
- [tonal](https://github.com/danigb/tonal) music theory library for determining the notes and intervals of defined chords.

## Demo

You can see this library being used at <https://chords.gock.net/>

## Installation

With npm

    npm install chordy-svg --save

## Examples

### Node Example

Create a node application `test.js`. This will create a SVG diagram and write the contents to stdout.

```js
const ChordySvg = require("chordy-svg");

const voicing = {
  name: "Cmaj7",
  shape: "x35453",
  root: 2,
  comment: "",
};

const svg = new ChordySvg(voicing);
const data = svg.svg();
process.stdout.write(data);
```

If you've cloned the library from GitHub instead of using NPM, you'll need to replace `require('chordy-svg')` with the correct path, e.g `require('./chordy-svg')`

Create SVG and write to new file `output.svg`

    node test.js > output.svg

### Browser Example

`chordy-svg.js` is found in `dist/` and can be built with `npm build`.

```html
<div id="image"></div>

<script src="https://cdn.jsdelivr.net/npm/@tonaljs/tonal/browser/tonal.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/svg.js/2.7.1/svg.min.js"></script>
<script src="chordy-svg.js"></script>
<script type="text/javascript">
  // create new svg diagram
  var element = document.getElementById("image");
  var svg = new ChordySvg({ name: "Cmaj7", shape: "x35453", root: 2, comment: "Test comment" }, { target: element });
</script>
```

## Input

In the example above, we used:

```js
const voicing = {
  name: "Cmaj7",
  shape: "x35453",
  root: 2,
  comment: "",
};
```

The properties for this object are:

- `name` is the name of the chord and will be displayed as a title in the SVG
- `shape` is the shape of the chord, starting from the lowest / thickest string.
  - `x`: muted or skipped string.
  - `0`: open string (open strings not properly tested yet)
  - `[0-9a-f]`: hexadecimal value refers to fret position. e.g `b` refers to fret position `11`. Only up to fret position `15` (hex `f`) is permitted.
- `root` is the root string. `0` refers to the lowest frequency / thickest string. On 6 string guitars with EADGBE tuning, `5` refers to the high E string. In the generated diagram, the dot for this position will be coloured red by default.

A second parameter to the `ChordySvg()` constructor may be used to set more custom parameters (documentation not complete yet).

## Development and Testing

For development and building from source, clone Git repo

    git clone https://github.com/andygock/chordy-svg
    cd chordy-svg

Run babel script which watches input file and writes to `test/dist/chordy-svg.js`

    npm run start

You can view live updated output of browser with browser-sync

    npm run serve:start

You can run further tests with Mocha for plain Node usage (this uses `dist/chordy-svg.js`).

    npm run mocha

You can view live updated directory listing of mocha test output with.

    npm run serve:mocha

The `serve:*` scripts are usually done concurrently with the `start` or `mocha` scripts.

Once all is tested well, build to `dist/chordy-svg.js`, ready for publishing to npm.

    npm run build

Run `npm run clean` to delete all built files and generated SVG images from `test/dist/`, `test/output/` and `dist/`

## Notes

Not fully tested for chords with open strings.
