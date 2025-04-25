// types/chordySvg.d.ts

declare namespace Global {
  const Tonal: typeof import("tonal");
  const debug: (namespace: string) => (...args: any[]) => void;
  const SVG: any;
  const document: Document;
}

declare module "chordy-svg" {
  export interface Config {
    stringCount: number;
    fretCount: number;
    fretLength: number;
    stringPitch: number;
    stringWidth: number;
    dotDiameter: number;
    fontSizeDot: number;
    fontSizeX: number;
    fontSizeFretNumber: number;
    fontSizeTitle: number;
    stringIntervals: number[];
    stringLowest: string;
    display: "interval" | "note" | "interval-full";
    offset: {
      x: number;
      y: number;
    };
    colorRootBackground: string;
    fontDir: string;
    fontFamilyMappings: Record<string, string>;
    target: HTMLElement | object;
  }

  export interface SvgConfig {
    fontSizeMultiplier: number;
    offsetX: number;
    offsetY: number;
    height: number;
    width: number;
  }

  export interface Chord {
    name: string;
    shape: string;
    comment?: string;
    containsOpen: boolean;
    containsMute: boolean;
    fretted: number[];
    stringsOpen: number[];
    stringsMute: number[];
    root: number;
    string: Array<{
      semitone: number;
      intervalName: string;
      noteName: string;
    }>;
    semitones: number[];
    notes: string[];
    minFret?: number;
    maxFret?: number;
  }

  export interface InputChord {
    name: string;
    shape: string;
    comment?: string;
    root: number;
  }

  export class ChordySvg {
    private config: Config;
    private svgConfig: SvgConfig;
    private chord: Chord;
    private svgChord: any;
    private svgData: string;

    constructor(input: InputChord, options?: Partial<Config>);

    svg(): string;

    notes(): string[];

    private processChord(input: InputChord): void;

    private drawStrings(group: any): this;

    private drawX(groupX: any, input: InputChord): void;

    private drawDots(groupDots: any): void;

    private drawTitle(groupTitle: any): void;

    private isEmpty(obj: object): boolean;
  }

  export default ChordySvg;
}
