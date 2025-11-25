/**
 * Accessibility Testing Utilities
 * Comprehensive utilities for screen reader testing and WCAG 2.1 AA compliance
 */

import { Page } from '@playwright/test';

export interface AccessibilityViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary: string;
  }>;
}

export interface AccessibilityReport {
  violations: AccessibilityViolation[];
  passes: number;
  incomplete: number;
  url: string;
  timestamp: string;
}

/**
 * Screen Reader Testing Utilities
 */
export class ScreenReaderTester {
  constructor(private page: Page) {}

  /**
   * Verify element has proper ARIA label
   */
  async hasAccessibleName(selector: string): Promise<boolean> {
    const element = await this.page.locator(selector);
    const role = await element.getAttribute('role');
    const ariaLabel = await element.getAttribute('aria-label');
    const ariaLabelledby = await element.getAttribute('aria-labelledby');
    const title = await element.getAttribute('title');
    const text = await element.textContent();

    return !!(ariaLabel || ariaLabelledby || title || text || role);
  }

  /**
   * Check if element is keyboard accessible
   */
  async isKeyboardAccessible(selector: string): Promise<boolean> {
    const element = await this.page.locator(selector);
    const tabindex = await element.getAttribute('tabindex');
    const role = await element.getAttribute('role');
    const tagName = await element.evaluate((el) => el.tagName.toLowerCase());

    // Check if naturally focusable or has tabindex
    const naturallyFocusable = ['a', 'button', 'input', 'select', 'textarea'].includes(tagName);
    const hasFocusableRole = ['button', 'link', 'tab'].includes(role || '');
    const hasTabindex = tabindex !== null && parseInt(tabindex) >= 0;

    return naturallyFocusable || hasFocusableRole || hasTabindex;
  }

  /**
   * Verify ARIA live regions for dynamic content
   */
  async hasLiveRegion(selector: string): Promise<{
    hasLive: boolean;
    polite: boolean;
    atomic: boolean;
  }> {
    const element = await this.page.locator(selector);
    const ariaLive = await element.getAttribute('aria-live');
    const ariaAtomic = await element.getAttribute('aria-atomic');

    return {
      hasLive: !!ariaLive,
      polite: ariaLive === 'polite',
      atomic: ariaAtomic === 'true',
    };
  }

  /**
   * Check landmark regions for proper page structure
   */
  async validateLandmarks(): Promise<{
    valid: boolean;
    missing: string[];
    found: string[];
  }> {
    const requiredLandmarks = ['banner', 'navigation', 'main', 'contentinfo'];
    const found: string[] = [];
    const missing: string[] = [];

    for (const landmark of requiredLandmarks) {
      const exists = await this.page.locator(`[role="${landmark}"], ${landmark === 'banner' ? 'header' : landmark === 'contentinfo' ? 'footer' : landmark}`).count();
      if (exists > 0) {
        found.push(landmark);
      } else {
        missing.push(landmark);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
      found,
    };
  }

  /**
   * Test keyboard navigation flow
   */
  async testKeyboardNavigation(): Promise<{
    canNavigate: boolean;
    focusableElements: number;
    trapFound: boolean;
  }> {
    // Get all focusable elements
    const focusableElements = await this.page.locator(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ).count();

    // Test tab navigation
    let canTab = true;
    let trapFound = false;
    try {
      await this.page.keyboard.press('Tab');
      const firstFocus = await this.page.evaluate(() => document.activeElement?.tagName);
      await this.page.keyboard.press('Tab');
      const secondFocus = await this.page.evaluate(() => document.activeElement?.tagName);
      
      // Check for focus trap
      if (firstFocus === secondFocus) {
        trapFound = true;
      }
    } catch (error) {
      canTab = false;
    }

    return {
      canNavigate: canTab,
      focusableElements,
      trapFound,
    };
  }
}

/**
 * Color Contrast Checker
 */
export class ContrastChecker {
  /**
   * Calculate relative luminance
   */
  private getLuminance(r: number, g: number, b: number): number {
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    const r2 = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g2 = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b2 = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r2 + 0.7152 * g2 + 0.0722 * b2;
  }

  /**
   * Calculate contrast ratio
   */
  getContrastRatio(fg: string, bg: string): number {
    // Parse RGB values (simplified, assumes #RRGGBB format)
    const fgRGB = this.hexToRgb(fg);
    const bgRGB = this.hexToRgb(bg);

    if (!fgRGB || !bgRGB) return 0;

    const fgLum = this.getLuminance(fgRGB.r, fgRGB.g, fgRGB.b);
    const bgLum = this.getLuminance(bgRGB.r, bgRGB.g, bgRGB.b);

    const lighter = Math.max(fgLum, bgLum);
    const darker = Math.min(fgLum, bgLum);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /**
   * Check if contrast meets WCAG AA standard
   */
  meetsWCAG_AA(fg: string, bg: string, isLargeText: boolean = false): boolean {
    const ratio = this.getContrastRatio(fg, bg);
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }

  /**
   * Check if contrast meets WCAG AAA standard
   */
  meetsWCAG_AAA(fg: string, bg: string, isLargeText: boolean = false): boolean {
    const ratio = this.getContrastRatio(fg, bg);
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
}

/**
 * Accessibility Test Runner
 */
export class AccessibilityTestRunner {
  constructor(private page: Page) {}

  /**
   * Run comprehensive accessibility audit using axe-core
   */
  async runAudit(): Promise<AccessibilityReport> {
    // Inject axe-core if not already present
    await this.page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js',
    });

    // Run axe analysis
    const results = await this.page.evaluate(() => {
      return (window as any).axe.run();
    });

    return {
      violations: results.violations.map((v: any) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.map((n: any) => ({
          html: n.html,
          target: n.target,
          failureSummary: n.failureSummary,
        })),
      })),
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      url: this.page.url(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Test specific WCAG criteria
   */
  async testWCAGCriteria(level: 'A' | 'AA' | 'AAA' = 'AA'): Promise<{
    passed: number;
    failed: number;
    violations: AccessibilityViolation[];
  }> {
    await this.page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js',
    });

    const results = await this.page.evaluate((wcagLevel) => {
      return (window as any).axe.run({
        runOnly: {
          type: 'tag',
          values: [`wcag2${wcagLevel === 'A' ? 'a' : wcagLevel === 'AA' ? 'aa' : 'aaa'}`],
        },
      });
    }, level);

    return {
      passed: results.passes.length,
      failed: results.violations.length,
      violations: results.violations,
    };
  }
}

/**
 * Playwright Test Helpers
 */
export const accessibilityHelpers = {
  /**
   * Create screen reader tester
   */
  createScreenReaderTester(page: Page): ScreenReaderTester {
    return new ScreenReaderTester(page);
  },

  /**
   * Create contrast checker
   */
  createContrastChecker(): ContrastChecker {
    return new ContrastChecker();
  },

  /**
   * Create accessibility test runner
   */
  createTestRunner(page: Page): AccessibilityTestRunner {
    return new AccessibilityTestRunner(page);
  },

  /**
   * Quick accessibility check
   */
  async quickCheck(page: Page): Promise<boolean> {
    const runner = new AccessibilityTestRunner(page);
    const report = await runner.runAudit();
    const criticalViolations = report.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    return criticalViolations.length === 0;
  },
};

export default accessibilityHelpers;
