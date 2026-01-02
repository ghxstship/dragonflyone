/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  GHXSTSHIP DESIGN SYSTEM — BOLD CONTEMPORARY POP ART ADVENTURE                ║
 * ╠═══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                               ║
 * ║  ZERO TOLERANCE POLICY:                                                       ║
 * ║  • No raw HTML elements (use design system components)                        ║
 * ║  • No default Tailwind classes outside design system                          ║
 * ║  • No inline styles                                                           ║
 * ║  • No hardcoded values (colors, spacing, typography)                          ║
 * ║  • No ad-hoc component variations                                             ║
 * ║  • No soft shadows (hard offset only)                                         ║
 * ║  • No thin borders on interactive elements (2px+ required)                    ║
 * ║                                                                               ║
 * ║  ALL UI must go through design system components and tokens.                  ║
 * ║                                                                               ║
 * ║  AESTHETIC PILLARS:                                                           ║
 * ║  • BOLD: Thick borders (2-4px), heavy font weights, high contrast             ║
 * ║  • CONTEMPORARY: Sharp corners on actions, rounded on containers              ║
 * ║  • POP ART: Hard offset shadows, halftone/stripe patterns                     ║
 * ║  • ADVENTURE: Bounce animations, dynamic transforms                           ║
 * ║  • COMIC BOOK: Panel layouts, thick outlines, depth layers                    ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
module.exports = {
  root: true,
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  rules: {
    // ════════════════════════════════════════════════════════════════════
    // DESIGN SYSTEM ENFORCEMENT - ZERO TOLERANCE
    // ════════════════════════════════════════════════════════════════════
    
    // NOTE: Tailwind ESLint plugin removed - our design system uses extensive
    // custom classes that the plugin cannot validate. The design system itself
    // enforces consistency through component APIs and TypeScript types.
    
    // ────────────────────────────────────────────────────────────────────
    // RAW HTML ELEMENT PROHIBITION
    // All UI must use design system components from packages/ui
    // ────────────────────────────────────────────────────────────────────
    "react/forbid-elements": ["error", {
      "forbid": [
        {
          "element": "button",
          "message": "Use <Button> from @ghxstship/ui instead of raw <button>. Import: import { Button } from '@ghxstship/ui';"
        },
        {
          "element": "select",
          "message": "Use <Select> from @ghxstship/ui instead of raw <select>. Import: import { Select } from '@ghxstship/ui';"
        },
        {
          "element": "table",
          "message": "Use <Table> or <DataTable> from @ghxstship/ui instead of raw <table>. Import: import { Table, DataTable } from '@ghxstship/ui';"
        },
        {
          "element": "thead",
          "message": "Use <TableHeader> from @ghxstship/ui instead of raw <thead>. Import: import { TableHeader } from '@ghxstship/ui';"
        },
        {
          "element": "tbody",
          "message": "Use <TableBody> from @ghxstship/ui instead of raw <tbody>. Import: import { TableBody } from '@ghxstship/ui';"
        },
        {
          "element": "tr",
          "message": "Use <TableRow> from @ghxstship/ui instead of raw <tr>. Import: import { TableRow } from '@ghxstship/ui';"
        },
        {
          "element": "th",
          "message": "Use <TableHead> from @ghxstship/ui instead of raw <th>. Import: import { TableHead } from '@ghxstship/ui';"
        },
        {
          "element": "td",
          "message": "Use <TableCell> from @ghxstship/ui instead of raw <td>. Import: import { TableCell } from '@ghxstship/ui';"
        },
        {
          "element": "input",
          "message": "Use <Input>, <Checkbox>, <Radio>, or <Switch> from @ghxstship/ui instead of raw <input>. Import: import { Input, Checkbox, Radio, Switch } from '@ghxstship/ui';"
        },
        {
          "element": "textarea",
          "message": "Use <Textarea> from @ghxstship/ui instead of raw <textarea>. Import: import { Textarea } from '@ghxstship/ui';"
        },
        {
          "element": "label",
          "message": "Use <Label> from @ghxstship/ui instead of raw <label>. Import: import { Label } from '@ghxstship/ui';"
        },
        {
          "element": "a",
          "message": "Use <Link> from @ghxstship/ui or next/link instead of raw <a>. Import: import { Link } from '@ghxstship/ui'; or import Link from 'next/link';"
        },
        {
          "element": "ul",
          "message": "Use <List> from @ghxstship/ui instead of raw <ul>. Import: import { List, ListItem } from '@ghxstship/ui';"
        },
        {
          "element": "ol",
          "message": "Use <List> from @ghxstship/ui instead of raw <ol>. Import: import { List, ListItem } from '@ghxstship/ui';"
        },
        {
          "element": "li",
          "message": "Use <ListItem> from @ghxstship/ui instead of raw <li>. Import: import { ListItem } from '@ghxstship/ui';"
        },
        {
          "element": "h1",
          "message": "Use <H1> from @ghxstship/ui instead of raw <h1>. Import: import { H1 } from '@ghxstship/ui';"
        },
        {
          "element": "h2",
          "message": "Use <H2> from @ghxstship/ui instead of raw <h2>. Import: import { H2 } from '@ghxstship/ui';"
        },
        {
          "element": "h3",
          "message": "Use <H3> from @ghxstship/ui instead of raw <h3>. Import: import { H3 } from '@ghxstship/ui';"
        },
        {
          "element": "h4",
          "message": "Use <H4> from @ghxstship/ui instead of raw <h4>. Import: import { H4 } from '@ghxstship/ui';"
        },
        {
          "element": "h5",
          "message": "Use <H5> from @ghxstship/ui instead of raw <h5>. Import: import { H5 } from '@ghxstship/ui';"
        },
        {
          "element": "h6",
          "message": "Use <H6> from @ghxstship/ui instead of raw <h6>. Import: import { H6 } from '@ghxstship/ui';"
        },
        {
          "element": "p",
          "message": "Use <Body> or <Text> from @ghxstship/ui instead of raw <p>. Import: import { Body, Text } from '@ghxstship/ui';"
        },
        {
          "element": "span",
          "message": "Use <Text> or <Badge> from @ghxstship/ui instead of raw <span>. Import: import { Text, Badge } from '@ghxstship/ui';"
        },
        {
          "element": "form",
          "message": "Use <Form> from @ghxstship/ui instead of raw <form>. Import: import { Form } from '@ghxstship/ui';"
        },
        {
          "element": "img",
          "message": "Use next/image <Image> component instead of raw <img>. Import: import Image from 'next/image';"
        },
        {
          "element": "hr",
          "message": "Use <Divider> from @ghxstship/ui instead of raw <hr>. Import: import { Divider } from '@ghxstship/ui';"
        },
        {
          "element": "div",
          "message": "Use <Box> or <Stack> from @ghxstship/ui instead of raw <div>. For layouts use <Stack direction='horizontal|vertical'>, for containers use <Box>. Import: import { Box, Stack } from '@ghxstship/ui';"
        },
        {
          "element": "section",
          "message": "Use <Section> from @ghxstship/ui instead of raw <section>. Import: import { Section } from '@ghxstship/ui';"
        },
        {
          "element": "article",
          "message": "Use <Card> or <Box as='article'> from @ghxstship/ui instead of raw <article>. Import: import { Card, Box } from '@ghxstship/ui';"
        },
        {
          "element": "aside",
          "message": "Use <Box as='aside'> from @ghxstship/ui instead of raw <aside>. Import: import { Box } from '@ghxstship/ui';"
        },
        {
          "element": "nav",
          "message": "Use <Navigation> or <Box as='nav'> from @ghxstship/ui instead of raw <nav>. Import: import { Navigation, Box } from '@ghxstship/ui';"
        },
        {
          "element": "header",
          "message": "Use <Box as='header'> from @ghxstship/ui instead of raw <header>. Import: import { Box } from '@ghxstship/ui';"
        },
        {
          "element": "footer",
          "message": "Use <Footer> or <Box as='footer'> from @ghxstship/ui instead of raw <footer>. Import: import { Footer, Box } from '@ghxstship/ui';"
        },
        {
          "element": "main",
          "message": "Use <Box as='main'> from @ghxstship/ui instead of raw <main>. Import: import { Box } from '@ghxstship/ui';"
        }
      ]
    }],
    
    // Inline styles - prefer design system tokens but allow for dynamic values
    // Dynamic values like progress bar widths, chart colors, etc. legitimately need inline styles
    "react/forbid-component-props": ["error", {
      "forbid": [
        {
          "propName": "style",
          "message": "Prefer design system className tokens. Inline styles acceptable only for dynamic values (width %, colors from data)."
        }
      ]
    }],
    
    // TypeScript rules - ZERO TOLERANCE
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "@typescript-eslint/no-explicit-any": "error",
    
    // General code quality - ZERO TOLERANCE
    "no-console": ["error", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error",
    "react/jsx-key": "error",
    
    // ════════════════════════════════════════════════════════════════════
    // RAW TAILWIND PROHIBITION - BOLD CONTEMPORARY POP ART ENFORCEMENT
    // ════════════════════════════════════════════════════════════════════
    // 
    // AESTHETIC REQUIREMENTS:
    // • Borders: 2px+ on interactive elements (no 1px borders on buttons/inputs)
    // • Shadows: Hard offset only (no soft/blur shadows)
    // • Radius: Sharp on actions (4px), rounded on containers (8-16px)
    // • Animation: Snappy (100-200ms) with bounce/overshoot
    // 
    // ZERO TOLERANCE - All violations are ERRORS, not warnings.
    // ════════════════════════════════════════════════════════════════════
    "no-restricted-syntax": [
      "error",
      
      // ────────────────────────────────────────────────────────────────
      // PROHIBITED: Raw Tailwind Typography
      // ────────────────────────────────────────────────────────────────
      {
        "selector": "Literal[value=/(?<![a-z-])text-(xs|sm|base|lg|xl)(?![a-z-])/]",
        "message": "❌ PROHIBITED: Raw Tailwind text size. Use design system: text-body-*, text-mono-*, text-h*-*, text-display-*"
      },
      {
        "selector": "Literal[value=/(?<![a-z-])text-[2-9]xl(?![a-z-])/]",
        "message": "❌ PROHIBITED: Raw Tailwind text size. Use design system: text-h*-*, text-display-*"
      },
      {
        "selector": "Literal[value=/(?<![a-z-])font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)(?![a-z-])/]",
        "message": "❌ PROHIBITED: Raw Tailwind font weight. Use design system: font-weight-normal, font-weight-medium, font-weight-semibold, font-weight-bold"
      },
      {
        "selector": "Literal[value=/(?<![a-z-])font-(sans|serif)(?![a-z-])/]",
        "message": "❌ PROHIBITED: Raw Tailwind font family. Use design system: font-display, font-heading, font-body, font-mono, font-code"
      },
      {
        "selector": "Literal[value=/(?<![a-z-])leading-(tight|snug|normal|loose)(?![a-z-])/]",
        "message": "❌ PROHIBITED: Raw Tailwind line height. Use design system: leading-display, leading-heading, leading-body, leading-relaxed, leading-comfortable, leading-none"
      },
      {
        "selector": "Literal[value=/(?<![a-z-])tracking-(tighter|tight|normal|wide|wider|widest)(?![a-z-])/]",
        "message": "❌ PROHIBITED: Raw Tailwind letter spacing. Use design system: tracking-label, tracking-kicker, tracking-display"
      },
      
      // ────────────────────────────────────────────────────────────────
      // PROHIBITED: Raw Tailwind Colors (Default Palette)
      // ────────────────────────────────────────────────────────────────
      {
        "selector": "Literal[value=/(?<![a-z-])(bg|text|border|ring|outline|fill|stroke|from|via|to|divide|placeholder|decoration|accent|caret|shadow)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|sky|blue|rose)-[0-9]+/]",
        "message": "❌ PROHIBITED: Raw Tailwind color. Use design system semantic colors: bg-surface-*, bg-ink-*, text-on-dark-*, text-on-light-*, primary, secondary, accent, success, warning, error, info"
      },
      
      // ────────────────────────────────────────────────────────────────
      // PROHIBITED: Arbitrary Values (Square Brackets)
      // ────────────────────────────────────────────────────────────────
      {
        "selector": "Literal[value=/\\[#[0-9a-fA-F]{3,8}\\]/]",
        "message": "❌ PROHIBITED: Arbitrary hex color. Use design system color tokens."
      },
      {
        "selector": "Literal[value=/\\[rgb(a)?\\(/]",
        "message": "❌ PROHIBITED: Arbitrary RGB color. Use design system color tokens."
      },
      {
        "selector": "Literal[value=/\\[hsl(a)?\\(/]",
        "message": "❌ PROHIBITED: Arbitrary HSL color. Use design system color tokens."
      },
      {
        "selector": "Literal[value=/(?<![a-z-])(w|h|p|m|gap|space|top|right|bottom|left|inset)-\\[[0-9]+(px|rem|em|vh|vw|%)\\]/]",
        "message": "❌ PROHIBITED: Arbitrary spacing/sizing. Use design system: spacing-*, gap-xs/sm/md/lg/xl, p-button, p-card, p-modal"
      },
      {
        "selector": "Literal[value=/rounded-\\[[0-9]+(px|rem)\\]/]",
        "message": "❌ PROHIBITED: Arbitrary border radius. Use design system: rounded-button (4px), rounded-card (8px), rounded-modal (16px), rounded-badge (2px)"
      },
      {
        "selector": "Literal[value=/shadow-\\[/]",
        "message": "❌ PROHIBITED: Arbitrary shadow. Use design system hard offset shadows: shadow-xs, shadow-sm, shadow-md, shadow-lg, shadow-xl, shadow-primary, shadow-accent"
      },
      {
        "selector": "Literal[value=/z-\\[[0-9]+\\]/]",
        "message": "❌ PROHIBITED: Arbitrary z-index. Use design system: z-base, z-dropdown, z-sticky, z-fixed, z-modal, z-popover, z-tooltip"
      },
      
      // ────────────────────────────────────────────────────────────────
      // PROHIBITED: Raw Tailwind Border Radius (Use Design System)
      // ────────────────────────────────────────────────────────────────
      {
        "selector": "Literal[value=/(?<![a-z-])rounded-(sm|md|lg|xl|2xl|3xl|full)(?![a-z-])/]",
        "message": "❌ PROHIBITED: Raw Tailwind border radius. Use design system: rounded-button (4px), rounded-card (8px), rounded-modal (16px), rounded-avatar (full), rounded-badge (2px)"
      },
      
      // ────────────────────────────────────────────────────────────────
      // NOTE: shadow-sm, shadow-md, shadow-lg, shadow-xl are now design system tokens
      // that resolve to hard offset shadows via CSS variables. No longer prohibited.
      // Only shadow-inner remains prohibited as it's not part of the design system.
      // ────────────────────────────────────────────────────────────────
      {
        "selector": "Literal[value=/(?<![a-z-])shadow-inner(?![a-z-])/]",
        "message": "❌ PROHIBITED: Inner shadow not part of design system. Use hard offset shadows: shadow-xs, shadow-sm, shadow-md, shadow-lg, shadow-xl, shadow-primary, shadow-accent"
      },
      
      // ────────────────────────────────────────────────────────────────
      // PROHIBITED: Slow Animations (Use Snappy Durations)
      // Pop Art aesthetic requires snappy, energetic animations
      // ────────────────────────────────────────────────────────────────
      {
        "selector": "Literal[value=/(?<![a-z-])duration-(300|500|700|1000)(?![a-z-])/]",
        "message": "❌ PROHIBITED: Slow animation duration. Pop Art requires SNAPPY animations. Use: duration-instant (50ms), duration-fast (100ms), duration-base (150ms), duration-slow (250ms max)"
      },
      
      // ────────────────────────────────────────────────────────────────
      // PROHIBITED: Thin Borders on Interactive Elements
      // Bold aesthetic requires 2px+ borders on buttons, inputs, cards
      // ────────────────────────────────────────────────────────────────
      {
        "selector": "Literal[value=/(?<![a-z-])border(?![a-z-])/]",
        "message": "⚠️ WARNING: Default border is 1px. For interactive elements (buttons, inputs, cards), use border-2, border-thick, or border-heavy for Bold Pop Art aesthetic."
      },
      
      // ────────────────────────────────────────────────────────────────
      // PROHIBITED: Raw Tailwind Spacing (Use Design System Tokens)
      // ────────────────────────────────────────────────────────────────
      {
        "selector": "Literal[value=/(?<![a-z-])space-y-[0-9]+(?![a-z-])/]",
        "message": "❌ PROHIBITED: Raw Tailwind space-y. Use <Stack gap={N}> component instead. Import: import { Stack } from '@ghxstship/ui';"
      },
      {
        "selector": "Literal[value=/(?<![a-z-])space-x-[0-9]+(?![a-z-])/]",
        "message": "❌ PROHIBITED: Raw Tailwind space-x. Use <Stack direction='horizontal' gap={N}> component instead. Import: import { Stack } from '@ghxstship/ui';"
      },
      {
        "selector": "JSXAttribute[name.name='className'] Literal[value=/^flex$/]",
        "message": "❌ PROHIBITED: Raw Tailwind flex. Use <Stack direction='horizontal'> for flex layouts. Import: import { Stack } from '@ghxstship/ui';"
      },
      {
        "selector": "Literal[value=/^flex-col$/]",
        "message": "❌ PROHIBITED: Raw Tailwind flex-col. Use <Stack> (vertical by default) for flex column layouts. Import: import { Stack } from '@ghxstship/ui';"
      },
      {
        "selector": "Literal[value=/^flex-row$/]",
        "message": "❌ PROHIBITED: Raw Tailwind flex-row. Use <Stack direction='horizontal'> for flex row layouts. Import: import { Stack } from '@ghxstship/ui';"
      },
      {
        "selector": "JSXAttribute[name.name='className'] Literal[value=/(?:^|\\s)grid(?!-cols-7)(?:\\s|$)/]",
        "message": "❌ PROHIBITED: Raw Tailwind grid in className. Use <Grid> component for grid layouts. Import: import { Grid } from '@ghxstship/ui'; (Exception: grid with grid-cols-7 allowed for calendar layouts)"
      },
      {
        "selector": "Literal[value=/^grid-cols-(?!7)[0-9]+$/]",
        "message": "❌ PROHIBITED: Raw Tailwind grid-cols. Use <Grid cols={N}> component. Import: import { Grid } from '@ghxstship/ui'; (Exception: grid-cols-7 allowed for calendar layouts)"
      },
      
      // ────────────────────────────────────────────────────────────────
      // SSOT ENFORCEMENT: Prohibit Local Status Color Definitions
      // All status colors MUST come from @ghxstship/config entity-registry
      // ────────────────────────────────────────────────────────────────
      {
        "selector": "VariableDeclarator[id.name=/^(STATUS_COLORS|statusColors|PAYMENT_COLORS|paymentColors|TYPE_COLORS|typeColors)$/] > ObjectExpression",
        "message": "❌ SSOT VIOLATION: Local status/type color definitions are prohibited. Import from @ghxstship/config: import { EVENT_STATUS_COLORS, ORDER_STATUS_COLORS, DOCUMENT_STATUS_COLORS, FINANCIAL_STATUS_COLORS, CREW_STATUS_COLORS, etc. } from '@ghxstship/config';"
      },
      {
        "selector": "VariableDeclarator[id.name=/STATUS_COLORS$/][init.type='ObjectExpression']",
        "message": "❌ SSOT VIOLATION: Local STATUS_COLORS object definitions are prohibited. Use centralized status colors from @ghxstship/config entity-registry/status-mappings."
      },
      
      // ────────────────────────────────────────────────────────────────
      // SSOT ENFORCEMENT: Prohibit Local Column Definitions in Pages
      // Column definitions should come from entity registry
      // ────────────────────────────────────────────────────────────────
      {
        "selector": "VariableDeclarator[id.name=/^(COLUMNS|columns|TABLE_COLUMNS|tableColumns)$/] > ArrayExpression",
        "message": "⚠️ SSOT WARNING: Consider using getEntityColumns() from @ghxstship/config instead of local column definitions. Import: import { getEntityColumns } from '@ghxstship/config';"
      },
      
      // ────────────────────────────────────────────────────────────────
      // SSOT ENFORCEMENT: Prohibit Local Filter Definitions in Pages
      // Filter definitions should come from entity registry
      // ────────────────────────────────────────────────────────────────
      {
        "selector": "VariableDeclarator[id.name=/^(FILTERS|filters|FILTER_OPTIONS|filterOptions)$/] > ArrayExpression",
        "message": "⚠️ SSOT WARNING: Consider using getEntityFilters() from @ghxstship/config instead of local filter definitions. Import: import { getEntityFilters } from '@ghxstship/config';"
      },
      
      // ────────────────────────────────────────────────────────────────
      // 3NF ENFORCEMENT: Prohibit Direct Table Access for Legend Entities
      // NOTE: This rule is enforced via overrides below to only apply to
      // client-side hooks. API routes are the correct place to access
      // legend_* tables directly with proper authentication/authorization.
      // ────────────────────────────────────────────────────────────────
    ],
    
    // ════════════════════════════════════════════════════════════════════
    // NORMALIZED PAGE LAYOUT ENFORCEMENT - ZERO TOLERANCE
    // ════════════════════════════════════════════════════════════════════
    // 
    // All authenticated pages MUST use normalized layout templates:
    // • ListPage - for data tables/lists
    // • DetailPage - for entity detail views
    // • CreatePage - for create/new forms
    // • EditPage - for edit forms
    // • DashboardPage - for dashboards with sidebar
    // • SettingsHubPage - for settings hub pages
    // • SettingsPageLayout - for settings sub-pages
    // • AuthPage - for authentication pages
    // 
    // ZERO custom inline layouts allowed. All pages must import and use
    // a template from @ghxstship/ui.
    // ════════════════════════════════════════════════════════════════════
    "no-restricted-imports": ["error", {
      "patterns": [
        {
          "group": ["**/foundations/layout"],
          "importNames": ["Container", "Stack"],
          "message": "⚠️ In page.tsx files, prefer using normalized templates (ListPage, DetailPage, CreatePage, EditPage, DashboardPage, SettingsHubPage) from @ghxstship/ui instead of building custom layouts with Container/Stack. Templates ensure consistency and reduce code duplication."
        }
      ]
    }],
    
    // ════════════════════════════════════════════════════════════════════
    // SSOT (SINGLE SOURCE OF TRUTH) ENFORCEMENT - ZERO TOLERANCE
    // ════════════════════════════════════════════════════════════════════
    // 
    // ALL UI configurations MUST come from the centralized entity registry:
    // • Status colors → @ghxstship/config entity-registry/status-mappings
    // • Column definitions → @ghxstship/config entity-registry
    // • Filter options → @ghxstship/config entity-registry
    // • Form fields → @ghxstship/config entity-registry
    // • Formatters → @ghxstship/config formatters
    // 
    // ZERO local hardcoded UI configurations allowed in page files.
    // ════════════════════════════════════════════════════════════════════
    
    // 3NF (Third Normal Form) ENFORCEMENT
    // All database queries MUST use the Legend 3NF schema query builder
    // or properly normalized Supabase queries. No denormalized data access.
    // ════════════════════════════════════════════════════════════════════
    
    // ════════════════════════════════════════════════════════════════════
    // SUPABASE MIGRATIONS - 3NF & SSOT ENFORCEMENT
    // ════════════════════════════════════════════════════════════════════
    // 
    // ALL new Supabase migrations MUST be:
    // 
    // 3NF (Third Normal Form) COMPLIANT:
    // • No transitive dependencies
    // • All non-key attributes depend only on the primary key
    // • No repeating groups or arrays that should be separate tables
    // • Proper foreign key relationships
    // • Junction tables for many-to-many relationships
    // 
    // SSOT (Single Source of Truth) COMPLIANT:
    // • No duplicate data across tables
    // • Each piece of data stored in exactly one place
    // • References via foreign keys, not data duplication
    // • Lookup tables for enumerated values
    // • No denormalized columns that duplicate data from other tables
    // 
    // ZERO TOLERANCE - All violations are ERRORS, not warnings.
    // ════════════════════════════════════════════════════════════════════
  },
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "out/",
    "build/",
    "dist/",
    "*.config.js",
    "*.config.ts",
    ".eslintrc.js",
    ".eslintrc.json",
    "packages/config-tailwind/",
    "packages/config-eslint/",
    "packages/config-postcss/",
    // Style guide preview is exempt (it's documentation)
    "docs/design/STYLE-GUIDE-PREVIEW.jsx"
  ],
  overrides: [
    {
      // Design system UI components can use raw HTML elements internally
      // These are the source of truth for the design system
      files: ["packages/ui/src/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-syntax": "off",
        "react/forbid-elements": "off",
        "react/forbid-component-props": "off",
        "no-restricted-imports": "off"
      }
    },
    {
      // ════════════════════════════════════════════════════════════════════
      // PAGE.TSX FILES - ZERO TOLERANCE FOR CUSTOM LAYOUTS
      // ════════════════════════════════════════════════════════════════════
      // All page.tsx files MUST use normalized templates from @ghxstship/ui.
      // Custom layouts with raw Container/Stack/MainContent are PROHIBITED.
      // 
      // REQUIRED TEMPLATES:
      // • ListPage - for data tables/lists with filtering, pagination
      // • DetailPage - for entity detail views with tabs, sidebar
      // • CreatePage - for create/new forms with sections
      // • EditPage - for edit forms
      // • DashboardPage - for dashboards with sidebar navigation
      // • SettingsHubPage - for settings hub with category cards
      // • SettingsPageLayout - for settings sub-pages
      // • AuthPage - for authentication pages (signin, signup, etc.)
      // • GridLayout - for card grids with filtering
      // • TableLayout - for data tables
      // • WizardPage - for multi-step wizards
      // • CenteredLayout - for centered content (errors, confirmations)
      // • SingleColumnLayout - for article/documentation pages
      // ════════════════════════════════════════════════════════════════════
      files: [
        "apps/*/src/app/(authenticated)/**/page.tsx",
        "apps/*/src/app/(auth)/**/page.tsx",
        "apps/*/src/app/auth/**/page.tsx",
        "apps/*/src/app/admin/**/page.tsx"
      ],
      rules: {
        "no-restricted-imports": ["error", {
          "patterns": [
            {
              "group": ["@ghxstship/ui"],
              "importNames": ["MainContent", "Container", "Stack", "Section", "Grid"],
              "message": "❌ PROHIBITED in page.tsx: Custom layouts with MainContent/Container/Stack/Section/Grid are not allowed. Use normalized templates: ListPage, DetailPage, CreatePage, EditPage, DashboardPage, SettingsHubPage, SettingsPageLayout, AuthPage, GridLayout, TableLayout, WizardPage, CenteredLayout, SingleColumnLayout from @ghxstship/ui"
            }
          ]
        }]
      }
    },
    {
      // Generator components legitimately use dynamic inline styles for:
      // - Color palettes from generated data
      // - Progress bar widths
      // - Dynamic indentation based on hierarchy tiers
      files: [
        "**/app/generator/**/*.tsx",
        "**/app/generator/**/*.ts"
      ],
      rules: {
        "react/forbid-component-props": "off"
      }
    },
    {
      // Config files are exempt
      files: ["*.config.{js,ts,mjs,cjs}", "tailwind.config.*"],
      rules: {
        "no-restricted-syntax": "off"
      }
    },
    {
      // Design documentation is exempt
      files: ["docs/**/*.{js,jsx,ts,tsx}"],
      rules: {
        "no-restricted-syntax": "off"
      }
    },
    {
      // Centralized status-mappings.ts is the SSOT for status colors
      // This file is exempt from the STATUS_COLORS rule since it IS the centralized source
      files: ["packages/config/entity-registry/status-mappings.ts"],
      rules: {
        "no-restricted-syntax": "off"
      }
    },
    {
      // 3NF ENFORCEMENT: Only applies to client-side hooks
      // API routes are the CORRECT place to access legend_* tables directly
      // with proper authentication and authorization
      files: [
        "apps/*/src/hooks/**/*.ts",
        "apps/*/src/hooks/**/*.tsx"
      ],
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            "selector": "CallExpression[callee.property.name='from'] > Literal[value=/^(legend_people|legend_places|legend_organizations|legend_products|legend_events|legend_documents)$/]",
            "message": "⚠️ 3NF VIOLATION: Direct access to legend_* tables in client-side hooks is prohibited. Use API routes instead: fetch('/api/legend/people') or fetch('/api/legend/places'). API routes handle authentication, authorization, and proper 3NF joins."
          }
        ]
      }
    },
    {
      // Entity registry and config package IS the centralized source of truth
      // for status colors, columns, filters - exempt from SSOT violation rules
      files: [
        "packages/config/**/*.ts",
        "packages/config/**/*.tsx"
      ],
      rules: {
        "no-restricted-syntax": "off"
      }
    }
  ]
};
