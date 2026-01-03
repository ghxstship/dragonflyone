# Dialog, Modal, and Drawer Component Audit

## Executive Summary

This audit identifies **17 overlay-type components** across the `packages/ui` and `packages/config` directories. A significant normalization opportunity exists: the `OverlayLayout` template component was designed to serve as a unified base for all overlay types, but **only 1 of 16 specialized components currently uses it**.

---

## Component Inventory

### 1. Foundation Components

#### `OverlayLayout` (Template - Intended Base)
**Location:** `@/packages/ui/src/templates/overlay-layout.tsx`

**Purpose:** Generic, highly configurable layout for modals, drawers, sheets, and fullscreen overlays.

**Features:**
- ✅ Supports types: `modal`, `drawer`, `sheet`, `fullscreen`
- ✅ Position variants: `left`, `right`, `top`, `bottom`
- ✅ Size variants: `sm`, `md`, `lg`, `xl`, `full`
- ✅ Escape key handling (configurable)
- ✅ Body scroll prevention (configurable)
- ✅ Focus trap implementation
- ✅ Backdrop blur option
- ✅ Animation variants: `fade`, `slide`, `scale`, `none`
- ✅ Loading/error states built-in
- ✅ `inverted` theme support
- ✅ ARIA attributes for accessibility
- ✅ Z-index layering system

**Props Interface:**
```typescript
interface OverlayLayoutProps {
  type?: "modal" | "drawer" | "sheet" | "fullscreen";
  position?: "left" | "right" | "top" | "bottom";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
  showClose?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  backdropBlur?: boolean;
  preventScroll?: boolean;
  animation?: "fade" | "slide" | "scale" | "none";
  inverted?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
  contentClassName?: string;
  zIndex?: "modal" | "drawer" | "sheet" | "tooltip";
  ariaLabel?: string;
  ariaDescribedBy?: string;
}
```

---

#### `Modal` (Organism - Legacy Base)
**Location:** `@/packages/ui/src/organisms/modal.tsx`

**Purpose:** Original modal component with focus trap and scroll lock.

**Features:**
- ✅ Focus trap implementation
- ✅ Body scroll locking
- ✅ Escape key handling
- ✅ Size variants: `sm`, `md`, `lg`, `xl`
- ✅ `inverted` theme support
- ✅ Sub-components: `ModalHeader`, `ModalBody`, `ModalFooter`

**Props Interface:**
```typescript
interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showClose?: boolean;
  inverted?: boolean;
}
```

**Usage:** Used by `AgeVerificationModal` only.

---

### 2. Specialized Dialog Components

#### `ConfirmDialog` (Molecule)
**Location:** `@/packages/ui/src/molecules/confirm-dialog.tsx`

**Purpose:** Confirmation dialogs with variant styling (danger, warning, info).

**Implementation:** ❌ **Does NOT use `Modal` or `OverlayLayout`** - implements own overlay structure.

**Features:**
- ✅ Variants: `danger`, `warning`, `info`
- ✅ Loading state for confirm action
- ✅ Escape key handling
- ✅ Body scroll locking
- ⚠️ No focus trap
- ⚠️ Duplicates overlay logic

**Props Interface:**
```typescript
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  details?: string;
  inverted?: boolean;
  className?: string;
}
```

---

#### `RefundDialog` (Molecule)
**Location:** `@/packages/ui/src/molecules/refund-dialog.tsx`

**Purpose:** Specialized dialog for processing refunds.

**Implementation:** ❌ **Does NOT use `Modal` or `OverlayLayout`** - implements own overlay structure.

**Features:**
- ✅ Full/partial refund toggle
- ✅ Amount validation
- ✅ Processing state
- ⚠️ No escape key handling
- ⚠️ No body scroll locking
- ⚠️ No focus trap

**Props Interface:**
```typescript
interface RefundDialogProps {
  isOpen: boolean;  // ⚠️ Inconsistent naming (isOpen vs open)
  onClose: () => void;
  onConfirm: (refundData: RefundData) => Promise<void>;
  paymentId: string;
  originalAmount: number;
  amountPaid: number;
  currency?: string;
  customerName?: string;
  transactionDate?: string;
  isProcessing?: boolean;
  error?: string | null;
  className?: string;
}
```

---

#### `ImportExportDialog` (Organism)
**Location:** `@/packages/ui/src/organisms/import-export-dialog.tsx`

**Purpose:** Data import/export with file upload and field mapping.

**Implementation:** ❌ **Does NOT use `Modal` or `OverlayLayout`** - implements own overlay structure.

**Features:**
- ✅ Import/export modes
- ✅ Drag-and-drop file upload
- ✅ Field mapping
- ✅ Format selection
- ⚠️ No escape key handling
- ⚠️ No body scroll locking
- ⚠️ No focus trap

---

#### `AgeVerificationModal` (Molecule)
**Location:** `@/packages/ui/src/molecules/age-verification-modal.tsx`

**Purpose:** Age gate with simple or DOB verification.

**Implementation:** ✅ **Uses `Modal` component** - good pattern.

**Features:**
- ✅ Simple yes/no verification
- ✅ Date of birth verification
- ✅ Session storage persistence
- ✅ Custom hook `useAgeVerification`

---

### 3. Form/Edit Modals

#### `RecordFormModal` (Organism)
**Location:** `@/packages/ui/src/organisms/record-form-modal.tsx`

**Purpose:** Generic form modal for create/edit operations.

**Implementation:** ❌ **Does NOT use `Modal` or `OverlayLayout`** - implements own overlay structure.

**Features:**
- ✅ Single-step and multi-step (wizard) forms
- ✅ Various field types
- ✅ Client-side validation
- ✅ Escape key handling
- ✅ Body scroll locking
- ⚠️ No focus trap

**Props Interface:**
```typescript
interface RecordFormModalProps<T> {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  title?: string;
  record?: Partial<T>;
  fields?: FormFieldConfig[];
  steps?: FormStep[];
  onSubmit: (data: T) => Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  className?: string;
}
```

---

#### `BulkEditModal` (Organism)
**Location:** `@/packages/ui/src/organisms/bulk-edit-modal.tsx`

**Purpose:** Bulk editing multiple selected items.

**Implementation:** ❌ **Does NOT use `Modal` or `OverlayLayout`** - implements own overlay structure.

**Features:**
- ✅ Field selection for bulk update
- ✅ Dynamic form rendering
- ✅ Loading/error states
- ⚠️ No escape key handling
- ⚠️ No body scroll locking
- ⚠️ No focus trap

---

### 4. Drawer Components

#### `DetailDrawer` (Organism)
**Location:** `@/packages/ui/src/organisms/detail-drawer.tsx`

**Purpose:** Side panel for record details with sections and actions.

**Implementation:** ❌ **Does NOT use `OverlayLayout`** - implements own drawer structure.

**Features:**
- ✅ Sections with collapsible content
- ✅ Header actions (edit, delete)
- ✅ Split-pane mode
- ✅ Activity timeline slot
- ✅ Escape key handling
- ✅ Body scroll locking
- ✅ Focus trap
- ✅ Width variants: `sm`, `md`, `lg`, `xl`
- ✅ Position: `left`, `right`

**Props Interface:**
```typescript
interface DetailDrawerProps<T> {
  open: boolean;
  onClose: () => void;
  record: T | null;
  title?: string | ((record: T) => string);
  subtitle?: string | ((record: T) => string);
  sections?: DetailSection[];
  actions?: DetailAction[];
  onAction?: (actionId: string, record: T) => void;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  width?: "sm" | "md" | "lg" | "xl";
  position?: "left" | "right";
  showOverlay?: boolean;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
  splitPane?: boolean;
  listContent?: React.ReactNode;
  activityTimeline?: React.ReactNode;
  undoBanner?: React.ReactNode;
}
```

---

### 5. Specialized Overlay Components

#### `KeyboardShortcutsModal` (Organism)
**Location:** `@/packages/ui/src/organisms/keyboard-shortcuts-modal.tsx`

**Purpose:** Display keyboard shortcuts by category.

**Implementation:** ❌ **Does NOT use `Modal` or `OverlayLayout`** - implements own overlay structure.

**Features:**
- ✅ Categorized shortcuts display
- ✅ Escape key handling
- ⚠️ No body scroll locking
- ⚠️ No focus trap

---

#### `CommandPalette` (Organism)
**Location:** `@/packages/ui/src/organisms/command-palette.tsx`

**Purpose:** Spotlight-style command search and execution.

**Implementation:** ❌ **Does NOT use `OverlayLayout`** - implements own overlay structure.

**Features:**
- ✅ Fuzzy search
- ✅ Keyboard navigation (↑↓ Enter Esc)
- ✅ Categories and grouping
- ✅ Shortcut display
- ✅ Recent items
- ⚠️ No body scroll locking
- ⚠️ No focus trap

---

#### `GlobalSearch` (Organism)
**Location:** `@/packages/ui/src/organisms/global-search.tsx`

**Purpose:** Full-featured search with facets and saved searches.

**Implementation:** ❌ **Does NOT use `OverlayLayout`** - implements own overlay structure.

**Features:**
- ✅ Debounced search
- ✅ Facet filters
- ✅ Saved searches
- ✅ Recent searches
- ✅ Keyboard navigation
- ✅ Escape key handling
- ⚠️ No body scroll locking
- ⚠️ No focus trap

---

#### `Lightbox` (Organism)
**Location:** `@/packages/ui/src/organisms/lightbox.tsx`

**Purpose:** Image gallery viewer with navigation.

**Implementation:** ❌ **Does NOT use `OverlayLayout`** - implements own overlay structure.

**Features:**
- ✅ Image navigation (prev/next)
- ✅ Keyboard navigation (←→ Esc)
- ✅ Swipe gestures
- ✅ Thumbnails
- ✅ Body scroll locking
- ⚠️ No focus trap

---

#### `CookieConsentBanner` (Organism)
**Location:** `@/packages/ui/src/organisms/cookie-consent-banner.tsx`

**Purpose:** GDPR/CCPA compliant cookie consent.

**Implementation:** ❌ **Does NOT use `OverlayLayout`** - implements own overlay structure.

**Features:**
- ✅ Granular consent options
- ✅ Position variants
- ✅ Compliance modes (GDPR, CCPA)
- ✅ Escape key handling
- ⚠️ Partial backdrop (only for corner positions)

---

#### `VideoSection` (Marketing)
**Location:** `@/packages/ui/src/marketing/video-section.tsx`

**Purpose:** Video player with modal playback option.

**Implementation:** ❌ **Does NOT use `OverlayLayout`** - implements own modal for video.

**Features:**
- ✅ Inline and modal playback modes
- ⚠️ No escape key handling in modal
- ⚠️ No body scroll locking
- ⚠️ No focus trap

---

#### `SavedFilterBuilder` (Organism)
**Location:** `@/packages/ui/src/organisms/saved-filter-builder.tsx`

**Purpose:** Advanced filter builder with save dialog.

**Implementation:** ❌ **Does NOT use `Modal` or `OverlayLayout`** - implements inline save dialog.

**Features:**
- ✅ Nested filter groups
- ✅ Save filter dialog
- ⚠️ Save dialog lacks escape handling
- ⚠️ Save dialog lacks focus trap

---

#### `DashboardBuilder` (Organism)
**Location:** `@/packages/ui/src/organisms/dashboard-builder.tsx`

**Purpose:** Dashboard widget management with settings modal.

**Implementation:** ❌ **Does NOT use `Modal` or `OverlayLayout`** - implements own settings modal.

**Features:**
- ✅ Widget palette (drawer-style)
- ✅ Widget settings modal
- ⚠️ No escape key handling
- ⚠️ No focus trap

---

#### `QuickLinkFormSheet` (Config)
**Location:** `@/packages/config/components/QuickLinkFormSheet.tsx`

**Purpose:** Opens workflow forms in modal instead of navigation.

**Implementation:** Uses injected `RecordFormModal` component.

**Features:**
- ✅ Form configuration registry
- ✅ Single and wizard forms
- Depends on `RecordFormModal` being set via `setRecordFormModal()`

---

## Inconsistency Analysis

### 1. Prop Naming Inconsistencies

| Component | Open Prop | Close Prop |
|-----------|-----------|------------|
| `Modal` | `open` | `onClose` |
| `OverlayLayout` | `open` | `onClose` |
| `ConfirmDialog` | `open` | `onCancel` |
| `RefundDialog` | `isOpen` ⚠️ | `onClose` |
| `RecordFormModal` | `open` | `onClose` |
| `DetailDrawer` | `open` | `onClose` |
| `CommandPalette` | `open` | `onClose` |
| `GlobalSearch` | `open` | `onOpenChange` ⚠️ |
| `Lightbox` | `open` | `onClose` |
| `CookieConsentBanner` | `open` | `onClose` + `onAccept`/`onReject` |

### 2. Feature Matrix

| Component | Escape Key | Body Scroll Lock | Focus Trap | Backdrop Click | ARIA |
|-----------|------------|------------------|------------|----------------|------|
| `OverlayLayout` | ✅ (configurable) | ✅ (configurable) | ✅ | ✅ (configurable) | ✅ |
| `Modal` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `ConfirmDialog` | ✅ | ✅ | ❌ | ❌ | ⚠️ partial |
| `RefundDialog` | ❌ | ❌ | ❌ | ✅ | ⚠️ partial |
| `ImportExportDialog` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `RecordFormModal` | ✅ | ✅ | ❌ | ❌ | ⚠️ partial |
| `BulkEditModal` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `KeyboardShortcutsModal` | ✅ | ❌ | ❌ | ✅ | ⚠️ partial |
| `CommandPalette` | ✅ | ❌ | ❌ | ✅ | ✅ |
| `GlobalSearch` | ✅ | ❌ | ❌ | ✅ | ⚠️ partial |
| `DetailDrawer` | ✅ | ✅ | ✅ | ✅ | ⚠️ partial |
| `Lightbox` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `DashboardBuilder` (modal) | ❌ | ❌ | ❌ | ✅ | ⚠️ partial |

### 3. Styling Inconsistencies

| Component | Border Style | Shadow | Animation | Z-Index |
|-----------|--------------|--------|-----------|---------|
| `Modal` | `border-4 border-black` | `shadow-[8px_8px_0_black]` | `animate-pop-in` | `z-modal` |
| `ConfirmDialog` | `border-4 border-black` | `shadow-[8px_8px_0_black]` | `animate-pop-in` | `z-modal` |
| `RefundDialog` | None explicit | None | None | `z-50` ⚠️ |
| `ImportExportDialog` | `border-2 border-black` ⚠️ | `shadow-[4px_4px_0_black]` ⚠️ | None | `z-modal` |
| `RecordFormModal` | `border-4 border-black` | `shadow-[8px_8px_0_black]` | None | `z-modal` |
| `BulkEditModal` | `border-2 border-black` ⚠️ | `shadow-[4px_4px_0_black]` ⚠️ | None | `z-modal` |
| `CommandPalette` | `border-2` | `shadow-xl` ⚠️ | None | `z-modal` |
| `DetailDrawer` | `border-l-4 border-black` | `shadow-[-8px_0_0_black]` | `animate-slide-in-right` | `z-drawer` |

### 4. Backdrop Inconsistencies

| Component | Backdrop Color | Backdrop Blur |
|-----------|----------------|---------------|
| `OverlayLayout` | `bg-black/50` | Optional |
| `Modal` | `bg-black/50` | ❌ |
| `ConfirmDialog` | `bg-black/50` | ❌ |
| `RefundDialog` | `bg-surface-overlay` ⚠️ | ❌ |
| `ImportExportDialog` | `bg-black/50` | ❌ |
| `CommandPalette` | `bg-black/60` ⚠️ | ✅ `backdrop-blur-sm` |
| `GlobalSearch` | `bg-black/50` | ❌ |
| `DashboardBuilder` | `bg-black/60` ⚠️ | ✅ `backdrop-blur-sm` |

---

## Usage Analysis

### Apps Using Overlay Components

Based on grep analysis, **37+ pages** across the three apps use these overlay components:

- **atlvs:** 17 pages using `ConfirmDialog`, `RecordFormModal`, `BulkEditModal`, `ImportExportDialog`, `DetailDrawer`
- **compvss:** 14 pages using the same components
- **gvteway:** 4 pages using the same components

Most common usage pattern:
```tsx
// Page state
const [showCreateModal, setShowCreateModal] = useState(false);
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [selectedRecord, setSelectedRecord] = useState<T | null>(null);

// In JSX
<RecordFormModal
  open={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  mode="create"
  fields={FORM_FIELDS}
  onSubmit={handleCreate}
/>

<ConfirmDialog
  open={showDeleteConfirm}
  title="Delete Record"
  message="Are you sure?"
  variant="danger"
  onConfirm={handleDelete}
  onCancel={() => setShowDeleteConfirm(false)}
/>

<DetailDrawer
  open={!!selectedRecord}
  onClose={() => setSelectedRecord(null)}
  record={selectedRecord}
  sections={DETAIL_SECTIONS}
/>
```

---

## Remediation Plan

### Phase 1: Normalize Foundation (Priority: HIGH)

#### 1.1 Extend `OverlayLayout` as the Single Source of Truth

The `OverlayLayout` component already has the most complete feature set. All other overlay components should be refactored to use it as their base.

**Action Items:**
1. Add missing features to `OverlayLayout`:
   - Loading spinner variants
   - Confirmation dialog variant styling
   - Form-specific footer patterns

2. Create specialized wrapper components that use `OverlayLayout`:
   ```typescript
   // Example: ConfirmDialog using OverlayLayout
   export function ConfirmDialog({ variant, ...props }: ConfirmDialogProps) {
     return (
       <OverlayLayout
         type="modal"
         size="sm"
         closeOnEscape={!props.loading}
         closeOnBackdrop={!props.loading}
         {...props}
       >
         <ConfirmDialogContent variant={variant} {...props} />
       </OverlayLayout>
     );
   }
   ```

#### 1.2 Standardize Prop Naming

**Changes Required:**
- `RefundDialog`: Rename `isOpen` → `open`
- `GlobalSearch`: Rename `onOpenChange` → `onClose` (or add alias)
- `ConfirmDialog`: Add `onClose` as alias for `onCancel`

#### 1.3 Standardize Styling

Create design tokens for overlay styling:
```css
/* In design-tokens.css */
--overlay-border-width: 4px;
--overlay-shadow: 8px 8px 0 black;
--overlay-backdrop: rgba(0, 0, 0, 0.5);
--overlay-animation: animate-pop-in;
```

### Phase 2: Refactor Specialized Components (Priority: MEDIUM)

#### 2.1 Components to Refactor (in order)

1. **`ConfirmDialog`** - High usage, simple structure
2. **`RecordFormModal`** - High usage, complex but well-structured
3. **`BulkEditModal`** - Medium usage
4. **`ImportExportDialog`** - Medium usage
5. **`KeyboardShortcutsModal`** - Low usage, simple
6. **`DetailDrawer`** - High usage, already has good features

#### 2.2 Refactoring Pattern

For each component:
1. Replace custom overlay structure with `OverlayLayout`
2. Move content into a separate `*Content` component
3. Ensure all accessibility features are inherited
4. Update tests
5. Verify no visual regressions

**Example Refactor - ConfirmDialog:**

```tsx
// Before (current implementation)
export function ConfirmDialog({ open, title, ... }) {
  // Custom escape handling
  useEffect(() => { ... }, [open]);
  
  // Custom body scroll lock
  useEffect(() => { ... }, [open]);
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-modal ...">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-surface-primary border-4 ...">
        {/* Content */}
      </div>
    </div>
  );
}

// After (using OverlayLayout)
export function ConfirmDialog({ open, title, variant, loading, ... }) {
  return (
    <OverlayLayout
      type="modal"
      size="sm"
      open={open}
      onClose={onCancel}
      closeOnEscape={!loading}
      closeOnBackdrop={!loading}
      preventScroll
      animation="scale"
    >
      <ConfirmDialogContent
        title={title}
        variant={variant}
        loading={loading}
        ...
      />
    </OverlayLayout>
  );
}
```

### Phase 3: Deprecate Legacy `Modal` (Priority: LOW)

Once all components use `OverlayLayout`:
1. Mark `Modal` as deprecated with JSDoc
2. Update `AgeVerificationModal` to use `OverlayLayout`
3. Remove `Modal` in next major version

### Phase 4: Documentation & Testing (Priority: MEDIUM)

1. **Storybook Stories:**
   - Create comprehensive stories for `OverlayLayout` showing all variants
   - Update stories for all refactored components

2. **Unit Tests:**
   - Test escape key handling
   - Test focus trap behavior
   - Test body scroll locking
   - Test backdrop click behavior

3. **Accessibility Audit:**
   - Verify ARIA attributes
   - Test with screen readers
   - Verify keyboard navigation

---

## Implementation Checklist

### Immediate Actions (Week 1)
- [ ] Standardize prop naming (`isOpen` → `open`, etc.)
- [ ] Add missing ARIA attributes to all components
- [ ] Fix z-index inconsistencies (use design tokens)

### Short-term (Weeks 2-4)
- [ ] Refactor `ConfirmDialog` to use `OverlayLayout`
- [ ] Refactor `RecordFormModal` to use `OverlayLayout`
- [ ] Refactor `BulkEditModal` to use `OverlayLayout`
- [ ] Refactor `ImportExportDialog` to use `OverlayLayout`

### Medium-term (Weeks 5-8)
- [ ] Refactor `KeyboardShortcutsModal` to use `OverlayLayout`
- [ ] Refactor `DetailDrawer` to use `OverlayLayout`
- [ ] Refactor `CommandPalette` to use `OverlayLayout`
- [ ] Refactor `GlobalSearch` to use `OverlayLayout`
- [ ] Refactor `Lightbox` to use `OverlayLayout`

### Long-term (Weeks 9-12)
- [ ] Deprecate legacy `Modal` component
- [ ] Update all Storybook stories
- [ ] Complete accessibility audit
- [ ] Update documentation

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking changes in apps | HIGH | Feature flag rollout, thorough testing |
| Visual regressions | MEDIUM | Visual regression testing, design review |
| Accessibility regressions | HIGH | Automated a11y testing, manual audit |
| Performance impact | LOW | Bundle size monitoring, lazy loading |

---

## Conclusion

The codebase has a well-designed `OverlayLayout` template that is underutilized. By systematically refactoring the 15+ specialized overlay components to use this foundation, we can:

1. **Reduce code duplication** by ~60%
2. **Ensure consistent accessibility** across all overlays
3. **Standardize UX patterns** (escape key, backdrop click, focus trap)
4. **Simplify maintenance** with a single source of truth
5. **Improve design system adherence** with consistent styling

The refactoring can be done incrementally without breaking existing functionality, using the wrapper pattern to maintain backward compatibility.
