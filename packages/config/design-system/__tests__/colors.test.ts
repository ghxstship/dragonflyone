import { describe, it, expect } from 'vitest';
import { 
  grayscale, 
  semantic, 
  generateAccentScale,
  brandAccents
} from '../tokens/colors';

describe('Color System', () => {
  describe('Grayscale', () => {
    it('should have all required gray values', () => {
      expect(grayscale.white).toBe('#FFFFFF');
      expect(grayscale.black).toBe('#000000');
      expect(Object.keys(grayscale.gray)).toHaveLength(13);
    });
    
    it('should have progressive gray values', () => {
      const grayValues = Object.entries(grayscale.gray)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([, v]) => v);
      
      // Each subsequent gray should be darker (lower luminance)
      for (let i = 1; i < grayValues.length; i++) {
        const prevLum = getLuminance(grayValues[i - 1]);
        const currLum = getLuminance(grayValues[i]);
        expect(currLum).toBeLessThan(prevLum);
      }
    });
  });
  
  describe('GHXSTSHIP Brand Accents', () => {
    it('should generate valid accent scales for all brands', () => {
      expect(brandAccents.atlvs.primary).toBe('#FF10F0');  // Electric Pink
      expect(brandAccents.compvss.primary).toBe('#FFD100'); // Electric Yellow
      expect(brandAccents.gvteway.primary).toBe('#00F0FF'); // Electric Cyan
    });
    
    it('should have darker hover states', () => {
      for (const [, scale] of Object.entries(brandAccents)) {
        const primaryLum = getLuminance(scale.primary);
        const hoverLum = getLuminance(scale.hover);
        expect(hoverLum).toBeLessThan(primaryLum);
      }
    });
    
    it('should have appropriate foreground contrast', () => {
      for (const [, scale] of Object.entries(brandAccents)) {
        const contrast = getContrastRatio(scale.primary, scale.foreground);
        expect(contrast).toBeGreaterThanOrEqual(4.5); // WCAG AA
      }
    });
    
    it('should use correct GHXSTSHIP brand colors', () => {
      // ATLVS - Electric Pink
      expect(brandAccents.atlvs.primary).toBe('#FF10F0');
      expect(brandAccents.atlvs.hover).toBe('#E60ED8');
      expect(brandAccents.atlvs.active).toBe('#CC0CC0');
      
      // COMPVSS - Electric Yellow
      expect(brandAccents.compvss.primary).toBe('#FFD100');
      expect(brandAccents.compvss.hover).toBe('#E6BC00');
      expect(brandAccents.compvss.active).toBe('#CCA700');
      
      // GVTEWAY - Electric Cyan
      expect(brandAccents.gvteway.primary).toBe('#00F0FF');
      expect(brandAccents.gvteway.hover).toBe('#00D8E6');
      expect(brandAccents.gvteway.active).toBe('#00C0CC');
    });
  });
  
  describe('Semantic Colors', () => {
    it('should have distinct semantic colors', () => {
      expect(semantic.success.base).not.toBe(semantic.error.base);
      expect(semantic.warning.base).not.toBe(semantic.success.base);
    });
    
    it('should meet contrast requirements', () => {
      const semanticPairs = [
        [semantic.success.base, semantic.success.foreground],
        [semantic.warning.base, semantic.warning.foreground],
        [semantic.error.base, semantic.error.foreground],
      ];
      
      for (const [bg, fg] of semanticPairs) {
        const contrast = getContrastRatio(bg, fg);
        expect(contrast).toBeGreaterThanOrEqual(4.5);
      }
    });
  });
  
  describe('Custom Accent Generation', () => {
    it('should generate valid scale from custom color', () => {
      const customScale = generateAccentScale('#8B5CF6'); // Purple
      
      expect(customScale.primary).toBe('#8B5CF6');
      expect(customScale.hover).toBeDefined();
      expect(customScale.subtle).toContain('#8B5CF6');
      expect(customScale.foreground).toMatch(/^#(FFFFFF|000000)$/);
    });
    
    it('should reject invalid hex colors', () => {
      expect(() => generateAccentScale('not-a-color')).toThrow();
      expect(() => generateAccentScale('#GGG')).toThrow();
    });
  });
});

// Helper functions
function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const adjust = (c: number) => 
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  
  return 0.2126 * adjust(r) + 0.7152 * adjust(g) + 0.0722 * adjust(b);
}

function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
