#!/bin/bash

echo "🔍 Scanning for raw Tailwind violations..."
echo ""

VIOLATIONS=0

# Colors - check for default Tailwind color palette
COLOR_MATCHES=$(grep -rEn "(bg|text|border|ring)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]+" --include="*.tsx" --include="*.jsx" apps/ packages/ui/src/ 2>/dev/null | grep -v "node_modules" | grep -v ".next" | wc -l | tr -d ' ')
if [ "$COLOR_MATCHES" -gt 0 ]; then
  echo "❌ RAW COLORS: $COLOR_MATCHES violations"
  VIOLATIONS=$((VIOLATIONS + COLOR_MATCHES))
else
  echo "✅ RAW COLORS: 0 violations"
fi

# Typography - raw text sizes
TYPO_MATCHES=$(grep -rEn "text-(xs|sm|base|lg|xl|[0-9]xl)" --include="*.tsx" --include="*.jsx" apps/ packages/ui/src/ 2>/dev/null | grep -v "node_modules" | grep -v ".next" | grep -v "text-body-" | grep -v "text-mono-" | grep -v "text-h[1-6]-" | grep -v "text-display-" | wc -l | tr -d ' ')
if [ "$TYPO_MATCHES" -gt 0 ]; then
  echo "❌ RAW TYPOGRAPHY: $TYPO_MATCHES violations"
  VIOLATIONS=$((VIOLATIONS + TYPO_MATCHES))
else
  echo "✅ RAW TYPOGRAPHY: 0 violations"
fi

# Font weights - raw font weights
FONT_WEIGHT_MATCHES=$(grep -rEn "font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)" --include="*.tsx" --include="*.jsx" apps/ packages/ui/src/ 2>/dev/null | grep -v "node_modules" | grep -v ".next" | wc -l | tr -d ' ')
if [ "$FONT_WEIGHT_MATCHES" -gt 0 ]; then
  echo "❌ RAW FONT WEIGHTS: $FONT_WEIGHT_MATCHES violations"
  VIOLATIONS=$((VIOLATIONS + FONT_WEIGHT_MATCHES))
else
  echo "✅ RAW FONT WEIGHTS: 0 violations"
fi

# Spacing - raw margin/padding with numbers (excluding semantic tokens)
SPACE_MATCHES=$(grep -rEn "className.*[mp][xytrbl]?-[0-9]+" --include="*.tsx" --include="*.jsx" apps/ packages/ui/src/ 2>/dev/null | grep -v "node_modules" | grep -v ".next" | grep -v "spacing-" | wc -l | tr -d ' ')
if [ "$SPACE_MATCHES" -gt 0 ]; then
  echo "❌ RAW SPACING: $SPACE_MATCHES violations"
  VIOLATIONS=$((VIOLATIONS + SPACE_MATCHES))
else
  echo "✅ RAW SPACING: 0 violations"
fi

# Gap - raw gap with numbers (excluding semantic tokens)
GAP_MATCHES=$(grep -rEn "className.*gap-[0-9]+" --include="*.tsx" --include="*.jsx" apps/ packages/ui/src/ 2>/dev/null | grep -v "node_modules" | grep -v ".next" | grep -v "gap-spacing-" | grep -v "gap-gap-" | wc -l | tr -d ' ')
if [ "$GAP_MATCHES" -gt 0 ]; then
  echo "❌ RAW GAP: $GAP_MATCHES violations"
  VIOLATIONS=$((VIOLATIONS + GAP_MATCHES))
else
  echo "✅ RAW GAP: 0 violations"
fi

# Width/Height - raw w-/h- with numbers (excluding semantic tokens)
SIZE_MATCHES=$(grep -rEn "className.*[wh]-[0-9]+" --include="*.tsx" --include="*.jsx" apps/ packages/ui/src/ 2>/dev/null | grep -v "node_modules" | grep -v ".next" | grep -v "w-icon-" | grep -v "h-icon-" | grep -v "w-avatar-" | grep -v "h-avatar-" | grep -v "w-spacing-" | grep -v "h-spacing-" | wc -l | tr -d ' ')
if [ "$SIZE_MATCHES" -gt 0 ]; then
  echo "❌ RAW SIZES: $SIZE_MATCHES violations"
  VIOLATIONS=$((VIOLATIONS + SIZE_MATCHES))
else
  echo "✅ RAW SIZES: 0 violations"
fi

# Border/Radius/Shadow - raw values
BORDER_MATCHES=$(grep -rEn "(rounded|shadow)-(sm|md|lg|xl|2xl|none|full)" --include="*.tsx" --include="*.jsx" apps/ packages/ui/src/ 2>/dev/null | grep -v "node_modules" | grep -v ".next" | wc -l | tr -d ' ')
if [ "$BORDER_MATCHES" -gt 0 ]; then
  echo "❌ RAW BORDERS/RADIUS/SHADOW: $BORDER_MATCHES violations"
  VIOLATIONS=$((VIOLATIONS + BORDER_MATCHES))
else
  echo "✅ RAW BORDERS/RADIUS/SHADOW: 0 violations"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$VIOLATIONS" -gt 0 ]; then
  echo "❌ FAILED: $VIOLATIONS total violations found"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 1
else
  echo "✅ PASSED: Zero raw Tailwind violations"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 0
fi
