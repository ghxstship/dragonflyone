// Migration Protocol System
export { 
  MigrationProtocolManager, 
  migrationManager,
  type MigrationStep,
  type ComponentMigrationPlan,
  type MigrationTemplate,
  type MigrationMetrics
} from "./migration-protocol.js";

// Migration Automation
export { 
  MigrationAutomationEngine,
  migrationAutomation,
  type ComponentAnalysis,
  type CodeTransformation,
  type MigrationValidation,
  type PropDefinition,
  type EventHandler,
  type StateManagement,
  type AccessibilityFeatures,
  type PerformanceMetrics,
  type BreakingChange
} from "./migration-automation.js";

// Migration CLI
export { 
  MigrationCLIManager,
  migrationCLI,
  type CLIOptions,
  type CLICommand,
  type CLIOption
} from "./migration-cli.js";
