#!/bin/bash

# Comprehensive script to remove all inverted prop usages from UI components

echo "Removing all inverted prop usages from UI components..."

# Remove inverted={...} patterns
find packages/ui/src -name "*.tsx" -exec sed -i '' 's/inverted=\{[^}]*\}//g' {} \;

# Remove inverted prop from destructuring in component parameters
find packages/ui/src -name "*.tsx" -exec sed -i '' 's/, inverted//g' {} \;
find packages/ui/src -name "*.tsx" -exec sed -i '' 's/inverted, //g' {} \;

# Remove inverted from variant function calls - simplified patterns
find packages/ui/src -name "*.tsx" -exec sed -i '' 's/({ inverted })/({})/g' {} \;
find packages/ui/src -name "*.tsx" -exec sed -i '' 's/({ variant, inverted })/({ variant })/g' {} \;
find packages/ui/src -name "*.tsx" -exec sed -i '' 's/({ variant, inverted, className })/({ variant, className })/g' {} \;
find packages/ui/src -name "*.tsx" -exec sed -i '' 's/({ inverted, className })/({ className })/g' {} \;

# Remove inverted from object literals
find packages/ui/src -name "*.tsx" -exec sed -i '' 's/inverted: inverted,//g' {} \;
find packages/ui/src -name "*.tsx" -exec sed -i '' 's/inverted: inverted//g' {} \;

echo "Completed removing inverted prop usages"
