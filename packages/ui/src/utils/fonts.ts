/**
 * GHXSTSHIP Font Loading Utility
 * Loads the design system fonts from Google Fonts
 */

export const fontConfig = {
  anton: {
    family: "Anton",
    weights: [400],
    display: "swap",
  },
  bebasNeue: {
    family: "Bebas Neue",
    weights: [400],
    display: "swap",
  },
  shareTech: {
    family: "Share Tech",
    weights: [400],
    display: "swap",
  },
  shareTechMono: {
    family: "Share Tech Mono",
    weights: [400],
    display: "swap",
  },
} as const;

/**
 * Generate Google Fonts URL for all design system fonts
 */
export function getGoogleFontsUrl(): string {
  const families = [
    `${fontConfig.anton.family}:${fontConfig.anton.weights.join(",")}`,
    `${fontConfig.bebasNeue.family}:${fontConfig.bebasNeue.weights.join(",")}`,
    `${fontConfig.shareTech.family}:${fontConfig.shareTech.weights.join(",")}`,
    `${fontConfig.shareTechMono.family}:${fontConfig.shareTechMono.weights.join(",")}`,
  ];

  return `https://fonts.googleapis.com/css2?${families
    .map((f) => `family=${f.replace(/ /g, "+")}`)
    .join("&")}&display=swap`;
}

/**
 * CSS Variables for font families
 */
export const fontVariables = {
  "--font-display": fontConfig.anton.family,
  "--font-heading": fontConfig.bebasNeue.family,
  "--font-body": fontConfig.shareTech.family,
  "--font-code": fontConfig.shareTechMono.family,
} as const;

/**
 * Preload font hint for Next.js
 */
export function generateFontPreloadLinks() {
  return [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    {
      rel: "stylesheet",
      href: getGoogleFontsUrl(),
    },
  ];
}
