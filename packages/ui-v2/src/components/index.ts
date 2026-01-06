/**
 * UI v2 Components - Styled Brand-Aware Components
 *
 * Components include:
 * - Data: Card, Badge, (List, Table, Chip - coming soon)
 * - Feedback: Alert, EmptyState, (Toast, Banner, ErrorBoundary - coming soon)
 * - Form: Field, ButtonGroup, (FormGroup, Fieldset, Menu - coming soon)
 * - Navigation: (Nav, Sidebar, Breadcrumb, Tabs, Pagination - coming soon)
 * - Overlay: (Dialog, Popover, Tooltip, Dropdown, Sheet - coming soon)
 */

// =============================================================================
// Data Components
// =============================================================================

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
} from './card';

export { Badge } from './badge';
export type { BadgeProps } from './badge';

// =============================================================================
// Feedback Components
// =============================================================================

export { Alert } from './alert';
export type { AlertProps } from './alert';

export { EmptyState } from './empty-state';
export type { EmptyStateProps } from './empty-state';

// =============================================================================
// Form Components
// =============================================================================

export { Field } from './field';
export type { FieldProps } from './field';

export { ButtonGroup } from './button-group';
export type { ButtonGroupProps } from './button-group';
