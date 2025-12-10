import { describe, it, expect } from 'vitest';
import { ContrastChecker } from '../accessibility-testing';

describe('accessibility-testing', () => {
  describe('ContrastChecker', () => {
    const checker = new ContrastChecker();

    describe('getContrastRatio', () => {
      it('should return 21:1 for black on white', () => {
        const ratio = checker.getContrastRatio('#000000', '#FFFFFF');
        expect(ratio).toBeCloseTo(21, 0);
      });

      it('should return 21:1 for white on black', () => {
        const ratio = checker.getContrastRatio('#FFFFFF', '#000000');
        expect(ratio).toBeCloseTo(21, 0);
      });

      it('should return 1:1 for same colors', () => {
        const ratio = checker.getContrastRatio('#FFFFFF', '#FFFFFF');
        expect(ratio).toBeCloseTo(1, 0);
      });

      it('should handle colors without hash', () => {
        const ratio = checker.getContrastRatio('000000', 'FFFFFF');
        expect(ratio).toBeCloseTo(21, 0);
      });

      it('should return 0 for invalid colors', () => {
        const ratio = checker.getContrastRatio('invalid', '#FFFFFF');
        expect(ratio).toBe(0);
      });

      it('should calculate correct ratio for mid-range colors', () => {
        // Gray (#808080) on white should have moderate contrast
        const ratio = checker.getContrastRatio('#808080', '#FFFFFF');
        expect(ratio).toBeGreaterThan(3);
        expect(ratio).toBeLessThan(5);
      });
    });

    describe('meetsWCAG_AA', () => {
      it('should pass for black on white (normal text)', () => {
        expect(checker.meetsWCAG_AA('#000000', '#FFFFFF')).toBe(true);
      });

      it('should pass for black on white (large text)', () => {
        expect(checker.meetsWCAG_AA('#000000', '#FFFFFF', true)).toBe(true);
      });

      it('should fail for low contrast (normal text)', () => {
        // Light gray on white
        expect(checker.meetsWCAG_AA('#CCCCCC', '#FFFFFF')).toBe(false);
      });

      it('should pass for lower contrast with large text', () => {
        // #767676 on white is about 4.5:1 - passes AA for normal text
        expect(checker.meetsWCAG_AA('#767676', '#FFFFFF', false)).toBe(true);
      });

      it('should require 4.5:1 for normal text', () => {
        // #777777 on white is about 4.48:1 - just under AA for normal text
        expect(checker.meetsWCAG_AA('#777777', '#FFFFFF', false)).toBe(false);
      });

      it('should require 3:1 for large text', () => {
        // #757575 on white is about 4.6:1 - passes for large text
        expect(checker.meetsWCAG_AA('#757575', '#FFFFFF', true)).toBe(true);
      });
    });

    describe('meetsWCAG_AAA', () => {
      it('should pass for black on white (normal text)', () => {
        expect(checker.meetsWCAG_AAA('#000000', '#FFFFFF')).toBe(true);
      });

      it('should pass for black on white (large text)', () => {
        expect(checker.meetsWCAG_AAA('#000000', '#FFFFFF', true)).toBe(true);
      });

      it('should fail for medium contrast (normal text)', () => {
        // Medium gray that passes AA but not AAA
        expect(checker.meetsWCAG_AAA('#767676', '#FFFFFF')).toBe(false);
      });

      it('should require 7:1 for normal text', () => {
        // Dark gray on white
        const ratio = checker.getContrastRatio('#595959', '#FFFFFF');
        expect(ratio).toBeGreaterThan(7);
        expect(checker.meetsWCAG_AAA('#595959', '#FFFFFF', false)).toBe(true);
      });

      it('should require 4.5:1 for large text', () => {
        // #767676 on white is about 4.5:1
        expect(checker.meetsWCAG_AAA('#767676', '#FFFFFF', true)).toBe(true);
      });
    });

    describe('color combinations', () => {
      it('should handle primary brand color on white', () => {
        // Indigo (#6366f1) on white
        const ratio = checker.getContrastRatio('#6366f1', '#FFFFFF');
        expect(ratio).toBeGreaterThan(1);
      });

      it('should handle accent color on dark background', () => {
        // Amber (#f59e0b) on dark gray
        const ratio = checker.getContrastRatio('#f59e0b', '#1f2937');
        expect(ratio).toBeGreaterThan(1);
      });

      it('should handle red on white for errors', () => {
        // Red (#ef4444) on white
        const ratio = checker.getContrastRatio('#ef4444', '#FFFFFF');
        expect(ratio).toBeGreaterThan(3);
      });

      it('should handle green on white for success', () => {
        // Green (#22c55e) on white
        const ratio = checker.getContrastRatio('#22c55e', '#FFFFFF');
        expect(ratio).toBeGreaterThan(1);
      });
    });
  });
});
