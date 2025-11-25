#!/bin/bash
set -e

echo "🏗️  GHXSTSHIP Local Supabase Development"
echo "======================================"

echo "🚀 Starting Supabase..."
supabase start

echo "🔄 Resetting database..."
supabase db reset

echo "✅ Database reset complete"

echo "🎯 Generating TypeScript types..."
supabase gen types typescript --local > packages/config/supabase-types.ts

echo "📊 Current Status:"
supabase status

echo ""
echo "✨ Supabase is ready!"
echo ""
echo "Access points:"
echo "  Studio URL: http://localhost:54323"
echo "  API URL: http://localhost:54321"
echo "  DB URL: postgresql://postgres:postgres@localhost:54322/postgres"
echo ""
echo "Edge Functions:"
echo "  - supabase functions serve webhook-stripe"
echo "  - supabase functions serve automation-triggers"
echo ""
echo "To stop: supabase stop"
