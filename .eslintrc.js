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
    
    // Inline styles warning - prefer design system tokens but allow for dynamic values
    // Dynamic values like progress bar widths, chart colors, etc. legitimately need inline styles
    "react/forbid-component-props": ["warn", {
      "forbid": [
        {
          "propName": "style",
          "message": "Prefer design system className tokens. Inline styles acceptable only for dynamic values (width %, colors from data)."
        }
      ]
    }],
    
    // TypeScript rules
    "@typescript-eslint/no-unused-vars": ["warn", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "@typescript-eslint/no-explicit-any": "warn",
    
    // General code quality
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "warn",
    "no-var": "error",
    "react/jsx-key": "warn",
    
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
    // Set to "warn" during transition period. Raw HTML elements are blocked by react/forbid-elements.
    // ════════════════════════════════════════════════════════════════════
    "no-restricted-syntax": [
      "warn",
      
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
        "selector": "Literal[value=/^flex$/]",
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
        "selector": "Literal[value=/^grid$/]",
        "message": "❌ PROHIBITED: Raw Tailwind grid. Use <Grid> component for grid layouts. Import: import { Grid } from '@ghxstship/ui';"
      },
      {
        "selector": "Literal[value=/^grid-cols-[0-9]+$/]",
        "message": "❌ PROHIBITED: Raw Tailwind grid-cols. Use <Grid cols={N}> component. Import: import { Grid } from '@ghxstship/ui';"
      }
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
    }]
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
    }
  ]
};
