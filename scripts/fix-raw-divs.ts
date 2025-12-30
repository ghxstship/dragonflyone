#!/usr/bin/env npx ts-node
/**
 * Codemod script to replace raw <div> elements with design system components
 * 
 * Usage: npx ts-node scripts/fix-raw-divs.ts <file-path>
 * 
 * Rules:
 * - <div className="flex ..."> → <Stack direction="horizontal" className="...">
 * - <div className="flex-col ..."> → <Stack className="...">
 * - <div className="space-y-N ..."> → <Stack gap={N} className="...">
 * - <div className="space-x-N ..."> → <Stack direction="horizontal" gap={N} className="...">
 * - <div className="grid ..."> → <Grid className="...">
 * - <div ...> → <Box ...>
 */

import * as fs from 'fs';
import * as path from 'path';

function fixRawDivs(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  let modified = content;
  let hasChanges = false;

  // Track if we need to add imports
  let needsBox = false;
  let needsStack = false;
  let needsGrid = false;

  // Pattern: <div className="flex items-center ...">
  // Replace with: <Stack direction="horizontal" className="items-center ...">
  const flexPattern = /<div(\s+)className="([^"]*\bflex\b[^"]*)"/g;
  modified = modified.replace(flexPattern, (match, space, classes) => {
    const newClasses = classes.replace(/\bflex\b\s*/g, '').trim();
    needsStack = true;
    hasChanges = true;
    if (newClasses) {
      return `<Stack${space}direction="horizontal" className="${newClasses}"`;
    }
    return `<Stack${space}direction="horizontal"`;
  });

  // Pattern: <div className="flex-col ...">
  // Replace with: <Stack className="...">
  const flexColPattern = /<div(\s+)className="([^"]*\bflex-col\b[^"]*)"/g;
  modified = modified.replace(flexColPattern, (match, space, classes) => {
    const newClasses = classes.replace(/\bflex-col\b\s*/g, '').replace(/\bflex\b\s*/g, '').trim();
    needsStack = true;
    hasChanges = true;
    if (newClasses) {
      return `<Stack${space}className="${newClasses}"`;
    }
    return `<Stack`;
  });

  // Pattern: <div className="space-y-N ...">
  // Replace with: <Stack gap={N} className="...">
  const spaceYPattern = /<div(\s+)className="([^"]*\bspace-y-(\d+)\b[^"]*)"/g;
  modified = modified.replace(spaceYPattern, (match, space, classes, gap) => {
    const newClasses = classes.replace(/\bspace-y-\d+\b\s*/g, '').trim();
    needsStack = true;
    hasChanges = true;
    if (newClasses) {
      return `<Stack${space}gap={${gap}} className="${newClasses}"`;
    }
    return `<Stack${space}gap={${gap}}`;
  });

  // Pattern: <div className="space-x-N ...">
  // Replace with: <Stack direction="horizontal" gap={N} className="...">
  const spaceXPattern = /<div(\s+)className="([^"]*\bspace-x-(\d+)\b[^"]*)"/g;
  modified = modified.replace(spaceXPattern, (match, space, classes, gap) => {
    const newClasses = classes.replace(/\bspace-x-\d+\b\s*/g, '').trim();
    needsStack = true;
    hasChanges = true;
    if (newClasses) {
      return `<Stack${space}direction="horizontal" gap={${gap}} className="${newClasses}"`;
    }
    return `<Stack${space}direction="horizontal" gap={${gap}}`;
  });

  // Pattern: <div className="grid ...">
  // Replace with: <Grid className="...">
  const gridPattern = /<div(\s+)className="([^"]*\bgrid\b[^"]*)"/g;
  modified = modified.replace(gridPattern, (match, space, classes) => {
    const newClasses = classes.replace(/\bgrid\b\s*/g, '').trim();
    needsGrid = true;
    hasChanges = true;
    if (newClasses) {
      return `<Grid${space}className="${newClasses}"`;
    }
    return `<Grid`;
  });

  // Pattern: remaining <div ...> → <Box ...>
  const divPattern = /<div(\s)/g;
  modified = modified.replace(divPattern, (match, space) => {
    needsBox = true;
    hasChanges = true;
    return `<Box${space}`;
  });

  // Pattern: </div> → </Box> or </Stack> or </Grid>
  // This is tricky - we need to match closing tags properly
  // For now, just replace all </div> with </Box> and let the user fix mismatches
  const closingDivPattern = /<\/div>/g;
  modified = modified.replace(closingDivPattern, '</Box>');

  if (hasChanges) {
    // Add imports if needed
    const importPattern = /from ['"]@ghxstship\/ui['"]/;
    if (importPattern.test(modified)) {
      // Check if imports already exist
      const existingImports = modified.match(/import\s*{([^}]+)}\s*from\s*['"]@ghxstship\/ui['"]/);
      if (existingImports) {
        const imports = existingImports[1].split(',').map(s => s.trim());
        const newImports: string[] = [];
        if (needsBox && !imports.includes('Box')) newImports.push('Box');
        if (needsStack && !imports.includes('Stack')) newImports.push('Stack');
        if (needsGrid && !imports.includes('Grid')) newImports.push('Grid');
        
        if (newImports.length > 0) {
          const allImports = [...imports, ...newImports].join(',\n  ');
          modified = modified.replace(
            /import\s*{([^}]+)}\s*from\s*['"]@ghxstship\/ui['"]/,
            `import {\n  ${allImports}\n} from "@ghxstship/ui"`
          );
        }
      }
    }

    fs.writeFileSync(filePath, modified);
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`No changes: ${filePath}`);
  }
}

// Main
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: npx ts-node scripts/fix-raw-divs.ts <file-path>');
  process.exit(1);
}

const filePath = args[0];
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

fixRawDivs(filePath);
