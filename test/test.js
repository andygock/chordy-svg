/* eslint prefer-arrow-callback:0, func-names:0, no-console:0 */

const ChordySvg = require('../index');

describe('Generate SVG', function () {

  it('with chord object', function () {
    const voicing = {
      name: "Cmaj7",
      shape: "x35453",
      root: 2,
      comment: ""
    };
    const svg = new ChordySvg(voicing);
    const data = svg.svg();
    if (!data.startsWith('<svg xmlns=')) {
      throw new Error('Invalid SVG output');
    }
  });

  it('fails with invalid char in chord shape', function () {
    const voicing = {
      name: "Cmaj7",
      shape: "x3z453",
      root: 2,
      comment: ""
    };
    try {
      const svg = new ChordySvg(voicing);
      const data = svg.svg();
    } catch (err) {
      // error thrown as expected
      console.log(err.message);
      return;
    }
    throw new Error('Error not thrown');
  });

  it('fails with invalid root position', function () {
    const voicing = {
      name: "Cmaj7",
      shape: "x35453",
      root: 9,
      comment: ""
    };
    try {
      const svg = new ChordySvg(voicing);
      const data = svg.svg();
    } catch (err) {
      // error thrown as expected
      console.log(err.message);
      return;
    }
    throw new Error('Error not thrown');
  });

  it('fails with root on muted string', function () {
    const voicing = {
      name: "Cmaj7",
      shape: "x35453",
      root: 1,
      comment: ""
    };
    try {
      const svg = new ChordySvg(voicing);
      const data = svg.svg();
    } catch (err) {
      // error thrown as expected
      console.log(err.message);
      return;
    }
    throw new Error('Error not thrown');
  });

});
