#!/bin/bash
# validate-db-spec-sync.sh
# Validates that database schema changes are reflected in OpenAPI specs
# Run before release to ensure API documentation matches database

set -e

echo "🔍 Validating Database-to-Spec Synchronization"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: supabase CLI is not installed${NC}"
    echo "Install with: npm install -g supabase"
    exit 1
fi

# Check if we're linked to a project
if ! supabase db diff --linked --dry-run &> /dev/null; then
    echo -e "${YELLOW}Warning: Not linked to a Supabase project${NC}"
    echo "Run 'supabase link' to connect to your project"
    echo "Skipping database diff check..."
    exit 0
fi

echo ""
echo "📊 Checking for pending database changes..."

# Get the diff
DIFF_OUTPUT=$(supabase db diff --linked 2>&1 || true)

if [ -z "$DIFF_OUTPUT" ] || [[ "$DIFF_OUTPUT" == *"No changes"* ]]; then
    echo -e "${GREEN}✓ No pending database changes${NC}"
else
    echo -e "${YELLOW}⚠️  Pending database changes detected:${NC}"
    echo "$DIFF_OUTPUT" | head -50
    
    if [ $(echo "$DIFF_OUTPUT" | wc -l) -gt 50 ]; then
        echo "... (truncated, run 'supabase db diff --linked' for full output)"
    fi
    
    echo ""
    echo -e "${YELLOW}Please ensure these changes are reflected in the OpenAPI specs${NC}"
fi

echo ""
echo "📄 Checking OpenAPI specs for table references..."

# Extract table names from migrations
TABLES=$(grep -rh "CREATE TABLE" supabase/migrations/*.sql 2>/dev/null | \
    sed 's/.*CREATE TABLE[^"]*"\([^"]*\)".*/\1/' | \
    sort -u || echo "")

if [ -z "$TABLES" ]; then
    echo -e "${YELLOW}No tables found in migrations${NC}"
    exit 0
fi

# Check each platform's OpenAPI spec
PLATFORMS=("atlvs" "compvss" "gvteway")
MISSING_REFS=0

for platform in "${PLATFORMS[@]}"; do
    SPEC_FILE="packages/api-specs/${platform}/openapi.yaml"
    
    if [ ! -f "$SPEC_FILE" ]; then
        echo -e "${YELLOW}Skipping ${platform}: spec not found${NC}"
        continue
    fi
    
    echo ""
    echo "Checking ${platform}/openapi.yaml..."
    
    # Check for common table references in the spec
    # This is a heuristic check - not all tables need API endpoints
    CORE_TABLES=""
    case $platform in
        atlvs)
            CORE_TABLES="deals contacts invoices assets budgets"
            ;;
        compvss)
            CORE_TABLES="projects crew_assignments schedules inventory"
            ;;
        gvteway)
            CORE_TABLES="events tickets orders customers"
            ;;
    esac
    
    for table in $CORE_TABLES; do
        if ! grep -qi "$table" "$SPEC_FILE" 2>/dev/null; then
            echo -e "${YELLOW}  ⚠️  Table '${table}' not referenced in spec${NC}"
            MISSING_REFS=$((MISSING_REFS + 1))
        else
            echo -e "${GREEN}  ✓ ${table}${NC}"
        fi
    done
done

echo ""
echo "================================================"

if [ $MISSING_REFS -gt 0 ]; then
    echo -e "${YELLOW}Found ${MISSING_REFS} potential missing table references${NC}"
    echo "Review the OpenAPI specs to ensure all database entities are documented"
    echo ""
    echo "Note: Not all tables require API endpoints. This is a heuristic check."
else
    echo -e "${GREEN}✓ All core tables are referenced in OpenAPI specs${NC}"
fi

# Check for schema version consistency
echo ""
echo "📌 Checking schema versions..."

MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
LATEST_MIGRATION=$(ls -1 supabase/migrations/*.sql 2>/dev/null | tail -1 | xargs basename 2>/dev/null || echo "none")

echo "  Total migrations: ${MIGRATION_COUNT}"
echo "  Latest migration: ${LATEST_MIGRATION}"

# Extract version from OpenAPI specs
for platform in "${PLATFORMS[@]}"; do
    SPEC_FILE="packages/api-specs/${platform}/openapi.yaml"
    if [ -f "$SPEC_FILE" ]; then
        VERSION=$(grep "version:" "$SPEC_FILE" | head -1 | awk '{print $2}' | tr -d '"' || echo "unknown")
        echo "  ${platform} API version: ${VERSION}"
    fi
done

echo ""
echo "================================================"
echo -e "${GREEN}Database-to-Spec validation complete${NC}"
echo ""
echo "Next steps:"
echo "  1. Review any warnings above"
echo "  2. Update OpenAPI specs if needed"
echo "  3. Run 'pnpm run validate:openapi' to check spec coverage"
echo "  4. Commit changes before release"
