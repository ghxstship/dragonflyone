#!/usr/bin/env node

/**
 * UI v2 Migration CLI
 * Main entry point for migration tools
 */

const { execSync } = require('child_process');
const path = require('path');

const commands = {
  analyze: {
    description: 'Analyze codebase for v1 component usage',
    usage: 'ui-v2-migrate analyze [directory]',
    run: (args) => {
      const targetDir = args[0] || './src';
      require('./analyze.js');
    }
  },
  help: {
    description: 'Show help information',
    usage: 'ui-v2-migrate help',
    run: () => {
      console.log('UI v2 Migration CLI\n');
      console.log('Available commands:\n');
      Object.entries(commands).forEach(([name, cmd]) => {
        console.log(`  ${cmd.usage}`);
        console.log(`    ${cmd.description}\n`);
      });
    }
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'help';
const commandArgs = args.slice(1);

if (commands[command]) {
  if (command !== 'analyze') {
    // For non-analyze commands, run directly
    commands[command].run(commandArgs);
  } else {
    // For analyze, we need to pass through to the script
    const analyzeScript = path.join(__dirname, 'analyze.js');
    execSync(`node ${analyzeScript} ${commandArgs.join(' ')}`, { stdio: 'inherit' });
  }
} else {
  console.error(`Unknown command: ${command}`);
  console.error('Run "ui-v2-migrate help" for usage information');
  process.exit(1);
}
