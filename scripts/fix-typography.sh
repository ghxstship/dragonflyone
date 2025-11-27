#!/bin/bash

# Typography Remediation Script
# Fixes common typography violations across the codebase

echo "Starting typography remediation..."

# Define the directories to process
DIRS=(
  "apps/gvteway/src"
  "apps/atlvs/src"
  "apps/compvss/src"
)

for DIR in "${DIRS[@]}"; do
  echo "Processing $DIR..."
  
  # Fix text-xs -> text-mono-xs (in className strings)
  find "$DIR" -name "*.tsx" -type f -exec sed -i '' \
    -e 's/text-xs uppercase/text-mono-xs uppercase/g' \
    -e 's/text-xs tracking/text-mono-xs tracking/g' \
    -e 's/text-xs font-mono/text-mono-xs/g' \
    -e 's/text-xs font-code/text-mono-xs font-code/g' \
    {} \;
  
  # Fix text-sm -> text-body-sm (in className strings, excluding mono contexts)
  find "$DIR" -name "*.tsx" -type f -exec sed -i '' \
    -e 's/text-sm text-ink/text-body-sm text-ink/g' \
    -e 's/text-sm text-grey/text-body-sm text-grey/g' \
    -e 's/text-sm text-white/text-body-sm text-white/g' \
    -e 's/text-sm italic/text-body-sm italic/g' \
    {} \;
  
  # Fix text-base -> text-body-sm
  find "$DIR" -name "*.tsx" -type f -exec sed -i '' \
    -e 's/text-base text-ink/text-body-sm text-ink/g' \
    -e 's/text-base text-grey/text-body-sm text-grey/g' \
    {} \;
  
  # Fix text-lg -> text-body-md
  find "$DIR" -name "*.tsx" -type f -exec sed -i '' \
    -e 's/text-lg text-ink/text-body-md text-ink/g' \
    -e 's/text-lg text-grey/text-body-md text-grey/g' \
    -e 's/text-lg text-white/text-body-md text-white/g' \
    {} \;
  
  # Fix text-xl -> text-h6-md
  find "$DIR" -name "*.tsx" -type f -exec sed -i '' \
    -e 's/text-xl uppercase/text-h6-md uppercase/g' \
    -e 's/text-xl text-white/text-h6-md text-white/g' \
    {} \;
  
  # Fix text-2xl -> text-h5-md (for headings)
  find "$DIR" -name "*.tsx" -type f -exec sed -i '' \
    -e 's/text-2xl uppercase/text-h5-md uppercase/g' \
    {} \;
  
  # Fix text-3xl -> text-h4-md
  find "$DIR" -name "*.tsx" -type f -exec sed -i '' \
    -e 's/text-3xl text-white/text-h4-md text-white/g' \
    -e 's/text-3xl text-ink/text-h4-md text-ink/g' \
    {} \;
  
  # Fix text-4xl -> text-h3-md
  find "$DIR" -name "*.tsx" -type f -exec sed -i '' \
    -e 's/text-4xl text-white/text-h3-md text-white/g' \
    -e 's/text-4xl text-ink/text-h3-md text-ink/g' \
    -e 's/text-4xl text-black/text-h3-md text-black/g' \
    {} \;
  
  # Fix tracking-wider -> tracking-widest (for labels/kickers)
  find "$DIR" -name "*.tsx" -type f -exec sed -i '' \
    -e 's/uppercase tracking-wider/uppercase tracking-widest/g' \
    {} \;
  
  echo "Completed $DIR"
done

echo "Typography remediation complete!"
echo "Please review changes and run 'pnpm build' to verify."
