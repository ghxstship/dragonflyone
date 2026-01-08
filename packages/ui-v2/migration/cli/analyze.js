#!/usr/bin/env node

/**
 * UI v2 Migration Analyzer
 * Analyzes codebase for v1 component usage and estimates migration effort
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Component categories for risk assessment
const RISK_LEVELS = {
  low: ['Button', 'Input', 'Text', 'Heading', 'Box', 'Badge', 'Spinner'],
  medium: ['Card', 'Alert', 'Tabs', 'Breadcrumb', 'Avatar', 'Progress', 'Select', 'Textarea', 'Checkbox', 'Radio', 'Switch'],
  high: ['Modal', 'Table', 'FormControl', 'FormLabel', 'Menu', 'Tooltip', 'Dropdown']
};

function findFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  let results = [];

  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      // Skip node_modules, dist, build directories
      if (stat.isDirectory()) {
        if (!['node_modules', 'dist', 'build', '.next', '.git'].includes(file)) {
          results = results.concat(findFiles(filePath, extensions));
        }
      } else {
        const ext = path.extname(file);
        if (extensions.includes(ext)) {
          results.push(filePath);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }

  return results;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const analysis = {
    hasV1Import: false,
    components: [],
    issues: []
  };

  // Check for v1 imports
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]@ghxstship\/ui['"]/g;
  const matches = content.matchAll(importRegex);

  for (const match of matches) {
    analysis.hasV1Import = true;
    const imports = match[1].split(',').map(s => s.trim());
    analysis.components.push(...imports);
  }

  // Check for breaking changes
  if (content.includes('<Modal')) {
    analysis.issues.push('Modal needs to be converted to Dialog');
  }
  if (content.includes('<VStack') || content.includes('<HStack')) {
    analysis.issues.push('VStack/HStack need to be converted to Stack');
  }
  if (content.includes('<FormControl')) {
    analysis.issues.push('FormControl needs to be converted to Field');
  }
  if (content.match(/is[A-Z]\w*=/)) {
    analysis.issues.push('Boolean props with "is" prefix need to be updated');
  }

  return analysis;
}

function categorizeComponents(components) {
  const categorized = {
    low: [],
    medium: [],
    high: [],
    unknown: []
  };

  for (const component of components) {
    let found = false;
    for (const [risk, list] of Object.entries(RISK_LEVELS)) {
      if (list.includes(component)) {
        categorized[risk].push(component);
        found = true;
        break;
      }
    }
    if (!found) {
      categorized.unknown.push(component);
    }
  }

  return categorized;
}

function estimateEffort(categorized) {
  const low = categorized.low.length * 5; // 5 minutes per low risk
  const medium = categorized.medium.length * 15; // 15 minutes per medium risk
  const high = categorized.high.length * 30; // 30 minutes per high risk
  const unknown = categorized.unknown.length * 20; // 20 minutes per unknown
  const setup = 120; // 2 hours for setup

  const totalMinutes = low + medium + high + unknown + setup;
  const hours = Math.ceil(totalMinutes / 60);

  return { totalMinutes, hours, breakdown: { low, medium, high, unknown, setup } };
}

function runAnalysis(targetDir) {
  console.log('🔍 UI v2 Migration Analyzer\n');
  console.log(`Analyzing: ${targetDir}\n`);

  // Find all relevant files
  const files = findFiles(targetDir);
  console.log(`📁 Found ${files.length} files\n`);

  // Analyze each file
  let totalFilesWithV1 = 0;
  const allComponents = [];
  const allIssues = [];
  const fileIssues = [];

  for (const file of files) {
    const analysis = analyzeFile(file);
    if (analysis.hasV1Import) {
      totalFilesWithV1++;
      allComponents.push(...analysis.components);

      if (analysis.issues.length > 0) {
        fileIssues.push({ file, issues: analysis.issues });
        allIssues.push(...analysis.issues);
      }
    }
  }

  // Count unique components
  const componentCounts = {};
  for (const comp of allComponents) {
    componentCounts[comp] = (componentCounts[comp] || 0) + 1;
  }

  // Sort by usage
  const sortedComponents = Object.entries(componentCounts)
    .sort((a, b) => b[1] - a[1]);

  // Categorize components
  const categorized = categorizeComponents(Object.keys(componentCounts));

  // Estimate effort
  const effort = estimateEffort(categorized);

  // Print results
  console.log('📊 Summary:\n');
  console.log(`✅ Files with v1 imports: ${totalFilesWithV1} / ${files.length}`);
  console.log(`✅ Unique v1 components used: ${sortedComponents.length}`);
  console.log(`✅ Total component usages: ${allComponents.length}`);
  console.log();

  console.log('🏆 Top 10 Most Used Components:\n');
  sortedComponents.slice(0, 10).forEach(([comp, count]) => {
    console.log(`  ${comp.padEnd(20)} ${count} usages`);
  });
  console.log();

  console.log('⚠️  Risk Assessment:\n');
  console.log(`  🟢 Low Risk:    ${categorized.low.length} components (${categorized.low.join(', ')})`);
  console.log(`  🟡 Medium Risk: ${categorized.medium.length} components (${categorized.medium.join(', ')})`);
  console.log(`  🔴 High Risk:   ${categorized.high.length} components (${categorized.high.join(', ')})`);
  if (categorized.unknown.length > 0) {
    console.log(`  ⚪ Unknown:     ${categorized.unknown.length} components (${categorized.unknown.join(', ')})`);
  }
  console.log();

  console.log('⏱️  Estimated Migration Effort:\n');
  console.log(`  Setup & Configuration:  ${Math.ceil(effort.breakdown.setup / 60)} hours`);
  console.log(`  Low Risk Components:    ${Math.ceil(effort.breakdown.low / 60)} hours`);
  console.log(`  Medium Risk Components: ${Math.ceil(effort.breakdown.medium / 60)} hours`);
  console.log(`  High Risk Components:   ${Math.ceil(effort.breakdown.high / 60)} hours`);
  console.log(`  ────────────────────────────────────`);
  console.log(`  Total Estimated Time:   ${effort.hours} hours (~${Math.ceil(effort.hours / 8)} days)`);
  console.log();

  if (allIssues.length > 0) {
    console.log('🚨 Breaking Changes Detected:\n');
    const uniqueIssues = [...new Set(allIssues)];
    uniqueIssues.forEach(issue => {
      const count = allIssues.filter(i => i === issue).length;
      console.log(`  • ${issue} (${count} occurrences)`);
    });
    console.log();

    if (fileIssues.length > 0 && fileIssues.length <= 10) {
      console.log('📝 Files with Issues:\n');
      fileIssues.forEach(({ file, issues }) => {
        console.log(`  ${file}`);
        issues.forEach(issue => {
          console.log(`    - ${issue}`);
        });
      });
      console.log();
    }
  }

  console.log('💡 Next Steps:\n');
  console.log('  1. Review the migration guide: packages/ui-v2/MIGRATION_GUIDE.md');
  console.log('  2. Set up BrandProvider in your app');
  console.log('  3. Start with new features using v2');
  console.log('  4. Migrate existing pages one at a time');
  console.log('  5. Use codemods for bulk transformations (coming soon)');
  console.log();
  console.log('✅ Analysis complete!');
}

// Main execution
const targetDir = process.argv[2] || './src';

if (!fs.existsSync(targetDir)) {
  console.error(`Error: Directory "${targetDir}" does not exist`);
  process.exit(1);
}

runAnalysis(targetDir);
