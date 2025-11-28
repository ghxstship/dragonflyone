# UI Full Rebuild — Bold Contemporary Pop Art Adventure

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   ██████╗ ███████╗██████╗ ██╗   ██╗██╗██╗     ██████╗                        ║
║   ██╔══██╗██╔════╝██╔══██╗██║   ██║██║██║     ██╔══██╗                       ║
║   ██████╔╝█████╗  ██████╔╝██║   ██║██║██║     ██║  ██║                       ║
║   ██╔══██╗██╔══╝  ██╔══██╗██║   ██║██║██║     ██║  ██║                       ║
║   ██║  ██║███████╗██████╔╝╚██████╔╝██║███████╗██████╔╝                       ║
║   ╚═╝  ╚═╝╚══════╝╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝                        ║
║                                                                               ║
║   PRESERVE: Colors + Fonts | REBUILD: Everything Else | DELETE: Nothing      ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

## PRIME DIRECTIVE

**Rebuild the entire UI with a Bold Contemporary Pop Art Adventure aesthetic while preserving ONLY the existing color palette and typography tokens. Replace content IN-PLACE — do NOT delete any files.**

---

## ⚠️ CRITICAL FILE HANDLING RULES

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   🚨 MANDATORY FILE HANDLING PROTOCOL — READ BEFORE PROCEEDING 🚨            ║
║                                                                               ║
║   1. NEVER DELETE ANY FILES                                                   ║
║      • Not even "unused" files                                                ║
║      • Not even "legacy" files                                                ║
║      • Not even files you think are duplicates                                ║
║                                                                               ║
║   2. NEVER RENAME ANY FILES                                                   ║
║      • Keep exact file names                                                  ║
║      • Keep exact file extensions                                             ║
║      • Keep exact casing                                                      ║
║                                                                               ║
║   3. NEVER MOVE FILES TO DIFFERENT DIRECTORIES                                ║
║      • Files stay exactly where they are                                      ║
║      • No reorganizing folder structure                                       ║
║      • No "cleaning up" file locations                                        ║
║                                                                               ║
║   4. OVERWRITE EXISTING FILE CONTENTS ONLY                                    ║
║      • Open existing file                                                     ║
║      • Replace styling/content                                                ║
║      • Save to same location                                                  ║
║                                                                               ║
║   5. ONLY CREATE NEW FILES IF:                                                ║
║      • A required component/utility doesn't exist yet                         ║
║      • Document what you created and why                                      ║
║      • Follow existing naming conventions                                     ║
║                                                                               ║
║   RATIONALE: We cannot afford to re-import components, update import          ║
║   paths, or deal with legacy file cleanup. The rebuild is VISUAL ONLY.        ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

## WHAT TO PRESERVE VS REBUILD

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🔒 PRESERVE — DO NOT MODIFY THESE                                           ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                              ┃
┃  Colors:                                                                     ┃
┃  • Primary: #6366f1 (Indigo)                                                 ┃
┃  • Secondary: #8b5cf6 (Violet)                                               ┃
┃  • Accent: #f59e0b (Amber)                                                   ┃
┃  • Destructive: #ef4444 (Red)                                                ┃
┃  • Success: #22c55e (Green)                                                  ┃
┃  • Warning: #f59e0b (Amber)                                                  ┃
┃  • Error: #ef4444 (Red)                                                      ┃
┃  • Info: #3b82f6 (Blue)                                                      ┃
┃  • Neutral scale: 950→100 grayscale                                          ┃
┃  • All semantic color tokens (background, foreground, card, popover, etc.)   ┃
┃                                                                              ┃
┃  Typography:                                                                 ┃
┃  • Font family tokens (primary, secondary, mono)                             ┃
┃  • Font family CSS variables                                                 ┃
┃  • Font imports/declarations                                                 ┃
┃                                                                              ┃
┃  Structure:                                                                  ┃
┃  • All file names and paths                                                  ┃
┃  • All export names                                                          ┃
┃  • All import statements                                                     ┃
┃  • Component prop interfaces/types                                           ┃
┃  • Component function signatures                                             ┃
┃                                                                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🔄 REBUILD — REPLACE THESE IN-PLACE                                         ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                              ┃
┃  Tokens (in globals.css + tailwind.config.ts):                               ┃
┃  • Border radius scale                                                       ┃
┃  • Shadow scale                                                              ┃
┃  • Border width scale                                                        ┃
┃  • Spacing scale (component-specific)                                        ┃
┃  • Animation/transition tokens                                               ┃
┃                                                                              ┃
┃  Component Styling (className values inside components):                     ┃
┃  • All Tailwind class combinations                                           ┃
┃  • All CVA variant definitions                                               ┃
┃  • All hover/focus/active states                                             ┃
┃  • All transition/animation classes                                          ┃
┃                                                                              ┃
┃  Global Styles (in globals.css):                                             ┃
┃  • Background pattern utility classes                                        ┃
┃  • Animation keyframes                                                       ┃
┃  • Utility animation classes                                                 ┃
┃                                                                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## THE GHXSTSHIP AESTHETIC

### Style Definition: Bold Contemporary Pop Art Adventure

| Style Pillar | Description | Visual Expression |
|--------------|-------------|-------------------|
| **BOLD** | High contrast, strong visual weight, commanding presence | Thick borders (2-4px), heavy font weights, high contrast colors |
| **CONTEMPORARY** | Clean lines meets dynamic energy, modern without sterile | Sharp corners on actions, rounded on containers, minimal decoration |
| **POP ART** | Halftone patterns, comic elements, Ben-Day dots, dramatic shadows | Hard offset shadows, dot/stripe patterns, speech-bubble tooltips |
| **ADVENTURE** | Motion, energy, discovery, sense of movement | Diagonal accents, dynamic angles, bounce animations |
| **COMIC BOOK** | Panel layouts, thick borders, action lines, dramatic emphasis | Card = panel, borders = outlines, shadows = depth layers |

---

## STYLE GUIDE — COMPLETE SPECIFICATIONS

### 1. COLOR SYSTEM (PRESERVE — Reference Only)

```
BRAND COLORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Primary       #6366f1    Main brand, CTAs, links
Secondary     #8b5cf6    Supporting accent
Accent        #f59e0b    Highlights, badges, warnings
Destructive   #ef4444    Errors, delete actions

STATUS COLORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Success       #22c55e    Confirmations, positive states
Warning       #f59e0b    Cautions, attention needed
Error         #ef4444    Errors, failures
Info          #3b82f6    Information, neutral alerts

NEUTRAL SCALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
950           #0a0a0a    Darkest (dark mode bg)
900           #171717    Dark backgrounds
800           #262626    Dark surfaces
700           #404040    Dark borders
600           #525252    Muted text (dark)
500           #737373    Muted elements
400           #a3a3a3    Muted text (light)
300           #d4d4d4    Light borders
200           #e5e5e5    Light surfaces
100           #f5f5f5    Lightest (light mode bg)
```

### 2. TYPOGRAPHY SYSTEM (PRESERVE — Reference Only)

```
FONT FAMILIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Primary       ANTON / BEBAS NEUE       Display, headings
Secondary     Share Tech / Inter        Body, UI elements
Mono          JetBrains Mono           Code, data

TYPE SCALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Display       48-72px    Black (900)    -0.025em    Hero headlines
H1            36-48px    Black (900)    -0.025em    Page titles
H2            28-36px    Bold (700)     -0.02em     Section headers
H3            22-24px    Bold (700)     -0.015em    Card titles
H4            18-20px    Semibold (600) -0.01em     Subsections
Body          16px       Regular (400)  0           Paragraphs
Small         14px       Medium (500)   0           Secondary text
XSmall        12px       Medium (500)   0.05em      Labels, badges

TEXT TREATMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Headings: UPPERCASE, tight tracking
• Body: Sentence case, normal tracking
• Labels/Badges: UPPERCASE, wide tracking
• Buttons: UPPERCASE, wide tracking
```

### 3. SPACING SYSTEM (REBUILD)

```css
/* Add/update in globals.css */
:root {
  /* Base scale (4px unit) */
  --spacing-0: 0px;
  --spacing-1: 4px;      /* 0.25rem - micro */
  --spacing-2: 8px;      /* 0.5rem - tight */
  --spacing-3: 12px;     /* 0.75rem - compact */
  --spacing-4: 16px;     /* 1rem - base */
  --spacing-5: 20px;     /* 1.25rem - comfortable */
  --spacing-6: 24px;     /* 1.5rem - relaxed */
  --spacing-8: 32px;     /* 2rem - spacious */
  --spacing-10: 40px;    /* 2.5rem - airy */
  --spacing-12: 48px;    /* 3rem - section gap */
  --spacing-16: 64px;    /* 4rem - section padding */
  --spacing-20: 80px;    /* 5rem - large section */
  --spacing-24: 96px;    /* 6rem - page section */
  
  /* Component-specific */
  --spacing-button-x: 24px;
  --spacing-button-y: 12px;
  --spacing-button-sm-x: 16px;
  --spacing-button-sm-y: 8px;
  --spacing-button-lg-x: 32px;
  --spacing-button-lg-y: 16px;
  --spacing-input-x: 16px;
  --spacing-input-y: 12px;
  --spacing-card: 24px;
  --spacing-card-header: 20px;
  --spacing-modal: 32px;
  --spacing-section: 64px;
  --spacing-page: 96px;
}
```

### 4. BORDER RADIUS SYSTEM (REBUILD)

```css
/* Add/update in globals.css */
:root {
  --radius-none: 0px;
  --radius-sm: 2px;        /* Subtle rounding */
  --radius-DEFAULT: 4px;   /* Default interactive */
  --radius-md: 6px;        /* Medium elements */
  --radius-lg: 8px;        /* Cards, panels */
  --radius-xl: 12px;       /* Large cards */
  --radius-2xl: 16px;      /* Modals, feature cards */
  --radius-3xl: 24px;      /* Hero elements */
  --radius-full: 9999px;   /* Pills, avatars */
  
  /* Component-specific */
  --radius-button: 4px;    /* Sharp, bold action */
  --radius-input: 4px;     /* Matches buttons */
  --radius-card: 8px;      /* Panel aesthetic */
  --radius-modal: 16px;    /* Contained, prominent */
  --radius-badge: 2px;     /* Label-like, sharp */
  --radius-avatar: 9999px; /* Always circular */
  --radius-tooltip: 4px;   /* Speech bubble */
}
```

### 5. SHADOW SYSTEM (REBUILD — Hard Offset Style)

```css
/* Add/update in globals.css */
:root {
  --shadow-none: none;
  
  /* Hard offset shadows - COMIC PANEL STYLE */
  --shadow-xs: 2px 2px 0 hsl(var(--foreground) / 0.1);
  --shadow-sm: 3px 3px 0 hsl(var(--foreground) / 0.15);
  --shadow-DEFAULT: 4px 4px 0 hsl(var(--foreground) / 0.15);
  --shadow-md: 4px 4px 0 hsl(var(--foreground) / 0.2);
  --shadow-lg: 6px 6px 0 hsl(var(--foreground) / 0.2);
  --shadow-xl: 8px 8px 0 hsl(var(--foreground) / 0.25);
  --shadow-2xl: 12px 12px 0 hsl(var(--foreground) / 0.3);
  
  /* Accent shadows - POP ART */
  --shadow-primary: 4px 4px 0 hsl(var(--primary));
  --shadow-accent: 4px 4px 0 hsl(var(--accent));
  
  /* State shadows */
  --shadow-hover: 6px 6px 0 hsl(var(--foreground) / 0.2);
  --shadow-active: 1px 1px 0 hsl(var(--foreground) / 0.15);
  --shadow-focus: 0 0 0 3px hsl(var(--ring) / 0.5);
  --shadow-inset: inset 2px 2px 0 hsl(var(--foreground) / 0.1);
}

.dark {
  --shadow-xs: 2px 2px 0 hsl(var(--foreground) / 0.15);
  --shadow-sm: 3px 3px 0 hsl(var(--foreground) / 0.2);
  --shadow-DEFAULT: 4px 4px 0 hsl(var(--foreground) / 0.2);
  --shadow-md: 4px 4px 0 hsl(var(--foreground) / 0.25);
  --shadow-lg: 6px 6px 0 hsl(var(--foreground) / 0.25);
  --shadow-xl: 8px 8px 0 hsl(var(--foreground) / 0.3);
  --shadow-2xl: 12px 12px 0 hsl(var(--foreground) / 0.35);
}
```

### 6. BORDER WIDTH SYSTEM (REBUILD)

```css
/* Add/update in globals.css */
:root {
  --border-none: 0px;
  --border-thin: 1px;      /* Subtle dividers only */
  --border-DEFAULT: 2px;   /* Standard - BOLD DEFAULT */
  --border-thick: 3px;     /* Emphasis */
  --border-heavy: 4px;     /* Maximum impact, modals */
}
```

### 7. ANIMATION SYSTEM (REBUILD)

```css
/* Add/update in globals.css */
:root {
  /* Durations - SNAPPY */
  --duration-instant: 50ms;
  --duration-fast: 100ms;
  --duration-DEFAULT: 150ms;
  --duration-normal: 150ms;
  --duration-slow: 250ms;
  --duration-slower: 400ms;
  
  /* Easings - WITH CHARACTER */
  --ease-DEFAULT: cubic-bezier(0.2, 0, 0.2, 1);
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-snap: cubic-bezier(0.68, -0.6, 0.32, 1.6);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.1);
}

/* KEYFRAME ANIMATIONS */
@keyframes pop-in {
  0% { opacity: 0; transform: scale(0.9) translateY(10px); }
  50% { transform: scale(1.02) translateY(-2px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes slide-up-bounce {
  0% { opacity: 0; transform: translateY(20px); }
  60% { transform: translateY(-5px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px) rotate(-1deg); }
  40% { transform: translateX(4px) rotate(1deg); }
  60% { transform: translateX(-4px) rotate(-1deg); }
  80% { transform: translateX(4px) rotate(1deg); }
}

@keyframes pulse-shadow {
  0%, 100% { box-shadow: 4px 4px 0 hsl(var(--primary)); }
  50% { box-shadow: 6px 6px 0 hsl(var(--primary)), 8px 8px 0 hsl(var(--primary) / 0.3); }
}

@keyframes comic-appear {
  0% { opacity: 0; transform: scale(0.5) rotate(-5deg); }
  60% { transform: scale(1.1) rotate(2deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}

/* UTILITY CLASSES */
.animate-pop-in { animation: pop-in 0.3s var(--ease-bounce) forwards; }
.animate-slide-up-bounce { animation: slide-up-bounce 0.4s var(--ease-bounce) forwards; }
.animate-shake { animation: shake 0.5s ease-in-out; }
.animate-pulse-shadow { animation: pulse-shadow 2s ease-in-out infinite; }
.animate-comic-appear { animation: comic-appear 0.4s var(--ease-bounce) forwards; }

/* STAGGER DELAYS */
.stagger-1 { animation-delay: 50ms; }
.stagger-2 { animation-delay: 100ms; }
.stagger-3 { animation-delay: 150ms; }
.stagger-4 { animation-delay: 200ms; }
.stagger-5 { animation-delay: 250ms; }
.stagger-6 { animation-delay: 300ms; }
.stagger-7 { animation-delay: 350ms; }
.stagger-8 { animation-delay: 400ms; }
```

### 8. BACKGROUND PATTERNS (ADD TO globals.css)

```css
/* ═══════════════════════════════════════════════════════════════════════════
   POP ART BACKGROUND PATTERNS
   ═══════════════════════════════════════════════════════════════════════════ */

/* Halftone Dots - Classic Pop Art */
.bg-halftone {
  background-image: radial-gradient(circle, hsl(var(--foreground) / 0.1) 1px, transparent 1px);
  background-size: 8px 8px;
}
.bg-halftone-lg {
  background-image: radial-gradient(circle, hsl(var(--foreground) / 0.1) 2px, transparent 2px);
  background-size: 16px 16px;
}

/* Diagonal Stripes */
.bg-stripes {
  background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, hsl(var(--foreground) / 0.03) 10px, hsl(var(--foreground) / 0.03) 20px);
}
.bg-stripes-bold {
  background-image: repeating-linear-gradient(45deg, transparent, transparent 8px, hsl(var(--foreground) / 0.06) 8px, hsl(var(--foreground) / 0.06) 16px);
}

/* Grid Pattern */
.bg-grid {
  background-image: linear-gradient(hsl(var(--foreground) / 0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.05) 1px, transparent 1px);
  background-size: 24px 24px;
}
.bg-grid-lg {
  background-image: linear-gradient(hsl(var(--foreground) / 0.03) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.03) 1px, transparent 1px);
  background-size: 48px 48px;
}

/* Ben-Day Dots - Pop Art Classic */
.bg-benday {
  background-image: radial-gradient(hsl(var(--primary) / 0.15) 20%, transparent 20%);
  background-size: 12px 12px;
}

/* Cross Hatch */
.bg-crosshatch {
  background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, hsl(var(--foreground) / 0.02) 10px, hsl(var(--foreground) / 0.02) 11px), repeating-linear-gradient(-45deg, transparent, transparent 10px, hsl(var(--foreground) / 0.02) 10px, hsl(var(--foreground) / 0.02) 11px);
}

/* Speed Lines */
.bg-speed-lines {
  background-image: repeating-linear-gradient(90deg, transparent, transparent 4px, hsl(var(--foreground) / 0.02) 4px, hsl(var(--foreground) / 0.02) 5px);
}

/* Action Lines - Radial Burst */
.bg-action-lines {
  background-image: repeating-conic-gradient(from 0deg, transparent 0deg 5deg, hsl(var(--foreground) / 0.02) 5deg 10deg);
}
```

---

## COMPONENT SPECIFICATIONS

### BUTTONS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ BUTTON COMPONENT                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Base Treatment:                                                             │
│ • Border: 2px solid                                                         │
│ • Border Radius: 4px (--radius-button)                                      │
│ • Shadow: 3px 3px 0 (hard offset)                                           │
│ • Font: Bold, uppercase, tracking-wide                                      │
│ • Transition: 100ms with bounce easing                                      │
│                                                                             │
│ Hover State:                                                                │
│ • Transform: translate(-2px, -2px)                                          │
│ • Shadow: 5px 5px 0 (elevated)                                              │
│                                                                             │
│ Active/Pressed State:                                                       │
│ • Transform: translate(1px, 1px)                                            │
│ • Shadow: 1px 1px 0 (pressed)                                               │
│                                                                             │
│ Variants:                                                                   │
│ • default: bg-primary, border-primary                                       │
│ • secondary: bg-secondary, border-secondary                                 │
│ • outline: bg-transparent, border-foreground, hover inverts                 │
│ • ghost: no border, no shadow, subtle hover bg                              │
│ • destructive: bg-destructive, border-destructive                           │
│ • pop: border-4, accent shadow, inverts on hover                            │
│                                                                             │
│ Sizes:                                                                      │
│ • sm: h-9, px-4, text-xs                                                    │
│ • default: h-11, px-6, text-sm                                              │
│ • lg: h-13, px-8, text-base                                                 │
│ • xl: h-15, px-10, text-lg                                                  │
│ • icon: h-11, w-11                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### INPUTS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ INPUT COMPONENT                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Base Treatment:                                                             │
│ • Height: 44px (h-11)                                                       │
│ • Border: 2px solid border-input                                            │
│ • Border Radius: 4px (--radius-input)                                       │
│ • Shadow: 2px 2px 0 (subtle offset)                                         │
│ • Padding: 16px horizontal, 12px vertical                                   │
│ • Font: Medium weight                                                       │
│                                                                             │
│ Focus State:                                                                │
│ • Border: primary color                                                     │
│ • Shadow: 3px 3px 0 with primary tint                                       │
│ • Transform: translate(-1px, -1px)                                          │
│                                                                             │
│ Error State:                                                                │
│ • Border: destructive color                                                 │
│ • Shadow: 2px 2px 0 with destructive tint                                   │
│                                                                             │
│ Disabled State:                                                             │
│ • Opacity: 50%                                                              │
│ • Cursor: not-allowed                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### CARDS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CARD COMPONENT                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Base Treatment (Comic Panel Style):                                         │
│ • Background: bg-card                                                       │
│ • Border: 2px solid border                                                  │
│ • Border Radius: 8px (--radius-card)                                        │
│ • Shadow: 4px 4px 0 (panel depth)                                           │
│                                                                             │
│ Hover State:                                                                │
│ • Shadow: 6px 6px 0                                                         │
│ • Transform: translate(-1px, -1px)                                          │
│ • Transition: 150ms with bounce                                             │
│                                                                             │
│ CardHeader:                                                                 │
│ • Padding: 20-24px                                                          │
│ • Border Bottom: 2px solid border                                           │
│                                                                             │
│ CardTitle:                                                                  │
│ • Font: Bold, uppercase, tight tracking                                     │
│ • Size: text-lg to text-xl                                                  │
│                                                                             │
│ CardContent:                                                                │
│ • Padding: 20-24px                                                          │
│                                                                             │
│ Pop Art Variant:                                                            │
│ • Border: 4px solid foreground                                              │
│ • Shadow: 6px 6px 0 primary (colored shadow)                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### BADGES

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ BADGE COMPONENT                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Base Treatment (Label Style):                                               │
│ • Padding: 4px 12px                                                         │
│ • Border: 2px solid                                                         │
│ • Border Radius: 2px (--radius-badge) - SHARP                               │
│ • Font: Bold, xs, uppercase, tracking-wider                                 │
│                                                                             │
│ Variants:                                                                   │
│ • default: bg-primary, text-primary-foreground                              │
│ • secondary: bg-secondary, text-secondary-foreground                        │
│ • outline: bg-transparent, border-foreground                                │
│ • destructive: bg-destructive, text-destructive-foreground                  │
│ • success: bg-success, text-white                                           │
│ • pop: bg-background, border-foreground, shadow-[2px_2px_0_primary]         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### MODALS/DIALOGS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ DIALOG/MODAL COMPONENT                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Overlay:                                                                    │
│ • Background: bg-background/80 with backdrop-blur-sm                        │
│ • Pattern: bg-halftone (optional)                                           │
│                                                                             │
│ Content Panel:                                                              │
│ • Border: 4px solid foreground (HEAVY)                                      │
│ • Border Radius: 16px (--radius-modal)                                      │
│ • Shadow: 8px 8px 0 (prominent)                                             │
│ • Padding: 32px                                                             │
│                                                                             │
│ Close Button:                                                               │
│ • Position: absolute top-4 right-4                                          │
│ • Size: 32x32px                                                             │
│ • Border: 2px solid foreground                                              │
│ • Shadow: 2px 2px 0                                                         │
│ • Hover: invert colors, elevate                                             │
│                                                                             │
│ Animation:                                                                  │
│ • Enter: fade-in + zoom-in-95 + slide-in-from-top                           │
│ • Exit: fade-out + zoom-out-95                                              │
│ • Duration: 200ms                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### TOOLTIPS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TOOLTIP COMPONENT                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Base Treatment (Speech Bubble Style):                                       │
│ • Background: foreground color (inverted)                                   │
│ • Text: background color                                                    │
│ • Border: 2px solid foreground                                              │
│ • Border Radius: 4px                                                        │
│ • Shadow: 3px 3px 0 primary (accent shadow)                                 │
│ • Padding: 8px 16px                                                         │
│ • Font: Medium weight, text-sm                                              │
│                                                                             │
│ Animation:                                                                  │
│ • Enter: fade-in + zoom-in-95 + slide from edge                             │
│ • Duration: 150ms                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## INSPIRATION SOURCES

### Unation (unation.com) — Consumer Discovery
**Apply to:** GVTEWAY consumer pages
- Event card treatments with bold imagery
- Category navigation with icons
- Search with filter pills
- Mobile-first card layouts
- Social proof elements

### Tixr (tixr.com) — Consumer Ticketing
**Apply to:** GVTEWAY event + purchase flows
- Event page hero treatments
- Ticket selection UI
- Countdown/urgency elements
- Checkout flow clarity

### Easol (easol.com) — Creator Marketing
**Apply to:** ATLVS + COMPVSS public pages
- Marketing page storytelling
- Feature showcase layouts
- Testimonial treatments
- Pricing tables

### ClickUp (clickup.com) — Authenticated Dashboards
**Apply to:** ATLVS + COMPVSS app interfaces
- Sidebar navigation
- Data table treatments
- Card-based dashboards
- Empty state designs
- Command palette UX

---

## EXECUTION CHECKLIST

### Phase 1: Token Updates (globals.css + tailwind.config.ts)

```
[ ] Add/update --radius-* variables
[ ] Add/update --shadow-* variables (hard offset style)
[ ] Add/update --border-* variables
[ ] Add/update --spacing-* variables
[ ] Add/update --duration-* and --ease-* variables
[ ] Add background pattern utility classes
[ ] Add animation keyframes
[ ] Add animation utility classes
[ ] Add stagger delay utilities
[ ] Update tailwind.config.ts to reference CSS variables
```

### Phase 2: Core Component Updates (components/ui/)

```
[ ] button.tsx — bold borders, hard shadows, bounce hover
[ ] input.tsx — thick borders, focus lift effect
[ ] textarea.tsx — matches input treatment
[ ] select.tsx — matches input treatment
[ ] checkbox.tsx — bold checkmark, thick border
[ ] radio.tsx — bold selection indicator
[ ] switch.tsx — chunky toggle, satisfying motion
[ ] card.tsx — comic panel style, hard shadow
[ ] badge.tsx — label style, sharp corners
[ ] dialog.tsx — heavy border, prominent shadow
[ ] alert-dialog.tsx — matches dialog
[ ] sheet.tsx — matches dialog treatment
[ ] popover.tsx — speech bubble style
[ ] tooltip.tsx — speech bubble, accent shadow
[ ] dropdown-menu.tsx — panel style
[ ] tabs.tsx — bold underlines/indicators
[ ] alert.tsx — panel style with icon emphasis
[ ] toast.tsx — slide + bounce animation
[ ] progress.tsx — bold track and indicator
[ ] slider.tsx — chunky thumb, thick track
[ ] avatar.tsx — bold border option
[ ] separator.tsx — 2px default weight
```

### Phase 3: Layout Components

```
[ ] Sidebar — bold navigation, thick dividers
[ ] Header — strong presence, clear hierarchy
[ ] Footer — substantial weight
[ ] Container — proper max-widths
[ ] Section wrappers — generous spacing
```

### Phase 4: Page Templates

```
[ ] Auth pages — centered cards, pattern backgrounds
[ ] Dashboard layouts — dense but breathing grids
[ ] List views — bold headers, clear row separation
[ ] Detail pages — hero + content structure
[ ] Empty states — illustrated, encouraging
```

### Phase 5: Verification

```
[ ] All components use design system tokens (no raw values)
[ ] All borders are 2px+ on interactive elements
[ ] All shadows are hard offset style
[ ] All hover states have transform + shadow change
[ ] All focus states are clearly visible
[ ] Animations are snappy (100-200ms)
[ ] Dark mode fully functional
[ ] Theme toggle works correctly
[ ] No deleted files
[ ] All imports still work
```

---

## PASS/FAIL CRITERIA

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║  REBUILD PASSING STANDARD                                                     ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  FILE HANDLING                                                                ║
║  ✅ Zero files deleted                                                        ║
║  ✅ Zero files renamed                                                        ║
║  ✅ Zero files moved                                                          ║
║  ✅ All imports continue to work                                              ║
║                                                                               ║
║  PRESERVATION                                                                 ║
║  ✅ All color tokens unchanged                                                ║
║  ✅ All font tokens unchanged                                                 ║
║  ✅ All component prop interfaces unchanged                                   ║
║  ✅ All export names unchanged                                                ║
║                                                                               ║
║  AESTHETIC                                                                    ║
║  ✅ Bold Contemporary Pop Art Adventure achieved                              ║
║  ✅ Hard/offset shadows on all elevated elements                              ║
║  ✅ Thick borders (2-4px) on interactive elements                             ║
║  ✅ Snappy animations with bounce/overshoot                                   ║
║  ✅ Background patterns available                                             ║
║  ✅ Consistent visual language across all components                          ║
║                                                                               ║
║  FUNCTIONALITY                                                                ║
║  ✅ Dark mode fully functional                                                ║
║  ✅ All hover/focus/active states work                                        ║
║  ✅ All animations perform smoothly                                           ║
║  ✅ No console errors                                                         ║
║                                                                               ║
║  ───────────────────────────────────────────────────────────────────────────  ║
║                                                                               ║
║  ❌ AUTOMATIC FAIL CONDITIONS:                                                ║
║  • Any file deleted                                                           ║
║  • Any color token modified                                                   ║
║  • Any font token modified                                                    ║
║  • Any import path broken                                                     ║
║  • Inconsistent styling between components                                    ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

## REMEMBER

> **This is a VISUAL REBUILD, not a structural refactor.**
> 
> Keep the bones. Transform the skin.
> 
> The result should feel like a completely new UI while maintaining 100% backwards compatibility.
> 
> **DO NOT DELETE ANY FILES. OVERWRITE CONTENT ONLY.**
