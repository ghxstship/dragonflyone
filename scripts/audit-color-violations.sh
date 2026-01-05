#!/bin/bash

# Color Violations Audit Script
# Scans for hardcoded colors and non-grayscale Tailwind classes

echo "🔍 GHXSTSHIP Color System Audit"
echo "================================"

# Colors to look for (hex patterns)
COLOR_PATTERNS=(
  "#[0-9A-Fa-f]\{6\}"
  "#[0-9A-Fa-f]\{3\}"
  "rgba\("
  "rgb\("
  "hsl\("
  "hsla\("
)

# Non-grayscale Tailwind colors to flag
TAILWIND_COLORS=(
  "bg-red-"
  "bg-blue-"
  "bg-green-"
  "bg-orange-"
  "bg-purple-"
  "bg-pink-"
  "bg-yellow-"
  "bg-cyan-"
  "bg-teal-"
  "bg-indigo-"
  "bg-violet-"
  "bg-amber-"
  "bg-lime-"
  "bg-emerald-"
  "bg-rose-"
  "bg-fuchsia-"
  "bg-sky-"
  "text-red-"
  "text-blue-"
  "text-green-"
  "text-orange-"
  "text-purple-"
  "text-pink-"
  "text-yellow-"
  "text-cyan-"
  "text-teal-"
  "text-indigo-"
  "text-violet-"
  "text-amber-"
  "text-lime-"
  "text-emerald-"
  "text-rose-"
  "text-fuchsia-"
  "text-sky-"
  "border-red-"
  "border-blue-"
  "border-green-"
  "border-orange-"
  "border-purple-"
  "border-pink-"
  "border-yellow-"
  "border-cyan-"
  "border-teal-"
  "border-indigo-"
  "border-violet-"
  "border-amber-"
  "border-lime-"
  "border-emerald-"
  "border-rose-"
  "border-fuchsia-"
  "border-sky-"
  "ring-red-"
  "ring-blue-"
  "ring-green-"
  "ring-orange-"
  "ring-purple-"
  "ring-pink-"
  "ring-yellow-"
  "ring-cyan-"
  "ring-teal-"
  "ring-indigo-"
  "ring-violet-"
  "ring-amber-"
  "ring-lime-"
  "ring-emerald-"
  "ring-rose-"
  "ring-fuchsia-"
  "ring-sky-"
)

# Directories to scan
SCAN_DIRS=("packages" "apps")

# File extensions to check
FILE_TYPES=("*.tsx" "*.ts" "*.css" "*.scss")

VIOLATIONS_FOUND=0

echo ""
echo "🎨 SCANNING FOR HARDCODED COLORS..."
echo "------------------------------------"

# Scan for hardcoded colors
for pattern in "${COLOR_PATTERNS[@]}"; do
  echo "Checking pattern: $pattern"
  
  for dir in "${SCAN_DIRS[@]}"; do
    if [ -d "$dir" ]; then
      # Exclude design system tokens (these are allowed)
      matches=$(grep -rn "$pattern" "$dir" --include="${FILE_TYPES[*]}" | grep -v "design-system/tokens" | grep -v "node_modules" | head -10)
      
      if [ -n "$matches" ]; then
        echo "❌ VIOLATIONS FOUND:"
        echo "$matches"
        VIOLATIONS_FOUND=$((VIOLATIONS_FOUND + 1))
      else
        echo "✅ No violations for $pattern"
      fi
    fi
  done
  echo ""
done

echo "🎨 SCANNING FOR NON-GRAYSCALE TAILWIND CLASSES..."
echo "--------------------------------------------"

# Scan for non-grayscale Tailwind classes
for color in "${TAILWIND_COLORS[@]}"; do
  for dir in "${SCAN_DIRS[@]}"; do
    if [ -d "$dir" ]; then
      matches=$(grep -rn "$color" "$dir" --include="${FILE_TYPES[*]}" | grep -v "node_modules" | head -5)
      
      if [ -n "$matches" ]; then
        echo "❌ VIOLATION: $color"
        echo "$matches"
        VIOLATIONS_FOUND=$((VIOLATIONS_FOUND + 1))
      fi
    fi
  done
done

echo ""
echo "📊 AUDIT SUMMARY"
echo "==============="

if [ $VIOLATIONS_FOUND -gt 0 ]; then
  echo "❌ $VIOLATIONS_FOUND color violation(s) found!"
  echo ""
  echo "🔧 REMEDIATION STEPS:"
  echo "1. Replace hardcoded colors with CSS variables"
  echo "2. Use semantic tokens (success, error, warning, info)"
  echo "3. Use grayscale classes only"
  echo "4. Use accent tokens for brand colors"
  echo ""
  echo "📖 See: /docs/GHXSTSHIP_COLOR_IMPLEMENTATION.md"
  exit 1
else
  echo "✅ No color violations found!"
  echo "🎉 GHXSTSHIP color system is compliant!"
  exit 0
fi
