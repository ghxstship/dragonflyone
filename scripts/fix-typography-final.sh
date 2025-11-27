#!/bin/bash

# Typography Remediation Script - FINAL
# Comprehensive fix for all remaining patterns

echo "Starting FINAL typography remediation..."

DIRS=(
  "apps/gvteway/src"
  "apps/atlvs/src"
  "apps/compvss/src"
)

for DIR in "${DIRS[@]}"; do
  echo "Processing $DIR..."
  
  find "$DIR" -name "*.tsx" -type f ! -path "*/.next/*" | while read -r file; do
    
    # Fix className="text-sm" (exact match)
    sed -i '' 's/className="text-sm"/className="text-body-sm"/g' "$file"
    
    # Fix className="text-xs" (exact match)
    sed -i '' 's/className="text-xs"/className="text-mono-xs"/g' "$file"
    
    # Fix className="text-base" (exact match)
    sed -i '' 's/className="text-base"/className="text-body-sm"/g' "$file"
    
    # Fix className="text-lg" (exact match)
    sed -i '' 's/className="text-lg"/className="text-body-md"/g' "$file"
    
    # Fix className="text-xl" (exact match)
    sed -i '' 's/className="text-xl"/className="text-h6-md"/g' "$file"
    
    # Fix className="text-8xl" (exact match)
    sed -i '' 's/className="text-8xl"/className="text-display-md"/g' "$file"
    
    # Fix patterns with backticks at start
    sed -i '' 's/className={`text-sm /className={`text-body-sm /g' "$file"
    sed -i '' 's/className={`text-xs /className={`text-mono-xs /g' "$file"
    sed -i '' 's/className={`text-lg /className={`text-body-md /g' "$file"
    sed -i '' 's/className={`text-xl /className={`text-h6-md /g' "$file"
    sed -i '' 's/className={`text-2xl /className={`text-h5-md /g' "$file"
    sed -i '' 's/className={`text-3xl /className={`text-h4-md /g' "$file"
    sed -i '' 's/className={`text-4xl /className={`text-h3-md /g' "$file"
    
    # Fix gap patterns
    sed -i '' 's/gap={2} className="text-sm"/gap={2} className="text-body-sm"/g' "$file"
    
  done
  
  echo "Completed $DIR"
done

echo "FINAL typography remediation complete!"
