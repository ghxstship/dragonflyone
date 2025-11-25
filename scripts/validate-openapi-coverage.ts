#!/usr/bin/env ts-node
/**
 * OpenAPI Spec Coverage Validation Script
 * Validates that 100% of GA endpoints have examples and proper documentation
 * 
 * Run with: pnpm run validate:openapi
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

interface ValidationResult {
  file: string;
  totalEndpoints: number;
  coveredEndpoints: number;
  missingExamples: string[];
  missingDescriptions: string[];
  deprecatedWithoutDate: string[];
  errors: string[];
}

interface OpenAPISpec {
  openapi: string;
  info: { title: string; version: string };
  paths: Record<string, Record<string, any>>;
}

const SPEC_DIR = path.join(__dirname, '../packages/api-specs');
const PLATFORMS = ['atlvs', 'compvss', 'gvteway'];

async function validateSpec(specPath: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    file: specPath,
    totalEndpoints: 0,
    coveredEndpoints: 0,
    missingExamples: [],
    missingDescriptions: [],
    deprecatedWithoutDate: [],
    errors: []
  };

  try {
    const content = fs.readFileSync(specPath, 'utf-8');
    const spec: OpenAPISpec = yaml.parse(content);

    if (!spec.paths) {
      result.errors.push('No paths defined in spec');
      return result;
    }

    for (const [pathKey, pathItem] of Object.entries(spec.paths)) {
      const methods = ['get', 'post', 'put', 'patch', 'delete'];

      for (const method of methods) {
        const operation = pathItem[method];
        if (!operation) continue;

        result.totalEndpoints++;
        const operationId = operation.operationId || `${method.toUpperCase()} ${pathKey}`;
        let hasIssues = false;

        // Check for description
        if (!operation.description && !operation.summary) {
          result.missingDescriptions.push(operationId);
          hasIssues = true;
        }

        // Check for examples in request body
        if (operation.requestBody?.content) {
          const hasRequestExample = Object.values(operation.requestBody.content).some(
            (mediaType: any) => mediaType.example || mediaType.examples
          );
          if (!hasRequestExample) {
            result.missingExamples.push(`${operationId} (request body)`);
            hasIssues = true;
          }
        }

        // Check for examples in responses
        if (operation.responses) {
          const successResponses = Object.entries(operation.responses).filter(
            ([code]) => code.startsWith('2')
          );

          for (const [code, response] of successResponses) {
            const responseObj = response as any;
            if (responseObj.content) {
              const hasResponseExample = Object.values(responseObj.content).some(
                (mediaType: any) => mediaType.example || mediaType.examples
              );
              if (!hasResponseExample) {
                result.missingExamples.push(`${operationId} (response ${code})`);
                hasIssues = true;
              }
            }
          }
        }

        // Check deprecated operations have deprecation date
        if (operation.deprecated && !operation['x-deprecation-date']) {
          result.deprecatedWithoutDate.push(operationId);
          hasIssues = true;
        }

        // Check for changelog metadata
        if (!operation['x-changelog']) {
          // Warning but not a blocker
          console.warn(`  ⚠️  ${operationId}: Missing x-changelog metadata`);
        }

        if (!hasIssues) {
          result.coveredEndpoints++;
        }
      }
    }
  } catch (error) {
    result.errors.push(`Failed to parse spec: ${(error as Error).message}`);
  }

  return result;
}

async function main() {
  console.log('🔍 Validating OpenAPI Spec Coverage\n');

  const results: ValidationResult[] = [];
  let hasFailures = false;

  for (const platform of PLATFORMS) {
    const specPath = path.join(SPEC_DIR, platform, 'openapi.yaml');

    if (!fs.existsSync(specPath)) {
      console.log(`⚠️  Skipping ${platform}: spec not found`);
      continue;
    }

    console.log(`📄 Validating ${platform}/openapi.yaml...`);
    const result = await validateSpec(specPath);
    results.push(result);

    const coverage = result.totalEndpoints > 0
      ? Math.round((result.coveredEndpoints / result.totalEndpoints) * 100)
      : 0;

    console.log(`   Endpoints: ${result.totalEndpoints}`);
    console.log(`   Coverage: ${coverage}%`);

    if (result.missingExamples.length > 0) {
      console.log(`   ❌ Missing examples (${result.missingExamples.length}):`);
      result.missingExamples.slice(0, 5).forEach(e => console.log(`      - ${e}`));
      if (result.missingExamples.length > 5) {
        console.log(`      ... and ${result.missingExamples.length - 5} more`);
      }
      hasFailures = true;
    }

    if (result.missingDescriptions.length > 0) {
      console.log(`   ❌ Missing descriptions (${result.missingDescriptions.length}):`);
      result.missingDescriptions.slice(0, 5).forEach(e => console.log(`      - ${e}`));
      hasFailures = true;
    }

    if (result.deprecatedWithoutDate.length > 0) {
      console.log(`   ❌ Deprecated without date (${result.deprecatedWithoutDate.length}):`);
      result.deprecatedWithoutDate.forEach(e => console.log(`      - ${e}`));
      hasFailures = true;
    }

    if (result.errors.length > 0) {
      console.log(`   ❌ Errors:`);
      result.errors.forEach(e => console.log(`      - ${e}`));
      hasFailures = true;
    }

    console.log('');
  }

  // Summary
  console.log('📊 Summary');
  console.log('─'.repeat(50));

  const totalEndpoints = results.reduce((sum, r) => sum + r.totalEndpoints, 0);
  const coveredEndpoints = results.reduce((sum, r) => sum + r.coveredEndpoints, 0);
  const overallCoverage = totalEndpoints > 0
    ? Math.round((coveredEndpoints / totalEndpoints) * 100)
    : 0;

  console.log(`Total Endpoints: ${totalEndpoints}`);
  console.log(`Fully Documented: ${coveredEndpoints}`);
  console.log(`Overall Coverage: ${overallCoverage}%`);

  if (overallCoverage < 100) {
    console.log(`\n❌ Coverage is below 100%. Please add missing examples and descriptions.`);
  } else {
    console.log(`\n✅ All endpoints are fully documented!`);
  }

  // Write report
  const reportPath = path.join(__dirname, '../coverage-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    platforms: results,
    summary: {
      totalEndpoints,
      coveredEndpoints,
      coverage: overallCoverage
    }
  }, null, 2));

  console.log(`\n📝 Report saved to ${reportPath}`);

  // Exit with error if coverage is below threshold
  if (hasFailures || overallCoverage < 100) {
    process.exit(1);
  }
}

main().catch(console.error);
