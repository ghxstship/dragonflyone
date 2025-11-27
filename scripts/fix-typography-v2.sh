#!/bin/bash

# Typography Remediation Script v2
# More comprehensive fixes for typography violations

echo "Starting comprehensive typography remediation..."

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
    # Fix standalone text-xs (not already fixed)
    sed -i '' \
      -e 's/"text-xs /"text-mono-xs /g' \
      -e 's/ text-xs"/ text-mono-xs"/g' \
      -e 's/ text-xs / text-mono-xs /g' \
      "$file"
    
    # Fix standalone text-sm (not already fixed)
    sed -i '' \
      -e 's/"text-sm /"text-body-sm /g' \
      -e 's/ text-sm"/ text-body-sm"/g' \
      -e 's/ text-sm / text-body-sm /g' \
      "$file"
    
    # Fix standalone text-base
    sed -i '' \
      -e 's/"text-base /"text-body-sm /g' \
      -e 's/ text-base"/ text-body-sm"/g' \
      -e 's/ text-base / text-body-sm /g' \
      "$file"
    
    # Fix standalone text-lg
    sed -i '' \
      -e 's/"text-lg /"text-body-md /g' \
      -e 's/ text-lg"/ text-body-md"/g' \
      -e 's/ text-lg / text-body-md /g' \
      "$file"
    
    # Fix standalone text-xl
    sed -i '' \
      -e 's/"text-xl /"text-h6-md /g' \
      -e 's/ text-xl"/ text-h6-md"/g' \
      -e 's/ text-xl / text-h6-md /g' \
      "$file"
    
    # Fix standalone text-2xl
    sed -i '' \
      -e 's/"text-2xl /"text-h5-md /g' \
      -e 's/ text-2xl"/ text-h5-md"/g' \
      -e 's/ text-2xl / text-h5-md /g' \
      "$file"
    
    # Fix standalone text-3xl
    sed -i '' \
      -e 's/"text-3xl /"text-h4-md /g' \
      -e 's/ text-3xl"/ text-h4-md"/g' \
      -e 's/ text-3xl / text-h4-md /g' \
      "$file"
    
    # Fix standalone text-4xl
    sed -i '' \
      -e 's/"text-4xl /"text-h3-md /g' \
      -e 's/ text-4xl"/ text-h3-md"/g' \
      -e 's/ text-4xl / text-h3-md /g' \
      "$file"
    
    # Fix text-5xl
    sed -i '' \
      -e 's/"text-5xl /"text-h2-md /g' \
      -e 's/ text-5xl"/ text-h2-md"/g' \
      -e 's/ text-5xl / text-h2-md /g' \
      "$file"
    
    # Fix text-6xl
    sed -i '' \
      -e 's/"text-6xl /"text-h1-sm /g' \
      -e 's/ text-6xl"/ text-h1-sm"/g' \
      -e 's/ text-6xl / text-h1-sm /g' \
      "$file"
    
    # Fix text-7xl
    sed -i '' \
      -e 's/"text-7xl /"text-h1-md /g' \
      -e 's/ text-7xl"/ text-h1-md"/g' \
      -e 's/ text-7xl / text-h1-md /g' \
      "$file"
    
    # Fix text-8xl
    sed -i '' \
      -e 's/"text-8xl /"text-display-md /g' \
      -e 's/ text-8xl"/ text-display-md"/g' \
      -e 's/ text-8xl / text-display-md /g' \
      "$file"
    
    # Fix text-9xl
    sed -i '' \
      -e 's/"text-9xl /"text-display-lg /g' \
      -e 's/ text-9xl"/ text-display-lg"/g' \
      -e 's/ text-9xl / text-display-lg /g' \
      "$file"
  done
  
  echo "Completed $DIR"
done

echo "Typography remediation v2 complete!"
