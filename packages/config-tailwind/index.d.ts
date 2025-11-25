import type { Config } from 'tailwindcss';

export declare const monochromePalette: {
  black: string;
  white: string;
  grey: Record<100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;
};

export declare const fontFamilies: {
  display: string;
  heading: string;
  body: string;
  mono: string;
};

export declare const baseTailwindConfig: Config;

export declare const createTailwindConfig: (overrides?: Partial<Config>) => Config;
