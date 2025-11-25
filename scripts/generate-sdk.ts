#!/usr/bin/env ts-node
/**
 * SDK Generation Script
 * Generates TypeScript, Python, and Go SDKs from OpenAPI specs
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const PLATFORMS = ['atlvs', 'compvss', 'gvteway'];
const SDK_OUTPUT_DIR = path.join(__dirname, '..', 'packages', 'sdk');
const API_SPECS_DIR = path.join(__dirname, '..', 'packages', 'api-specs');

interface GeneratorConfig {
  name: string;
  generator: string;
  outputDir: string;
  additionalProperties?: Record<string, string>;
}

const GENERATORS: GeneratorConfig[] = [
  {
    name: 'typescript',
    generator: 'typescript-fetch',
    outputDir: 'typescript',
    additionalProperties: {
      supportsES6: 'true',
      npmName: '@ghxstship/sdk',
      typescriptThreePlus: 'true',
    },
  },
  {
    name: 'python',
    generator: 'python',
    outputDir: 'python',
    additionalProperties: {
      packageName: 'ghxstship_sdk',
      projectName: 'ghxstship-sdk',
    },
  },
  {
    name: 'go',
    generator: 'go',
    outputDir: 'go',
    additionalProperties: {
      packageName: 'ghxstship',
      isGoSubmodule: 'true',
    },
  },
];

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getOpenApiSpecPath(platform: string): string {
  return path.join(API_SPECS_DIR, platform, 'openapi.yaml');
}

function generateSdk(platform: string, config: GeneratorConfig): void {
  const specPath = getOpenApiSpecPath(platform);
  
  if (!fs.existsSync(specPath)) {
    console.warn(`⚠️  OpenAPI spec not found for ${platform}: ${specPath}`);
    return;
  }
  
  const outputDir = path.join(SDK_OUTPUT_DIR, config.outputDir, platform);
  ensureDir(outputDir);
  
  const additionalProps = config.additionalProperties
    ? Object.entries(config.additionalProperties)
        .map(([key, value]) => `${key}=${value}`)
        .join(',')
    : '';
  
  const command = [
    'npx @openapitools/openapi-generator-cli generate',
    `-i ${specPath}`,
    `-g ${config.generator}`,
    `-o ${outputDir}`,
    additionalProps ? `--additional-properties=${additionalProps}` : '',
  ].filter(Boolean).join(' ');
  
  console.log(`📦 Generating ${config.name} SDK for ${platform}...`);
  
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${config.name} SDK for ${platform} generated successfully`);
  } catch (error) {
    console.error(`❌ Failed to generate ${config.name} SDK for ${platform}`);
    throw error;
  }
}

function generatePostmanCollection(platform: string): void {
  const specPath = getOpenApiSpecPath(platform);
  
  if (!fs.existsSync(specPath)) {
    console.warn(`⚠️  OpenAPI spec not found for ${platform}: ${specPath}`);
    return;
  }
  
  const outputDir = path.join(SDK_OUTPUT_DIR, 'postman');
  ensureDir(outputDir);
  
  const outputPath = path.join(outputDir, `${platform}.postman_collection.json`);
  
  const command = [
    'npx openapi-to-postmanv2',
    `-s ${specPath}`,
    `-o ${outputPath}`,
    '-p',
  ].join(' ');
  
  console.log(`📮 Generating Postman collection for ${platform}...`);
  
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ Postman collection for ${platform} generated successfully`);
  } catch (error) {
    console.error(`❌ Failed to generate Postman collection for ${platform}`);
    // Don't throw - Postman generation is optional
  }
}

function generateInsomniaExport(platform: string): void {
  const specPath = getOpenApiSpecPath(platform);
  
  if (!fs.existsSync(specPath)) {
    console.warn(`⚠️  OpenAPI spec not found for ${platform}: ${specPath}`);
    return;
  }
  
  const outputDir = path.join(SDK_OUTPUT_DIR, 'insomnia');
  ensureDir(outputDir);
  
  const outputPath = path.join(outputDir, `${platform}.insomnia.json`);
  
  // Use openapi-to-postman and convert, or use insomnia-importers
  console.log(`🌙 Generating Insomnia export for ${platform}...`);
  
  try {
    // Read OpenAPI spec and create basic Insomnia export
    const spec = fs.readFileSync(specPath, 'utf-8');
    const insomniaExport = {
      _type: 'export',
      __export_format: 4,
      __export_date: new Date().toISOString(),
      __export_source: 'ghxstship-sdk-generator',
      resources: [
        {
          _id: `wrk_${platform}`,
          _type: 'workspace',
          name: `GHXSTSHIP ${platform.toUpperCase()} API`,
          description: `API workspace for ${platform}`,
        },
        {
          _id: `env_${platform}_base`,
          _type: 'environment',
          parentId: `wrk_${platform}`,
          name: 'Base Environment',
          data: {
            base_url: `https://${platform}.ghxstship.com/api`,
            api_key: '',
          },
        },
      ],
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(insomniaExport, null, 2));
    console.log(`✅ Insomnia export for ${platform} generated successfully`);
  } catch (error) {
    console.error(`❌ Failed to generate Insomnia export for ${platform}`);
  }
}

function createSdkPackageJson(language: string): void {
  const outputDir = path.join(SDK_OUTPUT_DIR, language);
  ensureDir(outputDir);
  
  if (language === 'typescript') {
    const packageJson = {
      name: '@ghxstship/sdk',
      version: '1.0.0',
      description: 'GHXSTSHIP Platform SDK',
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      scripts: {
        build: 'tsc',
        prepublishOnly: 'npm run build',
      },
      dependencies: {
        'cross-fetch': '^4.0.0',
      },
      devDependencies: {
        typescript: '^5.0.0',
      },
      peerDependencies: {},
      repository: {
        type: 'git',
        url: 'https://github.com/ghxstship/platform.git',
      },
      license: 'MIT',
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }
  
  if (language === 'python') {
    const setupPy = `
from setuptools import setup, find_packages

setup(
    name='ghxstship-sdk',
    version='1.0.0',
    description='GHXSTSHIP Platform SDK',
    packages=find_packages(),
    install_requires=[
        'requests>=2.25.0',
        'python-dateutil>=2.8.0',
    ],
    python_requires='>=3.8',
)
`;
    fs.writeFileSync(path.join(outputDir, 'setup.py'), setupPy.trim());
  }
}

async function main(): Promise<void> {
  console.log('🚀 Starting SDK generation...\n');
  
  // Ensure output directories exist
  ensureDir(SDK_OUTPUT_DIR);
  
  // Generate SDKs for each platform and language
  for (const platform of PLATFORMS) {
    console.log(`\n📂 Processing ${platform}...\n`);
    
    for (const generator of GENERATORS) {
      try {
        generateSdk(platform, generator);
      } catch (error) {
        console.error(`Failed to generate ${generator.name} SDK for ${platform}`);
      }
    }
    
    // Generate Postman and Insomnia exports
    generatePostmanCollection(platform);
    generateInsomniaExport(platform);
  }
  
  // Create package files for SDKs
  console.log('\n📝 Creating SDK package files...\n');
  createSdkPackageJson('typescript');
  createSdkPackageJson('python');
  
  console.log('\n✨ SDK generation complete!\n');
}

main().catch(console.error);
