# ATLVS Accessibility Testing Guide

## Overview

This document outlines the accessibility testing procedures for ATLVS to ensure WCAG 2.1 AA compliance. All features must pass these tests before deployment.

---

## Automated Testing

### Axe-core Integration

ATLVS uses axe-core for automated accessibility testing:

```typescript
// In your test file
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('page should have no accessibility violations', async () => {
  const { container } = render(<YourComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Running Automated Tests

```bash
# Run accessibility tests
pnpm test:a11y

# Run with specific component
pnpm test:a11y --grep "Dashboard"
```

### CI Integration

Accessibility tests run automatically in CI:
- Pre-commit hook checks modified components
- PR checks run full accessibility suite
- Deployment blocked on accessibility failures

---

## Manual Testing Checklist

### Keyboard Navigation

| Test | Expected Behavior | Status |
|------|-------------------|--------|
| Tab through all interactive elements | Focus moves in logical order | ✅ |
| Shift+Tab reverse navigation | Focus moves backwards | ✅ |
| Enter/Space activates buttons | Buttons trigger actions | ✅ |
| Escape closes modals/dropdowns | Overlays dismiss | ✅ |
| Arrow keys in menus | Navigate menu items | ✅ |
| Focus visible on all elements | Clear focus indicator | ✅ |
| No keyboard traps | Can always navigate away | ✅ |
| Skip links functional | Skip to main content works | ✅ |

### Screen Reader Testing

#### VoiceOver (macOS)

**Setup:**
1. Enable VoiceOver: `Cmd + F5`
2. Open Safari (best VoiceOver support)
3. Navigate to ATLVS

**Test Script:**

```
1. Navigate to homepage
   - [ ] Page title announced
   - [ ] Main navigation announced
   - [ ] Skip link available

2. Navigate to Dashboard
   - [ ] Dashboard heading announced
   - [ ] Data tables have proper headers
   - [ ] Charts have text alternatives
   - [ ] Interactive elements announced with role

3. Complete a form
   - [ ] Form labels announced
   - [ ] Required fields indicated
   - [ ] Error messages announced
   - [ ] Success confirmation announced

4. Use data table
   - [ ] Column headers announced
   - [ ] Row/column position announced
   - [ ] Sort controls accessible
   - [ ] Pagination controls work
```

#### NVDA (Windows)

**Setup:**
1. Download NVDA from nvaccess.org
2. Open Chrome or Firefox
3. Navigate to ATLVS

**Test Script:**
Same as VoiceOver, plus:
- [ ] Browse mode navigation works
- [ ] Forms mode activates correctly
- [ ] Virtual cursor navigation functional

#### JAWS (Windows)

**Setup:**
1. Ensure JAWS license is active
2. Open Chrome or IE
3. Navigate to ATLVS

**Test Script:**
Same as VoiceOver, plus:
- [ ] JAWS-specific shortcuts work
- [ ] PDF documents accessible (if applicable)

---

## WCAG 2.1 AA Checklist

### Perceivable

#### 1.1 Text Alternatives
- [x] All images have alt text
- [x] Decorative images have empty alt
- [x] Complex images have long descriptions
- [x] Icons have accessible names

#### 1.2 Time-based Media
- [x] Videos have captions (if applicable)
- [x] Audio has transcripts (if applicable)

#### 1.3 Adaptable
- [x] Content structure uses semantic HTML
- [x] Reading order is logical
- [x] Instructions don't rely on sensory characteristics

#### 1.4 Distinguishable
- [x] Color contrast ratio ≥ 4.5:1 for text
- [x] Color contrast ratio ≥ 3:1 for large text
- [x] Color not sole means of conveying info
- [x] Text resizable to 200% without loss
- [x] No horizontal scrolling at 320px width

### Operable

#### 2.1 Keyboard Accessible
- [x] All functionality keyboard accessible
- [x] No keyboard traps
- [x] Keyboard shortcuts documented

#### 2.2 Enough Time
- [x] Timeouts can be extended
- [x] Moving content can be paused
- [x] No content flashes >3 times/second

#### 2.3 Seizures
- [x] No flashing content

#### 2.4 Navigable
- [x] Skip links present
- [x] Page titles descriptive
- [x] Focus order logical
- [x] Link purpose clear
- [x] Multiple ways to find pages
- [x] Headings descriptive
- [x] Focus visible

#### 2.5 Input Modalities
- [x] Touch targets ≥ 44x44px
- [x] Pointer gestures have alternatives
- [x] Motion activation can be disabled

### Understandable

#### 3.1 Readable
- [x] Language of page identified
- [x] Language of parts identified

#### 3.2 Predictable
- [x] No unexpected context changes on focus
- [x] No unexpected context changes on input
- [x] Consistent navigation
- [x] Consistent identification

#### 3.3 Input Assistance
- [x] Error identification clear
- [x] Labels or instructions provided
- [x] Error suggestions provided
- [x] Error prevention for important actions

### Robust

#### 4.1 Compatible
- [x] Valid HTML
- [x] Name, role, value for custom controls
- [x] Status messages announced

---

## Testing Tools

### Browser Extensions

| Tool | Browser | Purpose |
|------|---------|---------|
| axe DevTools | Chrome, Firefox | Automated testing |
| WAVE | Chrome, Firefox | Visual feedback |
| Accessibility Insights | Chrome, Edge | Comprehensive testing |
| HeadingsMap | Chrome, Firefox | Heading structure |
| Landmarks | Chrome, Firefox | ARIA landmarks |

### Color Contrast Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)
- Chrome DevTools (Inspect > Accessibility)

### Screen Readers

| Screen Reader | OS | Browser |
|---------------|-----|---------|
| VoiceOver | macOS, iOS | Safari |
| NVDA | Windows | Chrome, Firefox |
| JAWS | Windows | Chrome, IE |
| TalkBack | Android | Chrome |

---

## Common Issues & Fixes

### Missing Form Labels

**Issue:** Input fields without associated labels

**Fix:**
```tsx
// Bad
<Input placeholder="Email" />

// Good
<Label htmlFor="email">Email</Label>
<Input id="email" placeholder="Enter your email" />
```

### Low Color Contrast

**Issue:** Text doesn't meet 4.5:1 contrast ratio

**Fix:**
Use design system color tokens which are pre-validated:
```tsx
// Use text-foreground, text-muted-foreground, etc.
<Body className="text-foreground">High contrast text</Body>
```

### Missing Alt Text

**Issue:** Images without alternative text

**Fix:**
```tsx
// Informative image
<Image src="/chart.png" alt="Sales increased 25% in Q4" />

// Decorative image
<Image src="/decoration.png" alt="" role="presentation" />
```

### Keyboard Traps

**Issue:** Focus trapped in component

**Fix:**
```tsx
// Ensure modal has proper focus management
<Dialog onOpenChange={setOpen}>
  <DialogContent onEscapeKeyDown={() => setOpen(false)}>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Missing Focus Indicators

**Issue:** No visible focus state

**Fix:**
```tsx
// Design system components have built-in focus states
// For custom elements, use:
<button className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
  Click me
</button>
```

---

## Reporting Issues

### Accessibility Bug Template

```markdown
## Accessibility Issue

**Component:** [Component name]
**Page:** [URL]
**WCAG Criterion:** [e.g., 1.4.3 Contrast]

### Description
[Describe the accessibility barrier]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Screen Reader Used
[e.g., VoiceOver on macOS]

### Browser
[e.g., Safari 17]

### Screenshots/Recordings
[Attach if helpful]
```

---

## Compliance Statement

ATLVS is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply the relevant accessibility standards.

### Conformance Status

ATLVS conforms to WCAG 2.1 level AA. This means that the content conforms to the accessibility standard without any exceptions.

### Feedback

We welcome your feedback on the accessibility of ATLVS. Please contact us:
- Email: accessibility@ghxstship.com
- GitHub: File an issue with the "accessibility" label

---

*Last Updated: December 2025*
*Next Audit: March 2026*
