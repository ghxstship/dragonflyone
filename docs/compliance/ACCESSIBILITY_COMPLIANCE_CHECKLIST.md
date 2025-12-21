# Accessibility Compliance Checklist

## GHXSTSHIP Industries - WCAG 2.1 AA Compliance

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Target Standard:** WCAG 2.1 Level AA  
**Applicable Regulations:** ADA, EAA, AODA, Section 508

---

## 1. Overview

This checklist ensures GHXSTSHIP platforms (ATLVS, COMPVSS, GVTEWAY) meet WCAG 2.1 Level AA accessibility standards, complying with:

- **Americans with Disabilities Act (ADA)** - United States
- **European Accessibility Act (EAA)** - European Union
- **Accessibility for Ontarians with Disabilities Act (AODA)** - Canada
- **Section 508** - US Federal requirements

---

## 2. WCAG 2.1 Principles

### 2.1 Perceivable

Information and UI components must be presentable in ways users can perceive.

#### 1.1 Text Alternatives

| Criterion | Level | Status | Notes |
|-----------|-------|--------|-------|
| 1.1.1 Non-text Content | A | [ ] Pass [ ] Fail [ ] N/A | All images have alt text |

**Implementation Checklist:**
- [ ] All `<img>` elements have meaningful `alt` attributes
- [ ] Decorative images use `alt=""` or `role="presentation"`
- [ ] Icons have accessible labels (`aria-label` or visually hidden text)
- [ ] Complex images have extended descriptions
- [ ] Charts/graphs have text alternatives
- [ ] CAPTCHAs have audio alternatives

#### 1.2 Time-based Media

| Criterion | Level | Status | Notes |
|-----------|-------|--------|-------|
| 1.2.1 Audio-only/Video-only | A | [ ] Pass [ ] Fail [ ] N/A | |
| 1.2.2 Captions (Prerecorded) | A | [ ] Pass [ ] Fail [ ] N/A | |
| 1.2.3 Audio Description | A | [ ] Pass [ ] Fail [ ] N/A | |
| 1.2.4 Captions (Live) | AA | [ ] Pass [ ] Fail [ ] N/A | |
| 1.2.5 Audio Description (Prerecorded) | AA | [ ] Pass [ ] Fail [ ] N/A | |

**Implementation Checklist:**
- [ ] Videos have captions
- [ ] Audio content has transcripts
- [ ] Live streams have real-time captions (where applicable)

#### 1.3 Adaptable

| Criterion | Level | Status | Notes |
|-----------|-------|--------|-------|
| 1.3.1 Info and Relationships | A | [ ] Pass [ ] Fail [ ] N/A | |
| 1.3.2 Meaningful Sequence | A | [ ] Pass [ ] Fail [ ] N/A | |
| 1.3.3 Sensory Characteristics | A | [ ] Pass [ ] Fail [ ] N/A | |
| 1.3.4 Orientation | AA | [ ] Pass [ ] Fail [ ] N/A | |
| 1.3.5 Identify Input Purpose | AA | [ ] Pass [ ] Fail [ ] N/A | |

**Implementation Checklist:**
- [ ] Semantic HTML used (`<header>`, `<nav>`, `<main>`, `<footer>`)
- [ ] Headings follow logical hierarchy (h1 → h2 → h3)
- [ ] Lists use proper `<ul>`, `<ol>`, `<dl>` elements
- [ ] Tables have proper headers and scope
- [ ] Form inputs have associated labels
- [ ] ARIA landmarks used appropriately
- [ ] Content works in portrait and landscape
- [ ] Input fields have `autocomplete` attributes

#### 1.4 Distinguishable

| Criterion | Level | Status | Notes |
|-----------|-------|--------|-------|
| 1.4.1 Use of Color | A | [ ] Pass [ ] Fail [ ] N/A | |
| 1.4.2 Audio Control | A | [ ] Pass [ ] Fail [ ] N/A | |
| 1.4.3 Contrast (Minimum) | AA | [ ] Pass [ ] Fail [ ] N/A | 4.5:1 for text |
| 1.4.4 Resize Text | AA | [ ] Pass [ ] Fail [ ] N/A | 200% zoom |
| 1.4.5 Images of Text | AA | [ ] Pass [ ] Fail [ ] N/A | |
| 1.4.10 Reflow | AA | [ ] Pass [ ] Fail [ ] N/A | 320px width |
| 1.4.11 Non-text Contrast | AA | [ ] Pass [ ] Fail [ ] N/A | 3:1 for UI |
| 1.4.12 Text Spacing | AA | [ ] Pass [ ] Fail [ ] N/A | |
| 1.4.13 Content on Hover/Focus | AA | [ ] Pass [ ] Fail [ ] N/A | |

**Implementation Checklist:**
- [ ] Color is not the only means of conveying information
- [ ] Text contrast ratio ≥ 4.5:1 (normal text)
- [ ] Text contrast ratio ≥ 3:1 (large text, 18pt+)
- [ ] UI component contrast ratio ≥ 3:1
- [ ] Page is usable at 200% zoom
- [ ] No horizontal scrolling at 320px width
- [ ] Text spacing can be adjusted without loss of content
- [ ] Tooltips/popovers are dismissible and hoverable

---

### 2.2 Operable

UI components and navigation must be operable.

#### 2.1 Keyboard Accessible

| Criterion | Level | Status | Notes |
|-----------|-------|--------|-------|
| 2.1.1 Keyboard | A | [ ] Pass [ ] Fail [ ] N/A | |
| 2.1.2 No Keyboard Trap | A | [ ] Pass [ ] Fail [ ] N/A | |
| 2.1.4 Character Key Shortcuts | A | [ ] Pass [ ] Fail [ ] N/A | |

**Implementation Checklist:**
- [ ] All functionality available via keyboard
- [ ] Tab order follows logical reading order
- [ ] Focus is never trapped in a component
- [ ] Skip links provided for main content
- [ ] Custom widgets have proper keyboard support
- [ ] Single-key shortcuts can be disabled/remapped

#### 2.2 Enough Time

| Criterion | Level | Status | Notes |
|-----------|-------|--------|-------|
| 2.2.1 Timing Adjustable | A | [ ] Pass [ ] Fail [ ] N/A | |
| 2.2.2 Pause, Stop, Hide | A | [ ] Pass [ ] Fail [ ] N/A | |

**Implementation Checklist:**
- [ ] Session timeouts can be extended
- [ ] Users warned before timeout
- [ ] Auto-updating content can be paused
- [ ] Carousels have pause controls

#### 2.3 Seizures and Physical Reactions

| Criterion | Level | Status | Notes |
|-----------|-------|--------|-------|
| 2.3.1 Three Flashes or Below | A | [ ] Pass [ ] Fail [ ] N/A | |

**Implementation Checklist:**
- [ ] No content flashes more than 3 times per second
- [ ] Animations respect `prefers-reduced-motion`

#### 2.4 Navigable

| Criterion | Level | Status | Notes |
|-----------|-------|--------|-------|
| 2.4.1 Bypass Blocks | A | [ ] Pass [ ] Fail [ ] N/A | |
| 2.4.2 Page Titled | A | [ ] Pass [ ] Fail [ ] N/A | |
| 2.4.3 Focus Order | A | [ ] Pass [ ] Fail [ ] N/A | |
| 2.4.4 Link Purpose (In Context) | A | [ ] Pass [ ] Fail [ ] N/A | |
| 2.4.5 Multiple Ways | AA | [ ] Pass [ ] Fail [ ] N/A | |
| 2.4.6 Headings and Labels | AA | [ ] Pass [ ] Fail [ ] N/A | |
| 2.4.7 Focus Visible | AA | [ ] Pass [ ] Fail [ ] N/A | |

**Implementation Checklist:**
- [ ] Skip to main content link provided
- [ ] Each page has a unique, descriptive title
- [ ] Focus order matches visual order
- [ ] Link text is descriptive (no "click here")
- [ ] Multiple ways to find pages (nav, search, sitemap)
- [ ] Headings and labels are descriptive
- [ ] Focus indicator is clearly visible

#### 2.5 Input Modalities

| Criterion | Level | Status | Notes |
|-----------|-------|--------|-------|
| 2.5.1 Pointer Gestures | A | [ ] Pass [ ] Fail [ ] N/A | |
| 2.5.2 Pointer Cancellation | A | [ ] Pass [ ] Fail [ ] N/A | |
| 2.5.3 Label in Name | A | [ ] Pass [ ] Fail [ ] N/A | |
| 2.5.4 Motion Actuation | A | [ ] Pass [ ] Fail [ ] N/A | |

**Implementation Checklist:**
- [ ] Complex gestures have single-pointer alternatives
- [ ] Actions triggered on up-event, not down-event
- [ ] Visible labels match accessible names
- [ ] Motion-based actions have alternatives

---

### 2.3 Understandable

Information and UI operation must be understandable.

#### 3.1 Readable

| Criterion | Level | Status | Notes |
|-----------|-------|--------|-------|
| 3.1.1 Language of Page | A | [ ] Pass [ ] Fail [ ] N/A | |
| 3.1.2 Language of Parts | AA | [ ] Pass [ ] Fail [ ] N/A | |

**Implementation Checklist:**
- [ ] `<html lang="en">` attribute set
- [ ] Language changes marked with `lang` attribute

#### 3.2 Predictable

| Criterion | Level | Status | Notes |
|-----------|-------|--------|-------|
| 3.2.1 On Focus | A | [ ] Pass [ ] Fail [ ] N/A | |
| 3.2.2 On Input | A | [ ] Pass [ ] Fail [ ] N/A | |
| 3.2.3 Consistent Navigation | AA | [ ] Pass [ ] Fail [ ] N/A | |
| 3.2.4 Consistent Identification | AA | [ ] Pass [ ] Fail [ ] N/A | |

**Implementation Checklist:**
- [ ] Focus doesn't trigger unexpected changes
- [ ] Form inputs don't auto-submit on change
- [ ] Navigation is consistent across pages
- [ ] Icons/buttons have consistent meaning

#### 3.3 Input Assistance

| Criterion | Level | Status | Notes |
|-----------|-------|--------|-------|
| 3.3.1 Error Identification | A | [ ] Pass [ ] Fail [ ] N/A | |
| 3.3.2 Labels or Instructions | A | [ ] Pass [ ] Fail [ ] N/A | |
| 3.3.3 Error Suggestion | AA | [ ] Pass [ ] Fail [ ] N/A | |
| 3.3.4 Error Prevention (Legal, Financial) | AA | [ ] Pass [ ] Fail [ ] N/A | |

**Implementation Checklist:**
- [ ] Form errors clearly identified
- [ ] Error messages describe the problem
- [ ] Error messages suggest corrections
- [ ] Required fields clearly marked
- [ ] Input format requirements shown
- [ ] Submissions can be reviewed/corrected
- [ ] Confirmation for irreversible actions

---

### 2.4 Robust

Content must be robust enough for assistive technologies.

#### 4.1 Compatible

| Criterion | Level | Status | Notes |
|-----------|-------|--------|-------|
| 4.1.1 Parsing | A | [ ] Pass [ ] Fail [ ] N/A | |
| 4.1.2 Name, Role, Value | A | [ ] Pass [ ] Fail [ ] N/A | |
| 4.1.3 Status Messages | AA | [ ] Pass [ ] Fail [ ] N/A | |

**Implementation Checklist:**
- [ ] Valid HTML (no duplicate IDs, proper nesting)
- [ ] Custom components have ARIA roles
- [ ] ARIA states updated dynamically
- [ ] Status messages use `aria-live` regions
- [ ] Loading states announced to screen readers

---

## 3. Component-Specific Checklists

### 3.1 Forms

- [ ] All inputs have visible labels
- [ ] Labels are programmatically associated (`for`/`id` or wrapping)
- [ ] Required fields indicated visually and programmatically
- [ ] Error messages associated with inputs (`aria-describedby`)
- [ ] Form groups use `<fieldset>` and `<legend>`
- [ ] Autocomplete attributes used where appropriate
- [ ] Submit buttons have descriptive text

### 3.2 Modals/Dialogs

- [ ] Focus moves to modal on open
- [ ] Focus trapped within modal
- [ ] Escape key closes modal
- [ ] Focus returns to trigger on close
- [ ] Modal has `role="dialog"` and `aria-modal="true"`
- [ ] Modal has accessible name (`aria-labelledby`)
- [ ] Background content is inert

### 3.3 Navigation

- [ ] Current page indicated (`aria-current="page"`)
- [ ] Dropdown menus keyboard accessible
- [ ] Mobile menu accessible
- [ ] Breadcrumbs use `<nav>` with label
- [ ] Skip links functional

### 3.4 Tables

- [ ] Data tables have `<caption>` or `aria-label`
- [ ] Header cells use `<th>` with `scope`
- [ ] Complex tables use `headers` attribute
- [ ] Layout tables don't use table semantics

### 3.5 Images and Media

- [ ] Informative images have descriptive alt text
- [ ] Decorative images hidden from AT
- [ ] SVGs have accessible names
- [ ] Videos have captions and transcripts
- [ ] Audio players have visible controls

### 3.6 Interactive Components

- [ ] Buttons use `<button>` element
- [ ] Links use `<a>` with `href`
- [ ] Custom controls have ARIA roles
- [ ] Toggle states use `aria-pressed` or `aria-expanded`
- [ ] Disabled states use `aria-disabled`

---

## 4. Testing Procedures

### 4.1 Automated Testing

**Tools:**
- axe DevTools (browser extension)
- WAVE (browser extension)
- Lighthouse (Chrome DevTools)
- Pa11y (CI integration)

**Run automated tests on:**
- [ ] All page templates
- [ ] All component variations
- [ ] All form states (empty, filled, error)
- [ ] All modal/dialog states

### 4.2 Manual Testing

**Keyboard Testing:**
1. [ ] Navigate entire page using Tab/Shift+Tab
2. [ ] Activate all interactive elements with Enter/Space
3. [ ] Navigate dropdowns with arrow keys
4. [ ] Close modals with Escape
5. [ ] Verify focus visibility throughout

**Screen Reader Testing:**
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)

**Visual Testing:**
- [ ] Test at 200% zoom
- [ ] Test at 320px width
- [ ] Test with high contrast mode
- [ ] Test with `prefers-reduced-motion`

### 4.3 User Testing

- [ ] Include users with disabilities in testing
- [ ] Test with actual assistive technology users
- [ ] Document feedback and issues

---

## 5. Remediation Priority

### Priority 1 (Critical)
Issues that completely block access:
- Missing form labels
- Keyboard traps
- Missing alt text on functional images
- No focus indicators

### Priority 2 (High)
Issues that significantly impair access:
- Poor color contrast
- Missing skip links
- Unclear error messages
- Missing ARIA on custom widgets

### Priority 3 (Medium)
Issues that cause difficulty:
- Inconsistent navigation
- Missing language attributes
- Poor heading structure
- Unclear link text

### Priority 4 (Low)
Minor issues:
- Redundant ARIA
- Minor contrast issues on non-essential elements
- Missing autocomplete attributes

---

## 6. Accessibility Statement

A public accessibility statement should include:

- [ ] Commitment to accessibility
- [ ] Standards targeted (WCAG 2.1 AA)
- [ ] Known limitations
- [ ] Contact information for accessibility issues
- [ ] Date of last review

**Template location:** `/legal/accessibility`

---

## 7. Ongoing Compliance

### Regular Audits
- [ ] Quarterly automated scans
- [ ] Annual manual audit
- [ ] Audit before major releases

### Training
- [ ] Developer accessibility training
- [ ] Designer accessibility training
- [ ] Content author guidelines

### Documentation
- [ ] Component accessibility documentation
- [ ] Testing procedures documented
- [ ] Issue tracking for accessibility bugs

---

## 8. Contact

**Accessibility Coordinator:** [Name]  
**Email:** accessibility@ghxstship.com

**Report accessibility issues:**
- Email: accessibility@ghxstship.com
- Support: [Support portal link]

---

*This checklist should be reviewed and updated annually or when WCAG guidelines are updated.*
