/* eslint prefer-arrow-callback:0, func-names:0, no-console:0 */

const ChordySvg = require("../dist/chordy-svg.js");
const fs = require("fs");
const path = require("path");

const outputDir = path.resolve(__dirname, "output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

describe("Write SVGs to files (user to review and check files afterwards)", function () {
  const chords = [
    {
      name: "Fm_C",
      shape: "x3656x",
      root: 5,
      comment: "",
    },
  ];

  for (let i = 0; i < chords.length; i++) {
    const chord = chords[i];
    const filename = `${chord.name}-${chord.root}-${chord.shape}.svg`;
    it(`write to file: ${filename}`, function (done) {
      // write to file
      saveToFile(chord, filename, done);
    });
  }

  after(function () {
    // console.log("You'll need to clean up the *.svg files after checking them.");
  });
});

function saveToFile(voicing, filename, done) {
  const svg = new ChordySvg(voicing);
  const data = svg.svg();
  if (!data.startsWith("<svg xmlns=")) {
    throw new Error("Invalid SVG data");
  }
  fs.writeFile(path.resolve(outputDir, filename), data, function (err) {
    if (err) {
      throw new Error(err);
    }
    done();
  });
}

function expectError(voicing) {
  try {
    const svg = new ChordySvg(voicing);
    const data = svg.svg();
  } catch (err) {
    // error thrown as expected
    // console.log('Error: ' + err.message);
    return;
  }
  throw new Error("Error not thrown");
}
