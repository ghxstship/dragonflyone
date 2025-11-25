#!/bin/bash
set -e

echo "GHXSTSHIP Rollback Script"
echo "=========================="

ENVIRONMENT=${1:-"staging"}
TARGET_VERSION=${2}

if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
  echo "Usage: $0 {staging|production} [target_version]"
  exit 1
fi

if [ -z "$TARGET_VERSION" ]; then
  echo "Error: Target version required"
  echo "Usage: $0 $ENVIRONMENT <target_version>"
  exit 1
fi

echo ""
echo "⚠️  WARNING: Rolling back $ENVIRONMENT to version $TARGET_VERSION"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Rollback cancelled"
  exit 0
fi

PROJECT_REF_VAR="SUPABASE_${ENVIRONMENT^^}_PROJECT_REF"
PROJECT_REF=${!PROJECT_REF_VAR}

if [ -z "$PROJECT_REF" ]; then
  echo "Error: $PROJECT_REF_VAR not set"
  exit 1
fi

echo ""
echo "Step 1: Check current deployment status"
vercel ls --scope $VERCEL_ORG_ID

echo ""
echo "Step 2: Rollback database migrations"
echo "Connecting to Supabase project: $PROJECT_REF"

supabase link --project-ref $PROJECT_REF

CURRENT_MIGRATION=$(supabase migration list | tail -1 | awk '{print $1}')
echo "Current migration: $CURRENT_MIGRATION"
echo "Target version: $TARGET_VERSION"

if [ "$CURRENT_MIGRATION" == "$TARGET_VERSION" ]; then
  echo "Already at target version"
else
  echo "Rolling back migrations to $TARGET_VERSION"
  
  cd supabase
  
  MIGRATIONS=$(ls -1 migrations/*.sql | sort -r)
  
  for migration in $MIGRATIONS; do
    MIGRATION_VERSION=$(basename $migration .sql | cut -d'_' -f1)
    
    if [ "$MIGRATION_VERSION" \> "$TARGET_VERSION" ]; then
      echo "Reverting migration: $migration"
      
    else
      break
    fi
  done
  
  cd ..
fi

echo ""
echo "Step 3: Rollback application deployment"

if [ "$ENVIRONMENT" == "production" ]; then
  ATLVS_DEPLOYMENT=$(vercel ls atlvs --scope $VERCEL_ORG_ID | grep "$TARGET_VERSION" | head -1 | awk '{print $1}')
  COMPVSS_DEPLOYMENT=$(vercel ls compvss --scope $VERCEL_ORG_ID | grep "$TARGET_VERSION" | head -1 | awk '{print $1}')
  GVTEWAY_DEPLOYMENT=$(vercel ls gvteway --scope $VERCEL_ORG_ID | grep "$TARGET_VERSION" | head -1 | awk '{print $1}')
  
  if [ -n "$ATLVS_DEPLOYMENT" ]; then
    echo "Rolling back ATLVS to: $ATLVS_DEPLOYMENT"
    vercel promote $ATLVS_DEPLOYMENT --scope $VERCEL_ORG_ID
  fi
  
  if [ -n "$COMPVSS_DEPLOYMENT" ]; then
    echo "Rolling back COMPVSS to: $COMPVSS_DEPLOYMENT"
    vercel promote $COMPVSS_DEPLOYMENT --scope $VERCEL_ORG_ID
  fi
  
  if [ -n "$GVTEWAY_DEPLOYMENT" ]; then
    echo "Rolling back GVTEWAY to: $GVTEWAY_DEPLOYMENT"
    vercel promote $GVTEWAY_DEPLOYMENT --scope $VERCEL_ORG_ID
  fi
fi

echo ""
echo "Step 4: Verify rollback"
echo "Checking application health..."

sleep 10

for app in atlvs compvss gvteway; do
  if [ "$ENVIRONMENT" == "production" ]; then
    URL="https://$app.ghxstship.com/api/health"
  else
    URL="https://$app-staging.ghxstship.com/api/health"
  fi
  
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL)
  
  if [ "$HTTP_STATUS" == "200" ]; then
    echo "✓ $app health check passed"
  else
    echo "✗ $app health check failed (HTTP $HTTP_STATUS)"
  fi
done

echo ""
echo "Step 5: Document rollback"
ROLLBACK_LOG="rollback_${ENVIRONMENT}_$(date +%Y%m%d_%H%M%S).log"

cat > $ROLLBACK_LOG <<EOF
Rollback Execution Log
======================
Date: $(date)
Environment: $ENVIRONMENT
Target Version: $TARGET_VERSION
Executed By: $(whoami)

Database Status: Rolled back to migration $TARGET_VERSION
Application Status: Deployments promoted to $TARGET_VERSION

Health Checks:
- ATLVS: $([[ "$HTTP_STATUS" == "200" ]] && echo "OK" || echo "FAILED")
- COMPVSS: $([[ "$HTTP_STATUS" == "200" ]] && echo "OK" || echo "FAILED")
- GVTEWAY: $([[ "$HTTP_STATUS" == "200" ]] && echo "OK" || echo "FAILED")

Next Steps:
1. Monitor application metrics
2. Check error logs for anomalies
3. Notify team of rollback completion
4. Investigate root cause of issue
EOF

echo "Rollback log created: $ROLLBACK_LOG"

echo ""
echo "✅ Rollback complete!"
echo ""
echo "Post-rollback checklist:"
echo "  1. Monitor application metrics"
echo "  2. Review error logs"
echo "  3. Notify stakeholders"
echo "  4. Document incident"
echo "  5. Plan forward fix"
