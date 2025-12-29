#!/usr/bin/env ts-node
/**
 * Script to remove redundant manual auth checks from routes that now have withAuth
 * Run with: npx ts-node scripts/cleanup-redundant-auth.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const APPS = ['atlvs', 'compvss', 'gvteway'];

// Pattern to match redundant auth header checks after withAuth is added
const REDUNDANT_PATTERNS = [
  // Pattern 1: authHeader check with return
  /\n\s*const authHeader = request\.headers\.get\(['"]authorization['"]\);\s*\n\s*if \(!authHeader\) return NextResponse\.json\(\{ error: ['"]Unauthorized['"] \}, \{ status: 401 \}\);/g,
  
  // Pattern 2: authHeader check without immediate return (just the declaration)
  /\n\s*const authHeader = request\.headers\.get\(['"]authorization['"]\);(?!\s*\n\s*\/\/)/g,
];

function findAllRoutes(baseDir: string): string[] {
  const routes: string[] = [];
  
  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walk(filePath);
      } else if (file === 'route.ts') {
        routes.push(filePath);
      }
    }
  }
  
  walk(baseDir);
  return routes;
}

function cleanupRoute(filePath: string): { cleaned: boolean; message: string } {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Only process files that have withAuth
    if (!content.includes('withAuth')) {
      return { cleaned: false, message: 'No withAuth - skipped' };
    }
    
    // Remove redundant patterns
    for (const pattern of REDUNDANT_PATTERNS) {
      content = content.replace(pattern, '');
    }
    
    // Clean up extra blank lines (more than 2 consecutive)
    content = content.replace(/\n{3,}/g, '\n\n');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      return { cleaned: true, message: 'Cleaned' };
    }
    
    return { cleaned: false, message: 'No changes needed' };
  } catch (error) {
    return { cleaned: false, message: `Error: ${error}` };
  }
}

function main() {
  let totalCleaned = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  
  for (const app of APPS) {
    const apiDir = path.join(process.cwd(), 'apps', app, 'src', 'app', 'api');
    const routes = findAllRoutes(apiDir);
    
    for (const route of routes) {
      const result = cleanupRoute(route);
      
      if (result.cleaned) {
        totalCleaned++;
        const relativePath = route.replace(process.cwd(), '');
        process.stdout.write(`✅ ${relativePath}\n`);
      } else if (result.message.startsWith('Error')) {
        totalErrors++;
      } else {
        totalSkipped++;
      }
    }
  }
  
  process.stdout.write(`\n=== Summary ===\n`);
  process.stdout.write(`Cleaned: ${totalCleaned}\n`);
  process.stdout.write(`Skipped: ${totalSkipped}\n`);
  process.stdout.write(`Errors: ${totalErrors}\n`);
}

main();
