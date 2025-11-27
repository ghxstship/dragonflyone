#!/bin/bash

# Typography Remediation Script v4
# Targeted fixes for remaining patterns

echo "Starting targeted typography remediation..."

DIRS=(
  "apps/gvteway/src"
  "apps/atlvs/src"
  "apps/compvss/src"
)

for DIR in "${DIRS[@]}"; do
  echo "Processing $DIR..."
  
  find "$DIR" -name "*.tsx" -type f ! -path "*/.next/*" | while read -r file; do
    
    # Fix "text-sm" patterns (with quotes)
    sed -i '' 's/"text-sm /"text-body-sm /g' "$file"
    sed -i '' 's/ text-sm"/ text-body-sm"/g' "$file"
    sed -i '' 's/`text-sm /`text-body-sm /g' "$file"
    sed -i '' 's/ text-sm`/ text-body-sm`/g' "$file"
    
    # Fix "text-xs" patterns
    sed -i '' 's/"text-xs /"text-mono-xs /g' "$file"
    sed -i '' 's/ text-xs"/ text-mono-xs"/g' "$file"
    sed -i '' 's/`text-xs /`text-mono-xs /g' "$file"
    sed -i '' 's/ text-xs`/ text-mono-xs`/g' "$file"
    
    # Fix "text-2xl" patterns (icons/emojis)
    sed -i '' 's/"text-2xl"/"text-h5-md"/g' "$file"
    sed -i '' 's/"text-3xl"/"text-h4-md"/g' "$file"
    sed -i '' 's/"text-4xl"/"text-h3-md"/g' "$file"
    sed -i '' 's/"text-5xl"/"text-h2-md"/g' "$file"
    sed -i '' 's/"text-6xl"/"text-h1-sm"/g' "$file"
    
    # Fix className="text-Nxl" patterns
    sed -i '' 's/className="text-2xl"/className="text-h5-md"/g' "$file"
    sed -i '' 's/className="text-3xl"/className="text-h4-md"/g' "$file"
    sed -i '' 's/className="text-4xl"/className="text-h3-md"/g' "$file"
    sed -i '' 's/className="text-5xl"/className="text-h2-md"/g' "$file"
    sed -i '' 's/className="text-6xl"/className="text-h1-sm"/g' "$file"
    
    # Fix backtick patterns with text-sm in template literals
    sed -i '' 's/\${[^}]*}text-sm/\${...}text-body-sm/g' "$file"
    
  done
  
  echo "Completed $DIR"
done

echo "Targeted typography remediation complete!"
