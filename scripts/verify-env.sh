#!/bin/bash
set -e

echo "Environment Verification Script"
echo "================================"

ERRORS=0

check_env_var() {
  if [ -z "${!1}" ]; then
    echo "❌ $1 is not set"
    ERRORS=$((ERRORS + 1))
  else
    echo "✓ $1 is set"
  fi
}

check_file() {
  if [ ! -f "$1" ]; then
    echo "❌ $1 not found"
    ERRORS=$((ERRORS + 1))
  else
    echo "✓ $1 exists"
  fi
}

check_command() {
  if ! command -v $1 &> /dev/null; then
    echo "❌ $1 not installed"
    ERRORS=$((ERRORS + 1))
  else
    echo "✓ $1 installed ($(command -v $1))"
  fi
}

echo ""
echo "Checking required commands..."
check_command node
check_command pnpm
check_command supabase

echo ""
echo "Checking environment files..."
check_file ".env.local"
check_file "supabase/config.toml"

echo ""
echo "Checking environment variables in .env.local..."
if [ -f ".env.local" ]; then
  source .env.local 2>/dev/null || true
  check_env_var "NEXT_PUBLIC_SUPABASE_URL"
  check_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  check_env_var "SUPABASE_SERVICE_ROLE_KEY"
fi

echo ""
echo "Checking Supabase status..."
if command -v supabase &> /dev/null; then
  if supabase status &> /dev/null; then
    echo "✓ Supabase is running"
    supabase status
  else
    echo "❌ Supabase is not running"
    echo "   Run: supabase start"
    ERRORS=$((ERRORS + 1))
  fi
fi

echo ""
echo "Checking migrations..."
if [ -d "supabase/migrations" ]; then
  MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
  echo "✓ Found $MIGRATION_COUNT migration files"
else
  echo "❌ migrations directory not found"
  ERRORS=$((ERRORS + 1))
fi

echo ""
echo "Checking Edge Functions..."
if [ -d "supabase/functions" ]; then
  FUNCTION_COUNT=$(ls -d supabase/functions/*/ 2>/dev/null | grep -v _shared | wc -l)
  echo "✓ Found $FUNCTION_COUNT Edge Functions"
else
  echo "❌ functions directory not found"
  ERRORS=$((ERRORS + 1))
fi

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "✅ All checks passed!"
  exit 0
else
  echo "❌ $ERRORS error(s) found"
  exit 1
fi
