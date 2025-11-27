#!/bin/bash

# Typography Remediation Script v3
# Final pass to fix remaining violations

echo "Starting final typography remediation pass..."

# Define the directories to process
DIRS=(
  "apps/gvteway/src"
  "apps/atlvs/src"
  "apps/compvss/src"
)

for DIR in "${DIRS[@]}"; do
  echo "Processing $DIR..."
  
  # Skip .next directories
  find "$DIR" -name "*.tsx" -type f ! -path "*/.next/*" | while read -r file; do
    
    # Fix md:text-lg patterns
    sed -i '' 's/md:text-lg/md:text-body-md/g' "$file"
    
    # Fix md:text-xl patterns  
    sed -i '' 's/md:text-xl/md:text-h6-md/g' "$file"
    
    # Fix md:text-2xl patterns
    sed -i '' 's/md:text-2xl/md:text-h5-md/g' "$file"
    
    # Fix md:text-3xl patterns
    sed -i '' 's/md:text-3xl/md:text-h4-md/g' "$file"
    
    # Fix md:text-4xl patterns
    sed -i '' 's/md:text-4xl/md:text-h3-md/g' "$file"
    
    # Fix md:text-5xl patterns
    sed -i '' 's/md:text-5xl/md:text-h2-md/g' "$file"
    
    # Fix md:text-6xl patterns
    sed -i '' 's/md:text-6xl/md:text-h1-sm/g' "$file"
    
    # Fix md:text-7xl patterns
    sed -i '' 's/md:text-7xl/md:text-h1-md/g' "$file"
    
    # Fix md:text-8xl patterns
    sed -i '' 's/md:text-8xl/md:text-display-md/g' "$file"
    
    # Fix lg:text-* patterns
    sed -i '' 's/lg:text-lg/lg:text-body-md/g' "$file"
    sed -i '' 's/lg:text-xl/lg:text-h6-md/g' "$file"
    sed -i '' 's/lg:text-2xl/lg:text-h5-md/g' "$file"
    sed -i '' 's/lg:text-3xl/lg:text-h4-md/g' "$file"
    sed -i '' 's/lg:text-4xl/lg:text-h3-md/g' "$file"
    sed -i '' 's/lg:text-5xl/lg:text-h2-md/g' "$file"
    sed -i '' 's/lg:text-6xl/lg:text-h1-sm/g' "$file"
    sed -i '' 's/lg:text-7xl/lg:text-h1-md/g' "$file"
    sed -i '' 's/lg:text-8xl/lg:text-display-md/g' "$file"
    sed -i '' 's/lg:text-9xl/lg:text-display-lg/g' "$file"
    
    # Fix remaining standalone patterns with word boundaries
    sed -i '' 's/ text-xs / text-mono-xs /g' "$file"
    sed -i '' 's/ text-sm / text-body-sm /g' "$file"
    sed -i '' 's/ text-base / text-body-sm /g' "$file"
    sed -i '' 's/ text-lg / text-body-md /g' "$file"
    sed -i '' 's/ text-xl / text-h6-md /g' "$file"
    sed -i '' 's/ text-2xl / text-h5-md /g' "$file"
    sed -i '' 's/ text-3xl / text-h4-md /g' "$file"
    sed -i '' 's/ text-4xl / text-h3-md /g' "$file"
    sed -i '' 's/ text-5xl / text-h2-md /g' "$file"
    sed -i '' 's/ text-6xl / text-h1-sm /g' "$file"
    sed -i '' 's/ text-7xl / text-h1-md /g' "$file"
    sed -i '' 's/ text-8xl / text-display-md /g' "$file"
    sed -i '' 's/ text-9xl / text-display-lg /g' "$file"
    
  done
  
  echo "Completed $DIR"
done

echo "Final typography remediation pass complete!"
