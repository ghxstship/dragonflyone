#!/bin/bash
# Script to refactor Supabase imports in ATLVS API routes
# This replaces direct Supabase client creation with imports from @/lib/supabase

set -e

API_DIR="/Users/julianclarkson/Documents/Dragonflyone/apps/atlvs/src/app/api"

echo "Refactoring Supabase imports in ATLVS API routes..."

# Find all TypeScript files that create their own Supabase clients
find "$API_DIR" -name "*.ts" -type f | while read -r file; do
  # Check if file creates its own supabase client
  if grep -q "const supabase = create" "$file" 2>/dev/null || \
     grep -q "createClient(" "$file" 2>/dev/null || \
     grep -q "createBrowserClient(" "$file" 2>/dev/null; then
    
    echo "Processing: $file"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Remove old imports and client creation patterns
    # Pattern 1: import { createClient } from '@supabase/supabase-js';
    sed -i '' "s/import { createClient } from '@supabase\/supabase-js';//g" "$file"
    
    # Pattern 2: import { createBrowserClient } from '@ghxstship/config';
    sed -i '' "s/import { createBrowserClient } from '@ghxstship\/config';//g" "$file"
    
    # Pattern 3: Remove client creation blocks (multiline - handled separately)
    
    # Add new import if not already present
    if ! grep -q "from '@/lib/supabase'" "$file"; then
      # Add import after the first import statement
      sed -i '' "1a\\
import { supabaseAdmin, fromDynamic } from '@/lib/supabase';
" "$file"
    fi
  fi
done

echo "Refactoring complete. Backup files created with .bak extension."
echo "Please review changes and remove backup files when satisfied."
