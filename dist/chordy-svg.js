"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global Tonal, debug, SVG */

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  // only require() these modules if it run from nodejs and not from a browser
  var _window = require("svgdom");
  var _Tonal = require("tonal");
  var debug = require("debug")("app:chordy-svg");
  var _SVG = require("svg.js")(_window);
  var _document = _window.document;

  // these vars need to be global
  global.Tonal = _Tonal;
  global.debug = debug;
  global.SVG = _SVG;
  global.document = _document;
} else {
  if (typeof window.Tonal === "undefined") {
    throw new Error("Tonal not loaded");
  }
  if (typeof window.SVG === "undefined") {
    throw new Error("SVG.js not loaded");
  }
}

var chordySvg = function () {
  function chordySvg(input, options) {
    _classCallCheck(this, chordySvg);

    // start actual constructor
    this.config = {
      stringCount: 6,
      fretCount: 5,
      fretLength: 30,
      stringPitch: 30,
      stringWidth: 1,
      dotDiameter: 25,
      fontSizeDot: 11,
      fontSizeX: 22,
      fontSizeFretNumber: 16,
      fontSizeTitle: 22,
      stringIntervals: [0, 5, 10, 15, 19, 24],
      stringLowest: "E2",
      display: "interval",
      offset: {
        x: 50,
        y: 50
      },
      colorRootBackground: "#c00",
      fontDir: "",
      fontFamilyMappings: {},
      target: {}
    };

    Object.assign(this.config, options);

    // set up fonts
    // ref: https://github.com/svgdotjs/svgdom
    if (this.config.fontDir !== "" && !this.isEmpty(this.config.fontFamilyMappings)) {
      window.setFontDir(this.config.fontDir);
      window.setFontFamilyMappings(this.config.fontFamilyMappings);
      window.preloadFonts();
    }

    this.svgConfig = {
      // experimentally determined, adjust's offset used for Y move() when positioning text
      fontSizeMultiplier: 1.25,

      // offset applied to entire SVG contents
      offsetX: this.config.fontSizeX,
      offsetY: this.config.fontSizeX + this.config.fontSizeTitle * 1.25, // use fontSizeMultiplier here

      // overall width and height of SVG
      height: this.config.fretCount * this.config.fretLength + this.config.fontSizeX + this.config.fontSizeTitle + 20, // the last figure is experimentally determined
      width: this.config.stringCount * (this.config.stringPitch - 1) + 50 // the last figure is experimentally determined
    };

    this.chord = {
      name: input.name,
      shape: input.shape,
      comment: input.comment,
      containsOpen: false,
      containsMute: false,
      fretted: [],
      stringsOpen: [],
      stringsMute: [],
      root: input.root,
      string: [], // array of { semitone, intervalName, noteName }
      semitones: [],
      notes: []
    };
    // debug('chord', this.chord);

    // check inputs
    this.processChord(input);

    var styleData = "";

    // SVG drawing starts here
    // const svgChord = SVG(element).size(svgConfig.width, svgConfig.height);
    if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
      // ran in NodeJS
      this.svgChord = SVG(document.documentElement).size(this.svgConfig.width, this.svgConfig.height);
    } else {
      // ran in browser
      this.svgChord = SVG(this.config.target).size(this.svgConfig.width, this.svgConfig.height);
    }
    this.svgChord.clear();
    this.svgChord.defs().element("style").words(styleData);

    // embed notes
    var def = this.svgChord.defs().attr("id", "tonal");
    def.element("notes").attr("id", "tonal-notes").words(this.chord.notes.join(":"));
    def.element("semitones").attr("id", "tonal-semitones").words(this.chord.semitones.join(":"));

    // embed comment
    def.element("comment").attr("id", "chord-comment").words(this.chord.comment);

    // master group of everything
    var groupMaster = this.svgChord.group();
    groupMaster.attr("id", "master");

    // draw strings
    var groupGrid = groupMaster.group(); // strings and frets
    groupGrid.attr("id", "grid");
    this.drawStrings(groupGrid);

    // draw "X" or "O"
    var groupX = groupMaster.group();
    groupX.attr("id", "X");
    this.drawX(groupX, input);

    // draw dot and text
    var groupDots = groupMaster.group();
    groupDots.attr("id", "dots");
    this.drawDots(groupDots);

    // draw title - FIX positioning here!
    var groupTitle = groupMaster.group();
    groupTitle.attr("id", "title");
    this.drawTitle(groupTitle);

    // move entire diagram, so we can see all it's contents
    // some content was previously negative of it's origin
    groupMaster.move(this.svgConfig.offsetX, this.svgConfig.offsetY);

    // this.svgChord = svgChord;
    this.svgData = this.svgChord.svg();
  }

  _createClass(chordySvg, [{
    key: "svg",
    value: function svg() {
      return this.svgData;
    }
  }, {
    key: "notes",
    value: function notes() {
      return this.chord.notes;
    }

    // check inputs are valid

  }, {
    key: "processChord",
    value: function processChord(input) {
      // calculate important chord properties
      var noteLowest = Tonal.Note.midi(this.config.stringLowest);
      var shape = [];

      for (var i = 0; i < input.shape.length; i++) {
        // i = string number, 0 = string of lowest note
        var fret = parseInt(input.shape[i], 16);

        if (Number.isNaN(fret)) {
          if (input.shape[i] === "x" || input.shape[i] === "X") {
            // muted position
            this.chord.containsMute = true;
            this.chord.stringsMute.push(i);
            shape[i] = "x";
          } else {
            // other non alphanumeric char
            throw new Error("Invalid shape: " + input.shape);
          }
        } else if (fret === 0) {
          // open position
          this.chord.containsOpen = true;
          this.chord.stringsOpen.push(i);

          var semitone = this.config.stringIntervals[i];
          this.chord.semitones.push(semitone);
          this.chord.notes.push(Tonal.Note.fromMidi(noteLowest + semitone));
          shape[i] = fret;
        } else {
          // other numeric position not zero or open
          this.chord.fretted.push(fret);
          var _semitone = this.config.stringIntervals[i] + fret;
          this.chord.semitones.push(_semitone);
          this.chord.notes.push(Tonal.Note.fromMidi(noteLowest + _semitone));
          shape[i] = fret;
        }
      }
      this.chord.minFret = Math.min.apply(Math, _toConsumableArray(this.chord.fretted)); // does not include open strings
      this.chord.maxFret = Math.max.apply(Math, _toConsumableArray(this.chord.fretted));
      this.chord.shape = shape;
    }

    // draw the "grid" of string and frets

  }, {
    key: "drawStrings",
    value: function drawStrings(group) {
      // drawStrings
      var height = this.config.fretCount * this.config.fretLength;
      for (var stringNumber = 0; stringNumber < this.config.stringCount; stringNumber++) {
        group.line(0, 0, 0, height).stroke({
          width: 1
        }).attr("id", "string-" + stringNumber).move(stringNumber * this.config.stringPitch, 0);
      }

      // draw frets
      var width = this.config.stringPitch * (this.config.stringCount - 1);
      for (var fretNumber = 0; fretNumber <= this.config.fretCount; fretNumber++) {
        group.line(0, 0, width, 0).stroke({
          width: 1
        }).attr("id", "fret-" + fretNumber).move(0, fretNumber * this.config.fretLength);
      }

      return this;
    }

    // draw the 'X' and 'O' symbols, representing mutes and open strings

  }, {
    key: "drawX",
    value: function drawX(groupX, input) {
      for (var stringNumber = 0; stringNumber < this.config.stringCount; stringNumber++) {
        if (input.shape[stringNumber] === "X" || input.shape[stringNumber] === "x") {
          groupX.text("X").attr("id", "x-" + stringNumber).font({
            anchor: "middle",
            size: this.config.fontSizeX
          }).fill({
            color: "#000"
          }).move(stringNumber * this.config.stringPitch, -this.config.fontSizeX * this.svgConfig.fontSizeMultiplier);
        }
        if (input.shape[stringNumber] === "0") {
          groupX.text("O").attr("id", "o-" + stringNumber).font({
            anchor: "middle",
            size: this.config.fontSizeX
          }).fill({
            color: "#000"
          }).move(stringNumber * this.config.stringPitch, -this.config.fontSizeX * this.svgConfig.fontSizeMultiplier);
        }
      }
    }

    // draw the fretted dots

  }, {
    key: "drawDots",
    value: function drawDots(groupDots) {
      var offset = {
        dot: {
          x: -this.config.dotDiameter / 2,
          y: -(this.config.dotDiameter / 2) + this.config.fretLength / 2
        },
        text: {
          x: 0,
          y: -this.config.fontSizeDot / 2 * this.svgConfig.fontSizeMultiplier
        }
      };
      // debug(this.chord);

      // note chord.root is indexed first string == 1
      // this.chord.shape is an array of numbers / 'x', 'o' (not hex-like string)
      var x = this.config.stringIntervals[this.chord.root - 1] + parseInt(this.chord.shape[this.chord.root - 1], 10);
      if (Number.isNaN(x)) {
        throw new Error("Root position " + this.chord.root + " has no integer in shape '" + this.chord.shape.join("") + "'");
      }

      // set semitone = 0 at the root position
      // semitoneStart is the semitone at first fret of first string (actual first fret, not neccesarily the first fret shown in diagram)
      var semitoneStart = -x + 1;

      // first fret position shown in diagram, usually 1 for open chords
      var fretNumberStart = void 0;

      if (this.chord.minFret <= 5 && this.chord.maxFret <= 5) {
        fretNumberStart = 1;
      } else {
        fretNumberStart = this.chord.minFret;
      }

      for (var stringNumber = 0; stringNumber < this.config.stringCount; stringNumber++) {
        var semitones = semitoneStart + this.config.stringIntervals[stringNumber] + fretNumberStart - 1;
        // debug({ semitones, fretNumberStart });

        for (var fretNumber = 0; fretNumber < this.config.fretCount; fretNumber++) {
          // fretNumber = 0 is actually the "1st fret shown", a relative fret in the diagram
          var actualFretNumber = fretNumber + fretNumberStart;
          var intervalNameFull = Tonal.Interval.fromSemitones(semitones);
          var intervalName = Tonal.Interval.fromSemitones(semitones % 12); // simplified interval, wraps back to 1P at octave
          var noteNames = Tonal.Note.names(" b");
          var noteName = noteNames[(semitones + 144) % 12]; // fix this, + 144 isn't the best technique
          semitones++;
          // debug({ semitoneStart, semitones, intervalNameFull, intervalName });

          // colorise the root dot, write fret number at root position
          if (parseInt(this.chord.shape[stringNumber], 10) === fretNumber + fretNumberStart) {
            // previously fretNumber + 1 when not using offset
            // matching chord shape position, add a visible dot
            // debug({ semitoneStart, semitones, intervalNameFull, intervalName });

            // draw dots and text
            // const groupDot = groupMaster.group();
            var groupDot = groupDots.group();
            groupDot.attr("id", "dot-" + stringNumber + "-" + fretNumber);

            // dot
            var _x = offset.dot.x + stringNumber * this.config.stringPitch;
            var y = offset.dot.y + fretNumber * this.config.fretLength;
            groupDot.circle(this.config.dotDiameter).attr("id", "circle-" + stringNumber + "-" + fretNumber).move(_x, y);

            // text
            _x = offset.text.x + stringNumber * this.config.stringPitch;
            y = offset.text.y + fretNumber * this.config.fretLength + this.config.fretLength / 2;

            // const textNoteName = groupDot.text(noteName)
            //   .addClass('note')
            //   .attr("id", "circle-" + stringNumber + "-" + fretNumber + "-note")
            //   .fill({ color: '#0f0' })
            //   .font({ anchor: 'middle', size: this.config.fontSize })
            //   .move(x, y)
            //   .hide();

            // const textIntervalFull = groupDot.text(intervalNameFull)
            //   .addClass('interval-full')
            //   .attr("id", "circle-" + stringNumber + "-" + fretNumber + "-interval-full")
            //   .fill({ color: '#fff' })
            //   .font({ anchor: 'middle', size: this.config.fontSizeDot })
            //   .move(x, y)
            //   .hide();

            // write the interval name inside the dot
            var textInterval = groupDot.text(intervalName).addClass("interval").attr("id", "circle-" + stringNumber + "-" + fretNumber + "-interval").fill({
              color: "#fff"
            }).font({
              anchor: "middle",
              size: this.config.fontSizeDot
            }).move(_x, y).hide();

            // note: fretNumber 0 = 1st fret
            // console.log(this.chord);
            if (this.chord.root - 1 === stringNumber) {
              // root dot
              // this part is never run if the root is a open string

              // set colour
              groupDot.select("circle").addClass("dot-root").fill({
                color: this.config.colorRootBackground
              });

              // draw fret number - draw only once at root position if root is not open string
              groupDots.text(actualFretNumber + " fr").attr("id", "fret-number").fill({
                color: "#f00"
              }).font({
                anchor: "left",
                size: this.config.fontSizeFretNumber
              }).move((this.config.stringCount - 1) * this.config.stringPitch + this.config.dotDiameter * 0.6, y);
            }

            // make the dot visible
            groupDot.show();

            // if (this.config.display === "note") {
            //   textNoteName.show();
            // }
            // if (this.config.display === "interval-full") {
            //   textIntervalFull.show();
            // }
            if (this.config.display === "interval") {
              textInterval.show();
            }

            groupDots.add(groupDot);
          }
        } // fret
      } // string

      // if chord has root on a open string, write fret number on diagram
      // this wasn't done earlier for this special case
      if (this.chord.stringsOpen.indexOf(this.chord.root - 1) !== -1) {
        // console.log('open string root');

        // add fret number text
        groupDots.text(fretNumberStart + " fr").attr("id", "fret-number").fill({
          color: "#f00"
        }).font({
          anchor: "left",
          size: this.config.fontSizeFretNumber
        }).move((this.config.stringCount - 1) * this.config.stringPitch + this.config.dotDiameter * 0.6, 1); // 1 = 1st fret position in diagram
      }
    } // chord

    // draw title above diagram

  }, {
    key: "drawTitle",
    value: function drawTitle(groupTitle) {
      groupTitle.text(this.chord.name).attr("id", "title").font({
        anchor: "left",
        size: this.config.fontSizeTitle
      }).fill({
        color: "#000"
      }).move(0, -(this.config.fontSizeX + this.config.fontSizeTitle) * this.svgConfig.fontSizeMultiplier);
    }
  }, {
    key: "isEmpty",
    value: function isEmpty(obj) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          return false;
        }
      }
      return true;
    }
  }]);

  return chordySvg;
}();

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = chordySvg;
} else {
  window.ChordySvg = chordySvg;
}
