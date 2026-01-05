/**
 * Audit all color combinations for WCAG compliance
 * Using GHXSTSHIP color system
 */

import { grayscale, semantic, brandAccents } from '../packages/config/design-system/tokens/colors';

interface ContrastResult {
  foreground: string;
  background: string;
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  usage: string;
}

function auditContrast(): ContrastResult[] {
  const results: ContrastResult[] = [];
  
  // Text on backgrounds
  const textBackgroundPairs = [
    // Primary text on surfaces
    { fg: grayscale.gray[900], bg: grayscale.white, usage: 'Primary text on white' },
    { fg: grayscale.gray[900], bg: grayscale.gray[50], usage: 'Primary text on gray-50' },
    { fg: grayscale.gray[600], bg: grayscale.white, usage: 'Secondary text on white' },
    { fg: grayscale.gray[50], bg: grayscale.gray[900], usage: 'Primary text on dark' },
    { fg: grayscale.gray[400], bg: grayscale.gray[900], usage: 'Secondary text on dark' },
    
    // GHXSTSHIP Accent text
    { fg: brandAccents.atlvs.primary, bg: grayscale.white, usage: 'ATLVS accent on white' },
    { fg: brandAccents.compvss.primary, bg: grayscale.white, usage: 'COMPVSS accent on white' },
    { fg: brandAccents.gvteway.primary, bg: grayscale.white, usage: 'GVTEWAY accent on white' },
    
    // Text on accent
    { fg: brandAccents.atlvs.foreground, bg: brandAccents.atlvs.primary, usage: 'Text on ATLVS accent' },
    { fg: brandAccents.compvss.foreground, bg: brandAccents.compvss.primary, usage: 'Text on COMPVSS accent' },
    { fg: brandAccents.gvteway.foreground, bg: brandAccents.gvteway.primary, usage: 'Text on GVTEWAY accent' },
    
    // Semantic
    { fg: semantic.success.foreground, bg: semantic.success.base, usage: 'Text on success' },
    { fg: semantic.warning.foreground, bg: semantic.warning.base, usage: 'Text on warning' },
    { fg: semantic.error.foreground, bg: semantic.error.base, usage: 'Text on error' },
  ];
  
  for (const { fg, bg, usage } of textBackgroundPairs) {
    const ratio = getContrastRatio(fg, bg);
    results.push({
      foreground: fg,
      background: bg,
      ratio: Math.round(ratio * 100) / 100,
      passesAA: ratio >= 4.5,
      passesAAA: ratio >= 7,
      usage,
    });
  }
  
  return results;
}

function generateReport(results: ContrastResult[]): string {
  const passing = results.filter(r => r.passesAA);
  const failing = results.filter(r => !r.passesAA);
  
  let report = `# GHXSTSHIP Color Accessibility Audit\n\n`;
  report += `## Summary\n`;
  report += `- Total combinations tested: ${results.length}\n`;
  report += `- Passing WCAG AA: ${passing.length}\n`;
  report += `- Passing WCAG AAA: ${results.filter(r => r.passesAAA).length}\n`;
  report += `- Failing: ${failing.length}\n\n`;
  
  if (failing.length > 0) {
    report += `## ⚠️ Failing Combinations\n\n`;
    report += `| Usage | Ratio | Required |\n`;
    report += `|-------|-------|----------|\n`;
    for (const r of failing) {
      report += `| ${r.usage} | ${r.ratio}:1 | 4.5:1 |\n`;
    }
    report += `\n`;
  }
  
  report += `## ✅ Passing Combinations\n\n`;
  report += `| Usage | Ratio | AA | AAA |\n`;
  report += `|-------|-------|----|----|---|\n`;
  for (const r of passing) {
    report += `| ${r.usage} | ${r.ratio}:1 | ✅ | ${r.passesAAA ? '✅' : '—'} |\n`;
  }
  
  return report;
}

// Helper functions
function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const adjust = (c: number) => 
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  
  return 0.2126 * adjust(r) + 0.7152 * adjust(g) + 0.0722 * adjust(b);
}

// Run audit
const results = auditContrast();
const report = generateReport(results);
// eslint-disable-next-line no-console
console.log(report);

// Fail if any combinations don't pass AA
const failures = results.filter(r => !r.passesAA);
if (failures.length > 0) {
  // eslint-disable-next-line no-console
  console.error(`\n❌ ${failures.length} color combinations fail WCAG AA requirements`);
  process.exit(1);
} else {
  // eslint-disable-next-line no-console
  console.log(`\n✅ All ${results.length} color combinations pass WCAG AA requirements`);
}
