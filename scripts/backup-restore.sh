#!/bin/bash
set -e

COMMAND=${1:-"backup"}
ENVIRONMENT=${2:-"production"}

if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
  echo "Invalid environment. Use: staging or production"
  exit 1
fi

if [ "$ENVIRONMENT" == "staging" ]; then
  PROJECT_REF=$SUPABASE_STAGING_PROJECT_REF
  DB_URL=$SUPABASE_STAGING_DB_URL
else
  PROJECT_REF=$SUPABASE_PRODUCTION_PROJECT_REF
  DB_URL=$SUPABASE_PRODUCTION_DB_URL
fi

BACKUP_DIR="./backups/${ENVIRONMENT}"
mkdir -p $BACKUP_DIR

case $COMMAND in
  backup)
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"
    
    echo "Creating backup: $BACKUP_FILE"
    pg_dump "$DB_URL" \
      --format=plain \
      --no-owner \
      --no-acl \
      --exclude-schema=extensions \
      --exclude-schema=graphql \
      --exclude-schema=graphql_public \
      > "$BACKUP_FILE"
    
    gzip "$BACKUP_FILE"
    echo "Backup created: ${BACKUP_FILE}.gz"
    
    find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
    echo "Old backups (>30 days) deleted"
    ;;
    
  restore)
    BACKUP_FILE=$3
    if [ -z "$BACKUP_FILE" ]; then
      echo "Usage: $0 restore <environment> <backup_file>"
      exit 1
    fi
    
    if [ ! -f "$BACKUP_FILE" ]; then
      echo "Backup file not found: $BACKUP_FILE"
      exit 1
    fi
    
    echo "WARNING: This will restore $BACKUP_FILE to $ENVIRONMENT"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
      echo "Restore cancelled"
      exit 0
    fi
    
    if [[ "$BACKUP_FILE" == *.gz ]]; then
      gunzip -c "$BACKUP_FILE" | psql "$DB_URL"
    else
      psql "$DB_URL" < "$BACKUP_FILE"
    fi
    
    echo "Restore complete"
    ;;
    
  list)
    echo "Available backups for $ENVIRONMENT:"
    ls -lh "${BACKUP_DIR}/backup_*.sql.gz" 2>/dev/null || echo "No backups found"
    ;;
    
  pitr)
    TARGET_TIME=$3
    if [ -z "$TARGET_TIME" ]; then
      echo "Usage: $0 pitr <environment> <timestamp>"
      echo "Example: $0 pitr production '2024-11-22 15:30:00'"
      exit 1
    fi
    
    echo "Point-in-Time Recovery to: $TARGET_TIME"
    echo "This requires Supabase Pro plan with PITR enabled"
    echo "Use Supabase Dashboard or CLI for PITR operations"
    ;;
    
  *)
    echo "Usage: $0 {backup|restore|list|pitr} <environment> [args]"
    echo ""
    echo "Commands:"
    echo "  backup <env>              - Create database backup"
    echo "  restore <env> <file>      - Restore from backup file"
    echo "  list <env>                - List available backups"
    echo "  pitr <env> <timestamp>    - Point-in-Time Recovery info"
    echo ""
    echo "Environments: staging, production"
    exit 1
    ;;
esac
