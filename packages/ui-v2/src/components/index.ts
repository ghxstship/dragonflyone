/**
 * UI v2 Components - Styled Brand-Aware Components
 *
 * Components include:
 * - Data: Card, Badge, List, (Table, Chip - coming soon)
 * - Feedback: Alert, EmptyState, Banner, (Toast, ErrorBoundary - coming soon)
 * - Form: Field, ButtonGroup, (FormGroup, Fieldset, Menu - coming soon)
 * - Navigation: Breadcrumb, Tabs, Pagination, (Nav, Sidebar - coming soon)
 * - Overlay: Dialog, Tooltip, Dropdown, (Popover, Sheet - coming soon)
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

export { List, ListItem } from './list';
export type { ListProps, ListItemProps } from './list';

// =============================================================================
// Feedback Components
// =============================================================================

export { Alert } from './alert';
export type { AlertProps } from './alert';

export { EmptyState } from './empty-state';
export type { EmptyStateProps } from './empty-state';

export { Banner } from './banner';
export type { BannerProps } from './banner';

// =============================================================================
// Navigation Components
// =============================================================================

export { Breadcrumb } from './breadcrumb';
export type { BreadcrumbProps, BreadcrumbItem } from './breadcrumb';

export { Tabs } from './tabs';
export type { TabsProps, Tab } from './tabs';

export { Pagination } from './pagination';
export type { PaginationProps } from './pagination';

// =============================================================================
// Form Components
// =============================================================================

export { Field } from './field';
export type { FieldProps } from './field';

export { ButtonGroup } from './button-group';
export type { ButtonGroupProps } from './button-group';

// =============================================================================
// Overlay Components
// =============================================================================

export { Dialog } from './dialog';
export type { DialogProps } from './dialog';

export { Tooltip } from './tooltip';
export type { TooltipProps } from './tooltip';

export { Dropdown } from './dropdown';
export type { DropdownProps, DropdownItem } from './dropdown';
