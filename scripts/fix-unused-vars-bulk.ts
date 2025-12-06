#!/usr/bin/env npx ts-node

/**
 * Bulk fix unused variables by prefixing with underscore
 * Run: npx ts-node scripts/fix-unused-vars-bulk.ts
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface LintWarning {
  file: string;
  line: number;
  column: number;
  varName: string;
  type: 'import' | 'destructure' | 'param' | 'variable';
}

function parseLintOutput(): LintWarning[] {
  const output = execSync('pnpm lint 2>&1 || true', { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 });
  const warnings: LintWarning[] = [];
  
  // Match patterns like: 50:9  Warning: 'router' is assigned a value but never used
  // or: 5:10  Warning: 'Wifi' is defined but never used
  const lines = output.split('\n');
  let currentFile = '';
  
  for (const line of lines) {
    // Match file path
    const fileMatch = line.match(/\/Users\/[^\s]+\.(ts|tsx)/);
    if (fileMatch) {
      currentFile = fileMatch[0];
      continue;
    }
    
    // Match warning
    const warningMatch = line.match(/(\d+):(\d+)\s+[Ww]arning[:\s]+'(\w+)'\s+is\s+(defined|assigned)/);
    if (warningMatch && currentFile && line.includes('no-unused-vars')) {
      const [, lineNum, col, varName, type] = warningMatch;
      warnings.push({
        file: currentFile,
        line: parseInt(lineNum),
        column: parseInt(col),
        varName,
        type: type === 'defined' ? 'import' : 'variable'
      });
    }
  }
  
  return warnings;
}

function fixUnusedVar(filePath: string, line: number, column: number, varName: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  if (line > lines.length) return false;
  
  const lineContent = lines[line - 1];
  const newVarName = `_${varName}`;
  
  // Skip if already prefixed
  if (varName.startsWith('_')) return false;
  
  // Check if this is an import statement
  if (lineContent.includes('import ')) {
    // For imports, we should remove the unused import instead of prefixing
    // Check if it's a named import like { Wifi, CreditCard }
    const namedImportMatch = lineContent.match(new RegExp(`\\b${varName}\\b`));
    if (namedImportMatch) {
      // Remove the import
      let newLine = lineContent;
      
      // Handle { Wifi, CreditCard } -> { CreditCard }
      newLine = newLine.replace(new RegExp(`${varName},\\s*`), '');
      newLine = newLine.replace(new RegExp(`,\\s*${varName}`), '');
      newLine = newLine.replace(new RegExp(`\\{\\s*${varName}\\s*\\}`), '{ }');
      
      // If the import is now empty, remove the whole line
      if (newLine.match(/import\s+\{\s*\}\s+from/)) {
        lines.splice(line - 1, 1);
      } else if (newLine !== lineContent) {
        lines[line - 1] = newLine;
      }
      
      fs.writeFileSync(filePath, lines.join('\n'));
      return true;
    }
    return false;
  }
  
  // For destructuring like const { foo, bar } = obj
  // or function params like (foo, bar) => {}
  // Prefix with underscore
  const newLine = lineContent.replace(
    new RegExp(`\\b${varName}\\b`),
    newVarName
  );
  
  if (newLine !== lineContent) {
    lines[line - 1] = newLine;
    fs.writeFileSync(filePath, lines.join('\n'));
    return true;
  }
  
  return false;
}

async function main() {
  console.log('Parsing lint output...');
  const warnings = parseLintOutput();
  console.log(`Found ${warnings.length} unused variable warnings`);
  
  // Group by file
  const byFile = new Map<string, LintWarning[]>();
  for (const w of warnings) {
    if (!byFile.has(w.file)) byFile.set(w.file, []);
    byFile.get(w.file)!.push(w);
  }
  
  let fixed = 0;
  let skipped = 0;
  
  // Process each file (sort warnings by line desc to avoid offset issues)
  for (const [file, fileWarnings] of byFile) {
    const sorted = fileWarnings.sort((a, b) => b.line - a.line);
    
    for (const w of sorted) {
      // Skip certain patterns
      if (w.varName === 'request' || w.varName === 'params') {
        // These are often needed for Next.js API routes even if unused
        skipped++;
        continue;
      }
      
      if (fixUnusedVar(w.file, w.line, w.column, w.varName)) {
        console.log(`Fixed: ${path.basename(w.file)}:${w.line} - ${w.varName}`);
        fixed++;
      } else {
        skipped++;
      }
    }
  }
  
  console.log(`\nFixed ${fixed} warnings, skipped ${skipped}`);
}

main().catch(console.error);
