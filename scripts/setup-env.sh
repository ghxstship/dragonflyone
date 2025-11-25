#!/bin/bash
set -e

echo "GHXSTSHIP Environment Setup"
echo "============================"

ENVIRONMENT=${1:-"local"}

if [ "$ENVIRONMENT" != "local" ] && [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
  echo "Usage: $0 {local|staging|production}"
  exit 1
fi

echo "Setting up $ENVIRONMENT environment..."

if [ "$ENVIRONMENT" = "local" ]; then
  if [ ! -f ".env.local" ]; then
    echo "Creating .env.local from template..."
    cp supabase/.env.example .env.local
    echo "✓ .env.local created"
    echo "⚠️  Please update .env.local with your Supabase credentials from 1Password"
  else
    echo "✓ .env.local already exists"
  fi
  
  echo "Installing dependencies..."
  pnpm install
  
  echo "Starting Supabase..."
  cd supabase && supabase start && cd ..
  
  echo "Generating TypeScript types..."
  pnpm supabase gen types typescript --local > packages/config/supabase-types.ts
  
  echo ""
  echo "✅ Local environment ready!"
  echo ""
  echo "Next steps:"
  echo "  1. Update .env.local with your credentials"
  echo "  2. Run: pnpm dev"
  echo "  3. Access Supabase Studio: http://localhost:54323"
  
elif [ "$ENVIRONMENT" = "staging" ] || [ "$ENVIRONMENT" = "production" ]; then
  
  if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "Error: SUPABASE_ACCESS_TOKEN not set"
    echo "Please set it in your environment or CI secrets"
    exit 1
  fi
  
  PROJECT_REF_VAR="SUPABASE_${ENVIRONMENT^^}_PROJECT_REF"
  PROJECT_REF=${!PROJECT_REF_VAR}
  
  if [ -z "$PROJECT_REF" ]; then
    echo "Error: $PROJECT_REF_VAR not set"
    exit 1
  fi
  
  echo "Linking to $ENVIRONMENT project: $PROJECT_REF"
  supabase link --project-ref $PROJECT_REF
  
  echo "Pushing database migrations..."
  supabase db push
  
  echo "Deploying Edge Functions..."
  supabase functions deploy --no-verify-jwt webhook-stripe
  supabase functions deploy --no-verify-jwt webhook-twilio
  supabase functions deploy --no-verify-jwt webhook-gvteway
  supabase functions deploy --no-verify-jwt automation-triggers
  supabase functions deploy --no-verify-jwt automation-actions
  supabase functions deploy --no-verify-jwt health-check
  supabase functions deploy --no-verify-jwt email-notifications
  supabase functions deploy --no-verify-jwt cache-warmer
  supabase functions deploy --no-verify-jwt cleanup-jobs
  
  echo "Generating TypeScript types..."
  supabase gen types typescript --linked > packages/config/supabase-types.ts
  
  echo ""
  echo "✅ $ENVIRONMENT environment deployed!"
fi
