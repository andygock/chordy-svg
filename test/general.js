/* eslint prefer-arrow-callback:0, func-names:0, no-console:0 */

const ChordySvg = require("../dist/chordy-svg.js");
const fs = require("fs");
const DOMParser = require("xmldom").DOMParser;
const path = require("path");

const outputDir = path.resolve(__dirname, "output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

describe("Generate SVG", function () {
  const svg = new ChordySvg({
    name: "Cmaj7",
    shape: "x35453",
    root: 2,
    comment: "Test comment",
  });
  const data = svg.svg();
  const doc = new DOMParser().parseFromString(data);

  describe("with valid CMaj7 chord definition", function () {
    it("<svg> ok", function () {
      if (doc.documentElement.getElementsByTagName("svg").length !== 1) {
        throw new Error("Missing <svg> tag");
      }
    });

    it("<notes> is C3:G3:B3:E4:G4", function () {
      const notes = doc.documentElement.getElementsByTagName("notes")[0];
      if (!notes) {
        throw new Error("Missing <notes>");
      }
      if (notes.textContent !== "C3:G3:B3:E4:G4") {
        throw new Error("Notes are incorrect");
      }
    });

    it("<semitones> is 8:15:19:24:27", function () {
      const semitones = doc.documentElement.getElementsByTagName("semitones")[0];
      if (!semitones) {
        throw new Error("Missing <semitones>");
      }
      if (semitones.textContent !== "8:15:19:24:27") {
        throw new Error("Semitones are incorrect");
      }
    });

    it('<comment> is "Test Comment"', function () {
      const comment = doc.documentElement.getElementsByTagName("comment")[0];
      if (!comment) {
        throw new Error("Missing <comment>");
      }
      if (comment.textContent !== "Test comment") {
        throw new Error("comment are incorrect");
      }
    });
  });

  it("fails with invalid char in chord shape", function () {
    expectError({
      name: "Cmaj7",
      shape: "x3z453",
      root: 2,
      comment: "",
    });
  });

  it("fails with invalid root position", function () {
    expectError({
      name: "Cmaj7",
      shape: "x35453",
      root: 9,
      comment: "",
    });
  });

  it("fails with root on muted string", function () {
    expectError({
      name: "Cmaj7",
      shape: "x35453",
      root: 1,
      comment: "",
    });
  });
});

describe("Write SVGs to files (user to review and check files afterwards)", function () {
  const chords = [
    {
      name: "Cmaj7",
      shape: "x35453",
      root: 2,
      comment: "",
    },
    {
      name: "C13sus4",
      shape: "8x8aaa",
      root: 1,
      comment: "No 5th",
    },
    {
      name: "Fm_C",
      shape: "x3656x",
      root: 5,
      comment: "",
    },
    {
      name: "Daad9",
      shape: "xx0770",
      root: 3,
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
