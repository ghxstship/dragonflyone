#!/bin/bash
set -e

echo "🚀 GHXSTSHIP Supabase Deployment Script"
echo "========================================"

ENVIRONMENT=${1:-"staging"}

if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
  echo "❌ Invalid environment. Use: staging or production"
  exit 1
fi

echo "📦 Deploying to: $ENVIRONMENT"

if [ "$ENVIRONMENT" == "staging" ]; then
  PROJECT_REF=$SUPABASE_STAGING_PROJECT_REF
else
  PROJECT_REF=$SUPABASE_PRODUCTION_PROJECT_REF
fi

if [ -z "$PROJECT_REF" ]; then
  echo "❌ Project reference not set for $ENVIRONMENT"
  exit 1
fi

echo "🔗 Linking to Supabase project..."
supabase link --project-ref $PROJECT_REF

echo "📊 Pushing database migrations..."
supabase db push

echo "🔐 Setting Edge Function secrets..."
if [ ! -z "$STRIPE_WEBHOOK_SECRET" ]; then
  supabase secrets set STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET"
fi

if [ ! -z "$TWILIO_AUTH_TOKEN" ]; then
  supabase secrets set TWILIO_AUTH_TOKEN="$TWILIO_AUTH_TOKEN"
fi

if [ ! -z "$GVTEWAY_WEBHOOK_SECRET" ]; then
  supabase secrets set GVTEWAY_WEBHOOK_SECRET="$GVTEWAY_WEBHOOK_SECRET"
fi

echo "☁️  Deploying Edge Functions..."
supabase functions deploy webhook-stripe
supabase functions deploy webhook-twilio
supabase functions deploy webhook-gvteway
supabase functions deploy automation-triggers
supabase functions deploy automation-actions
supabase functions deploy health-check

echo "🎯 Generating TypeScript types..."
supabase gen types typescript --linked > ../packages/config/supabase-types.ts

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "  1. Commit generated types: git add packages/config/supabase-types.ts"
echo "  2. Test endpoints: curl https://$PROJECT_REF.supabase.co/functions/v1/health-check"
echo "  3. Configure webhook URLs in external services"
