import { describe, it, expect } from 'vitest';
import { fontConfig, getGoogleFontsUrl, fontVariables, generateFontPreloadLinks } from '../fonts.js';

describe('fontConfig', () => {
  it('defines anton font configuration', () => {
    expect(fontConfig.anton.family).toBe('Anton');
    expect(fontConfig.anton.weights).toContain(400);
    expect(fontConfig.anton.display).toBe('swap');
  });

  it('defines bebasNeue font configuration', () => {
    expect(fontConfig.bebasNeue.family).toBe('Bebas Neue');
    expect(fontConfig.bebasNeue.weights).toContain(400);
    expect(fontConfig.bebasNeue.display).toBe('swap');
  });

  it('defines shareTech font configuration', () => {
    expect(fontConfig.shareTech.family).toBe('Share Tech');
    expect(fontConfig.shareTech.weights).toContain(400);
    expect(fontConfig.shareTech.display).toBe('swap');
  });

  it('defines shareTechMono font configuration', () => {
    expect(fontConfig.shareTechMono.family).toBe('Share Tech Mono');
    expect(fontConfig.shareTechMono.weights).toContain(400);
    expect(fontConfig.shareTechMono.display).toBe('swap');
  });
});

describe('getGoogleFontsUrl', () => {
  it('returns a valid Google Fonts URL', () => {
    const url = getGoogleFontsUrl();
    expect(url).toContain('https://fonts.googleapis.com/css2');
  });

  it('includes all font families', () => {
    const url = getGoogleFontsUrl();
    expect(url).toContain('Anton');
    expect(url).toContain('Bebas+Neue');
    expect(url).toContain('Share+Tech');
    expect(url).toContain('Share+Tech+Mono');
  });

  it('includes display=swap parameter', () => {
    const url = getGoogleFontsUrl();
    expect(url).toContain('display=swap');
  });

  it('properly encodes spaces as plus signs', () => {
    const url = getGoogleFontsUrl();
    expect(url).not.toContain('Bebas Neue');
    expect(url).toContain('Bebas+Neue');
  });
});

describe('fontVariables', () => {
  it('defines display font variable', () => {
    expect(fontVariables['--font-display']).toBe('Anton');
  });

  it('defines heading font variable', () => {
    expect(fontVariables['--font-heading']).toBe('Bebas Neue');
  });

  it('defines body font variable', () => {
    expect(fontVariables['--font-body']).toBe('Share Tech');
  });

  it('defines code font variable', () => {
    expect(fontVariables['--font-code']).toBe('Share Tech Mono');
  });
});

describe('generateFontPreloadLinks', () => {
  it('returns an array of link objects', () => {
    const links = generateFontPreloadLinks();
    expect(Array.isArray(links)).toBe(true);
    expect(links.length).toBe(3);
  });

  it('includes preconnect to fonts.googleapis.com', () => {
    const links = generateFontPreloadLinks();
    const preconnect = links.find(l => l.href === 'https://fonts.googleapis.com');
    expect(preconnect).toBeDefined();
    expect(preconnect?.rel).toBe('preconnect');
  });

  it('includes preconnect to fonts.gstatic.com with crossOrigin', () => {
    const links = generateFontPreloadLinks();
    const preconnect = links.find(l => l.href === 'https://fonts.gstatic.com');
    expect(preconnect).toBeDefined();
    expect(preconnect?.rel).toBe('preconnect');
    expect(preconnect?.crossOrigin).toBe('anonymous');
  });

  it('includes stylesheet link to Google Fonts', () => {
    const links = generateFontPreloadLinks();
    const stylesheet = links.find(l => l.rel === 'stylesheet');
    expect(stylesheet).toBeDefined();
    expect(stylesheet?.href).toContain('fonts.googleapis.com');
  });
});
