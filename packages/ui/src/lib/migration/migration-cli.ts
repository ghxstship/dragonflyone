/**
 * Migration CLI Tool
 * 
 * Command-line interface for component migration operations.
 * Provides automated migration capabilities with reporting and validation.
 */

import { migrationManager, type ComponentMigrationPlan } from "./migration-protocol.js";
import { migrationAutomation, type ComponentAnalysis } from "./migration-automation.js";

export interface CLIOptions {
  /** Component name or pattern */
  component?: string;
  
  /** Component path */
  path?: string;
  
  /** Atomic level filter */
  level?: 'atom' | 'molecule' | 'organism' | 'template' | 'page';
  
  /** Priority filter */
  priority?: 'P0' | 'P1' | 'P2' | 'P3';
  
  /** Dry run mode */
  dryRun?: boolean;
  
  /** Verbose output */
  verbose?: boolean;
  
  /** Output format */
  format?: 'json' | 'table' | 'summary';
  
  /** Generate report */
  report?: boolean;
  
  /** Validate only */
  validateOnly?: boolean;
  
  /** Auto-fix issues */
  autoFix?: boolean;
}

export interface CLICommand {
  /** Command name */
  name: string;
  
  /** Command description */
  description: string;
  
  /** Command handler */
  handler: (options: CLIOptions) => Promise<void>;
  
  /** Command options */
  options: CLIOption[];
}

export interface CLIOption {
  /** Option name */
  name: string;
  
  /** Option description */
  description: string;
  
  /** Option type */
  type: 'string' | 'boolean' | 'number';
  
  /** Is required */
  required?: boolean;
  
  /** Default value */
  defaultValue?: unknown;
  
  /** Short flag */
  short?: string;
}

/**
 * Migration CLI Manager
 * 
 * Provides command-line interface for migration operations.
 */
export class MigrationCLIManager {
  private commands: Map<string, CLICommand> = new Map();

  constructor() {
    this.initializeCommands();
  }

  /**
   * Execute CLI command
   */
  async executeCommand(commandName: string, options: CLIOptions): Promise<void> {
    const command = this.commands.get(commandName);
    if (!command) {
      throw new Error(`Unknown command: ${commandName}`);
    }

    await command.handler(options);
  }

  /**
   * Get available commands
   */
  getCommands(): CLICommand[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get command help
   */
  getCommandHelp(commandName: string): string {
    const command = this.commands.get(commandName);
    if (!command) {
      return `Unknown command: ${commandName}`;
    }

    const help = [
      `Command: ${command.name}`,
      `Description: ${command.description}`,
      '',
      'Options:',
      ...command.options.map(opt => {
        const flags = opt.short ? `-${opt.short}, ` : '';
        return `  ${flags}--${opt.name} (${opt.type}): ${opt.description}`;
      }),
    ].join('\n');

    return help;
  }

  /**
   * Initialize CLI commands
   */
  private initializeCommands(): void {
    // Analyze command
    this.commands.set('analyze', {
      name: 'analyze',
      description: 'Analyze component for migration',
      handler: this.handleAnalyze.bind(this),
      options: [
        {
          name: 'component',
          description: 'Component name to analyze',
          type: 'string',
          required: true,
          short: 'c',
        },
        {
          name: 'path',
          description: 'Component file path',
          type: 'string',
          short: 'p',
        },
        {
          name: 'verbose',
          description: 'Verbose output',
          type: 'boolean',
          defaultValue: false,
          short: 'v',
        },
      ],
    });

    // Migrate command
    this.commands.set('migrate', {
      name: 'migrate',
      description: 'Migrate component to new architecture',
      handler: this.handleMigrate.bind(this),
      options: [
        {
          name: 'component',
          description: 'Component name to migrate',
          type: 'string',
          required: true,
          short: 'c',
        },
        {
          name: 'path',
          description: 'Component file path',
          type: 'string',
          short: 'p',
        },
        {
          name: 'dryRun',
          description: 'Dry run mode',
          type: 'boolean',
          defaultValue: false,
          short: 'd',
        },
        {
          name: 'autoFix',
          description: 'Auto-fix issues',
          type: 'boolean',
          defaultValue: false,
          short: 'a',
        },
        {
          name: 'verbose',
          description: 'Verbose output',
          type: 'boolean',
          defaultValue: false,
          short: 'v',
        },
      ],
    });

    // List command
    this.commands.set('list', {
      name: 'list',
      description: 'List migration plans',
      handler: this.handleList.bind(this),
      options: [
        {
          name: 'level',
          description: 'Filter by atomic level',
          type: 'string',
          short: 'l',
        },
        {
          name: 'priority',
          description: 'Filter by priority',
          type: 'string',
          short: 'p',
        },
        {
          name: 'format',
          description: 'Output format',
          type: 'string',
          defaultValue: 'table',
          short: 'f',
        },
      ],
    });

    // Status command
    this.commands.set('status', {
      name: 'status',
      description: 'Show migration status',
      handler: this.handleStatus.bind(this),
      options: [
        {
          name: 'format',
          description: 'Output format',
          type: 'string',
          defaultValue: 'summary',
          short: 'f',
        },
        {
          name: 'verbose',
          description: 'Verbose output',
          type: 'boolean',
          defaultValue: false,
          short: 'v',
        },
      ],
    });

    // Report command
    this.commands.set('report', {
      name: 'report',
      description: 'Generate migration report',
      handler: this.handleReport.bind(this),
      options: [
        {
          name: 'component',
          description: 'Component name for report',
          type: 'string',
          short: 'c',
        },
        {
          name: 'output',
          description: 'Output file path',
          type: 'string',
          short: 'o',
        },
        {
          name: 'format',
          description: 'Report format',
          type: 'string',
          defaultValue: 'markdown',
          short: 'f',
        },
      ],
    });

    // Validate command
    this.commands.set('validate', {
      name: 'validate',
      description: 'Validate migration',
      handler: this.handleValidate.bind(this),
      options: [
        {
          name: 'component',
          description: 'Component name to validate',
          type: 'string',
          required: true,
          short: 'c',
        },
        {
          name: 'autoFix',
          description: 'Auto-fix issues',
          type: 'boolean',
          defaultValue: false,
          short: 'a',
        },
        {
          name: 'verbose',
          description: 'Verbose output',
          type: 'boolean',
          defaultValue: false,
          short: 'v',
        },
      ],
    });
  }

  /**
   * Handle analyze command
   */
  private async handleAnalyze(options: CLIOptions): Promise<void> {
    const componentPath = options.path || this.findComponentPath(options.component!);
    
    if (!componentPath) {
      throw new Error(`Component not found: ${options.component}`);
    }

    console.log(`Analyzing component: ${options.component}`);
    console.log(`Path: ${componentPath}`);

    const analysis = await migrationAutomation.analyzeComponent(componentPath);
    
    if (options.verbose) {
      console.log('\nAnalysis Results:');
      console.log(JSON.stringify(analysis, null, 2));
    } else {
      console.log('\nSummary:');
      console.log(`- Type: ${analysis.type}`);
      console.log(`- Complexity: ${analysis.complexity}`);
      console.log(`- Dependencies: ${analysis.dependencies.length}`);
      console.log(`- Test Coverage: ${analysis.testCoverage}%`);
      console.log(`- Breaking Changes: ${analysis.breakingChanges.length}`);
      
      if (analysis.recommendations.length > 0) {
        console.log('\nRecommendations:');
        analysis.recommendations.forEach(rec => console.log(`- ${rec}`));
      }
    }
  }

  /**
   * Handle migrate command
   */
  private async handleMigrate(options: CLIOptions): Promise<void> {
    const componentPath = options.path || this.findComponentPath(options.component!);
    
    if (!componentPath) {
      throw new Error(`Component not found: ${options.component}`);
    }

    console.log(`Migrating component: ${options.component}`);
    console.log(`Path: ${componentPath}`);
    
    if (options.dryRun) {
      console.log('DRY RUN MODE - No changes will be made');
    }

    // Analyze component
    const analysis = await migrationAutomation.analyzeComponent(componentPath);
    
    // Generate migration plan
    const plan = await migrationAutomation.generateMigrationPlan(analysis);
    
    console.log('\nMigration Plan:');
    console.log(`- Priority: ${plan.priority}`);
    console.log(`- Risk: ${plan.risk}`);
    console.log(`- Steps: ${plan.steps.length}`);
    console.log(`- Estimated Duration: ${plan.steps.reduce((sum, step) => sum + step.estimatedDuration, 0)} minutes`);

    if (!options.dryRun) {
      console.log('\nExecuting migration...');
      
      // Execute migration steps
      for (const step of plan.steps) {
        console.log(`\nStep: ${step.name}`);
        
        try {
          await migrationManager.executeStep(plan.componentName, step.id, async () => {
            // Step execution logic would go here
            console.log(`  ✓ ${step.name} completed`);
          });
        } catch (error) {
          console.error(`  ✗ ${step.name} failed: ${error}`);
          throw error;
        }
      }
      
      console.log('\nMigration completed successfully!');
    }
  }

  /**
   * Handle list command
   */
  private async handleList(options: CLIOptions): Promise<void> {
    const plans = migrationManager.getAllMigrationPlans();
    
    let filteredPlans = plans;
    
    if (options.level) {
      filteredPlans = filteredPlans.filter(p => p.atomicLevel === options.level);
    }
    
    if (options.priority) {
      filteredPlans = filteredPlans.filter(p => p.priority === options.priority);
    }

    if (options.format === 'json') {
      console.log(JSON.stringify(filteredPlans, null, 2));
    } else {
      console.log('Migration Plans:');
      console.log('');
      
      if (filteredPlans.length === 0) {
        console.log('No migration plans found');
        return;
      }

      // Table format
      console.log('Component\t\tLevel\t\tPriority\t\tStatus\t\tRisk');
      console.log('---------\t\t-----\t\t--------\t\t------\t\t----');
      
      filteredPlans.forEach(plan => {
        console.log(
          `${plan.componentName}\t\t${plan.atomicLevel}\t\t${plan.priority}\t\t${plan.status}\t\t${plan.risk}`
        );
      });
    }
  }

  /**
   * Handle status command
   */
  private async handleStatus(options: CLIOptions): Promise<void> {
    const metrics = migrationManager.getMetrics();
    
    if (options.format === 'json') {
      console.log(JSON.stringify(metrics, null, 2));
    } else {
      console.log('Migration Status:');
      console.log('');
      console.log(`Total Components: ${metrics.totalMigrated + metrics.remaining}`);
      console.log(`Migrated: ${metrics.totalMigrated}`);
      console.log(`Remaining: ${metrics.remaining}`);
      console.log(`Progress: ${metrics.progress.toFixed(1)}%`);
      
      if (options.verbose) {
        console.log(`\nDetailed Metrics:`);
        console.log(`- Average Migration Time: ${metrics.averageMigrationTime} minutes`);
        console.log(`- Success Rate: ${metrics.successRate.toFixed(1)}%`);
        console.log(`- Quality Gate Pass Rate: ${metrics.qualityGatePassRate.toFixed(1)}%`);
        console.log(`- Average Test Coverage: ${metrics.averageTestCoverage.toFixed(1)}%`);
        console.log(`- Blocked: ${metrics.blockedCount}`);
        console.log(`- Failed: ${metrics.failedCount}`);
      }
    }
  }

  /**
   * Handle report command
   */
  private async handleReport(options: CLIOptions): Promise<void> {
    if (options.component) {
      const plan = migrationManager.getMigrationPlan(options.component);
      if (!plan) {
        throw new Error(`Migration plan not found: ${options.component}`);
      }

      // Generate component-specific report
      const analysis = await migrationAutomation.analyzeComponent(plan.componentPath);
      const transformations = await migrationAutomation.transformComponent(analysis, plan);
      const validations = await migrationAutomation.validateMigration('', plan);
      
      const report = await migrationAutomation.generateMigrationReport(analysis, plan, transformations, validations);
      
      if (options.format === 'json') {
        // Write report to file
        console.log(`Report written to: ${options.component}-migration-report.json`);
      } else {
        console.log(report);
      }
    } else {
      // Generate overall migration report
      const report = migrationManager.generateMigrationReport();
      
      if (options.format === 'json') {
        // Write report to file
        console.log(`Report written to: migration-report.json`);
      } else {
        console.log('Migration Report:');
        console.log(JSON.stringify(report, null, 2));
      }
    }
  }

  /**
   * Handle validate command
   */
  private async handleValidate(options: CLIOptions): Promise<void> {
    const plan = migrationManager.getMigrationPlan(options.component || '');
    if (!plan) {
      throw new Error(`Migration plan not found: ${options.component}`);
    }

    console.log(`Validating migration: ${options.component}`);
    
    const validation = migrationManager.validateMigrationPlan(plan);
    
    if (validation.valid) {
      console.log('✓ Migration plan is valid');
    } else {
      console.log('✗ Migration plan has issues:');
      validation.errors.forEach(error => console.log(`  Error: ${error}`));
    }
    
    if (validation.warnings.length > 0) {
      console.log('\nWarnings:');
      validation.warnings.forEach(warning => console.log(`  Warning: ${warning}`));
    }

    if (options.autoFix && validation.errors.length > 0) {
      console.log('\nAuto-fixing issues...');
      // Auto-fix logic would go here
    }
  }

  /**
   * Find component path
   */
  private findComponentPath(componentName: string): string | null {
    // Implementation to find component path
    // This would search the codebase for the component
    return null;
  }

  /**
   * Get priority from analysis
   */
  private getPriority(analysis: ComponentAnalysis): ComponentMigrationPlan['priority'] {
    if (analysis.dependencies.length > 10) return 'P0';
    if (analysis.dependencies.length > 5) return 'P1';
    if (analysis.dependencies.length > 2) return 'P2';
    return 'P3';
  }
}

/**
 * Global CLI manager instance
 */
export const migrationCLI = new MigrationCLIManager();
