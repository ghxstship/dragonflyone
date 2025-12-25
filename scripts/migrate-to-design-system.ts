#!/usr/bin/env npx ts-node

/**
 * UI Normalization Migration Script
 * 
 * This script identifies and reports pages that need migration from inline
 * Tailwind classes to the normalized @ghxstship/ui component system.
 * 
 * Migration patterns:
 * - <div className="p-6"> → <Container> or <MainContent padding="lg">
 * - <div className="flex ..."> → <Stack direction="horizontal">
 * - <div className="grid ..."> → <Grid cols={n}>
 * - <div className="space-y-*"> → <Stack gap={n}>
 * - <div className="bg-background border-2 ..."> → <Card>
 * - Raw status badges → <Badge>
 * - Inline loading states → <Skeleton>
 * - Inline empty states → <EmptyState>
 */

import * as fs from 'fs';
import * as path from 'path';

interface MigrationReport {
  file: string;
  inlineClassCount: number;
  rawDivCount: number;
  patterns: string[];
  priority: 'high' | 'medium' | 'low';
}

const APPS_DIR = path.join(__dirname, '..', 'apps');

const MIGRATION_PATTERNS = [
  { pattern: /className="p-[0-9]+/g, replacement: 'Use Container or MainContent with padding prop' },
  { pattern: /className="flex /g, replacement: 'Use Stack with direction="horizontal"' },
  { pattern: /className="grid /g, replacement: 'Use Grid component' },
  { pattern: /className="space-y-/g, replacement: 'Use Stack with gap prop' },
  { pattern: /className="space-x-/g, replacement: 'Use Stack direction="horizontal" with gap prop' },
  { pattern: /className="bg-background border-2/g, replacement: 'Use Card component' },
  { pattern: /className="animate-pulse/g, replacement: 'Use Skeleton component' },
  { pattern: /className="text-center py-[0-9]+ text-muted/g, replacement: 'Use EmptyState component' },
  { pattern: /<div className="/g, replacement: 'Replace div with Box, Stack, or semantic component' },
];

function analyzeFile(filePath: string): MigrationReport | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const inlineClassCount = (content.match(/className="/g) || []).length;
  const rawDivCount = (content.match(/<div /g) || []).length;
  
  if (inlineClassCount < 10) return null;
  
  const patterns: string[] = [];
  for (const { pattern, replacement } of MIGRATION_PATTERNS) {
    if (pattern.test(content)) {
      patterns.push(replacement);
    }
  }
  
  const priority: 'high' | 'medium' | 'low' = 
    inlineClassCount > 50 ? 'high' : 
    inlineClassCount > 25 ? 'medium' : 'low';
  
  return {
    file: filePath,
    inlineClassCount,
    rawDivCount,
    patterns: [...new Set(patterns)],
    priority,
  };
}

function findPageFiles(dir: string): string[] {
  const files: string[] = [];
  
  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        walk(fullPath);
      } else if (entry.name === 'page.tsx') {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

function main() {
  console.log('🔍 Scanning for pages needing UI normalization...\n');
  
  const reports: MigrationReport[] = [];
  
  for (const app of ['atlvs', 'compvss', 'gvteway']) {
    const appDir = path.join(APPS_DIR, app, 'src', 'app');
    if (!fs.existsSync(appDir)) continue;
    
    const pageFiles = findPageFiles(appDir);
    for (const file of pageFiles) {
      const report = analyzeFile(file);
      if (report) {
        reports.push(report);
      }
    }
  }
  
  reports.sort((a, b) => b.inlineClassCount - a.inlineClassCount);
  
  console.log('📊 UI Normalization Report\n');
  console.log('=' .repeat(80));
  
  const highPriority = reports.filter(r => r.priority === 'high');
  const mediumPriority = reports.filter(r => r.priority === 'medium');
  const lowPriority = reports.filter(r => r.priority === 'low');
  
  console.log(`\n🔴 HIGH PRIORITY (${highPriority.length} pages with 50+ inline classes):\n`);
  for (const report of highPriority.slice(0, 20)) {
    const relativePath = path.relative(APPS_DIR, report.file);
    console.log(`  ${report.inlineClassCount} classes: ${relativePath}`);
  }
  
  console.log(`\n🟡 MEDIUM PRIORITY (${mediumPriority.length} pages with 25-50 inline classes)`);
  console.log(`\n🟢 LOW PRIORITY (${lowPriority.length} pages with 10-25 inline classes)`);
  
  console.log('\n' + '='.repeat(80));
  console.log(`\nTotal pages needing migration: ${reports.length}`);
  console.log(`Total inline className usages: ${reports.reduce((sum, r) => sum + r.inlineClassCount, 0)}`);
}

main();
