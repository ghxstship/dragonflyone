#!/bin/bash
set -e

echo "Supabase Key Rotation Script"
echo "============================="

ENVIRONMENT=${1:-"staging"}

if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
  echo "Usage: $0 {staging|production}"
  exit 1
fi

echo ""
echo "⚠️  WARNING: This will rotate Supabase keys for $ENVIRONMENT"
echo "⚠️  You will need to update:"
echo "    - 1Password vault"
echo "    - Vercel environment variables"
echo "    - GitHub Actions secrets"
echo "    - Any other services using these keys"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Key rotation cancelled"
  exit 0
fi

PROJECT_REF_VAR="SUPABASE_${ENVIRONMENT^^}_PROJECT_REF"
PROJECT_REF=${!PROJECT_REF_VAR}

if [ -z "$PROJECT_REF" ]; then
  echo "Error: $PROJECT_REF_VAR not set"
  exit 1
fi

echo ""
echo "Step 1: Go to Supabase Dashboard"
echo "  https://app.supabase.com/project/$PROJECT_REF/settings/api"
echo ""
echo "Step 2: Click 'Reset' on the following keys:"
echo "  - anon (public) key"
echo "  - service_role key"
echo ""
echo "Step 3: Copy the new keys and update:"
echo ""
echo "1Password:"
echo "  - Item: GHXSTSHIP Supabase $ENVIRONMENT"
echo "  - Fields: SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "Vercel (for each app):"
echo "  vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY $ENVIRONMENT"
echo "  vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY $ENVIRONMENT"
echo "  vercel env rm SUPABASE_SERVICE_ROLE_KEY $ENVIRONMENT"
echo "  vercel env add SUPABASE_SERVICE_ROLE_KEY $ENVIRONMENT"
echo ""
echo "GitHub Actions:"
echo "  - Go to: https://github.com/ghxstship/dragonflyone/settings/secrets/actions"
echo "  - Update: SUPABASE_${ENVIRONMENT^^}_ANON_KEY"
echo "  - Update: SUPABASE_${ENVIRONMENT^^}_SERVICE_ROLE_KEY"
echo ""
echo "Step 4: Redeploy all services"
echo "  pnpm deploy:$ENVIRONMENT"
echo ""
echo "Step 5: Document rotation in CHANGELOG:"
echo "  Date: $(date +%Y-%m-%d)"
echo "  Keys rotated: Supabase $ENVIRONMENT anon + service_role"
echo ""
echo "Step 6: Verify all services are operational"
echo "  - Check health endpoints"
echo "  - Test authentication flows"
echo "  - Verify webhook deliveries"
echo ""
read -p "Press ENTER when rotation is complete..."
echo ""
echo "✅ Key rotation checklist displayed"
echo "⚠️  Don't forget to document in CHANGELOG!"
