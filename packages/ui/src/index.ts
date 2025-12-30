// Design System Tokens
export * from "./tokens.js";

// =============================================================================
// ATOMS - Basic building blocks
// =============================================================================
export { Display, H1, H2, H3, H4, H5, H6, Body, Label } from "./atoms/typography.js";
export { Button } from "./atoms/button.js";
export type { ButtonProps } from "./atoms/button.js";
export { Input, InputGroup } from "./atoms/input.js";
export type { InputProps, InputGroupProps } from "./atoms/input.js";
export { PhoneInput, phoneValidation, emailValidation, COUNTRY_CODES } from "./atoms/phone-input.js";
export type { PhoneInputProps, CountryCode } from "./atoms/phone-input.js";
export { AddressInput, addressValidation } from "./atoms/address-input.js";
export type { AddressInputProps, AddressData } from "./atoms/address-input.js";
export { PasswordInput } from "./atoms/password-input.js";
export type { PasswordInputProps } from "./atoms/password-input.js";
export { Textarea, TextareaGroup } from "./atoms/textarea.js";
export type { TextareaProps, TextareaGroupProps } from "./atoms/textarea.js";
export { Select, SelectGroup } from "./atoms/select.js";
export type { SelectProps, SelectGroupProps } from "./atoms/select.js";
export { Checkbox } from "./atoms/checkbox.js";
export type { CheckboxProps } from "./atoms/checkbox.js";
export { Radio } from "./atoms/radio.js";
export type { RadioProps } from "./atoms/radio.js";
export { Form } from "./atoms/form.js";
export type { FormProps } from "./atoms/form.js";
export { Switch } from "./atoms/switch.js";
export type { SwitchProps } from "./atoms/switch.js";
export { Badge } from "./atoms/badge.js";
export type { BadgeProps } from "./atoms/badge.js";
export { StatusBadge } from "./atoms/status-badge.js";
export type { StatusBadgeProps } from "./atoms/status-badge.js";
export { Divider } from "./atoms/divider.js";
export type { DividerProps } from "./atoms/divider.js";
export { Spinner } from "./atoms/spinner.js";
export type { SpinnerProps } from "./atoms/spinner.js";
export { ProgressBar } from "./atoms/progress-bar.js";
export type { ProgressBarProps } from "./atoms/progress-bar.js";
export { Link } from "./atoms/link.js";
export type { LinkProps } from "./atoms/link.js";
export { Text } from "./atoms/text.js";
export type { TextProps } from "./atoms/text.js";
export { List, ListItem } from "./atoms/list.js";
export type { ListProps, ListItemProps } from "./atoms/list.js";
export {
  Icon,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  Menu,
  Plus,
  Minus,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Upload,
  Download,
  IconBox,
} from "./atoms/icon.js";
export type { IconProps, IconBoxProps } from "./atoms/icon.js";
export { SocialIcon } from "./atoms/social-icon.js";
export type { SocialIconProps } from "./atoms/social-icon.js";
export { Countdown } from "./atoms/countdown.js";
export type { CountdownProps } from "./atoms/countdown.js";
export { UrgencyBadge } from "./atoms/urgency-badge.js";
export type { UrgencyBadgeProps } from "./atoms/urgency-badge.js";
export { Kicker } from "./atoms/kicker.js";
export type { KickerProps } from "./atoms/kicker.js";
export { HalftonePattern, HeroHalftone, GridPattern } from "./atoms/halftone-pattern.js";
export type { HalftonePatternProps } from "./atoms/halftone-pattern.js";
export { Avatar, AvatarGroup } from "./atoms/avatar.js";
export type { AvatarProps, AvatarGroupProps } from "./atoms/avatar.js";
export { Tooltip } from "./atoms/tooltip.js";
export type { TooltipProps } from "./atoms/tooltip.js";
export { DuotoneImage, ImageWithOverlay } from "./atoms/duotone-image.js";
export type { DuotoneImageProps, ImageWithOverlayProps } from "./atoms/duotone-image.js";
export { PageTransition, StaggeredTransition } from "./atoms/page-transition.js";
export type { PageTransitionProps, StaggeredTransitionProps } from "./atoms/page-transition.js";
export { SuccessAnimation } from "./atoms/success-animation.js";
export type { SuccessAnimationProps } from "./atoms/success-animation.js";
export { MaskedInput } from "./atoms/masked-input.js";
export type { MaskedInputProps, MaskType } from "./atoms/masked-input.js";
export { VirtualizedList } from "./molecules/virtualized-list.js";
export type { VirtualizedListProps } from "./molecules/virtualized-list.js";
export { Sparkline } from "./atoms/sparkline.js";
export type { SparklineProps } from "./atoms/sparkline.js";
export { GeometricShape, GeometricPattern } from "./atoms/geometric-shapes.js";
export type { GeometricShapeProps, GeometricPatternProps } from "./atoms/geometric-shapes.js";

// =============================================================================
// MOLECULES - Composed components
// =============================================================================
export { Field } from "./molecules/field.js";
export type { FieldProps } from "./molecules/field.js";
export { Card, CardHeader, CardBody, CardFooter } from "./molecules/card.js";
export type { CardProps } from "./molecules/card.js";
export { ButtonGroup } from "./molecules/button-group.js";
export type { ButtonGroupProps } from "./molecules/button-group.js";
export { StatCard } from "./molecules/stat-card.js";
export type { StatCardProps } from "./molecules/stat-card.js";
export { Alert } from "./molecules/alert.js";
export type { AlertProps } from "./molecules/alert.js";
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./molecules/table.js";
export type { TableProps, TableVariant } from "./molecules/table.js";
export { ScrollableTableWrapper } from "./molecules/scrollable-table-wrapper.js";
export type { ScrollableTableWrapperProps } from "./molecules/scrollable-table-wrapper.js";
export { Pagination } from "./molecules/pagination.js";
export type { PaginationProps } from "./molecules/pagination.js";
export { Breadcrumb } from "./molecules/breadcrumb.js";
export type { BreadcrumbProps, BreadcrumbItemProps } from "./molecules/breadcrumb.js";
// BreadcrumbItem type exported from ./types/breadcrumb.js
export { Tabs, TabsList, Tab, TabPanel } from "./molecules/tabs.js";
export type { TabsProps, TabProps } from "./molecules/tabs.js";
export { Dropdown, DropdownItem } from "./molecules/dropdown.js";
export type { DropdownProps } from "./molecules/dropdown.js";
export { Newsletter } from "./molecules/newsletter.js";
export type { NewsletterProps } from "./molecules/newsletter.js";
export { ProjectCard } from "./molecules/project-card.js";
export type { ProjectCardProps } from "./molecules/project-card.js";
export { ServiceCard } from "./molecules/service-card.js";
export type { ServiceCardProps } from "./molecules/service-card.js";
export { EmptyState } from "./molecules/empty-state.js";
export { ErrorState, PageErrorState, InlineErrorState } from "./molecules/error-state.js";
export type { ErrorStateProps } from "./molecules/error-state.js";
export { Skeleton, SkeletonCard, SkeletonTable } from "./molecules/skeleton.js";
export { NotificationToast } from "./molecules/notification-toast.js";
export type { Toast } from "./molecules/notification-toast.js";
export { EventCard } from "./molecules/event-card.js";
export type { EventCardProps } from "./molecules/event-card.js";
export { TicketCard } from "./molecules/ticket-card.js";
export type { TicketCardProps } from "./molecules/ticket-card.js";
export { CrewCard } from "./molecules/crew-card.js";
export type { CrewCardProps } from "./molecules/crew-card.js";
// DataTable removed - use DataGrid from organisms for full-featured tables
export { SearchFilter } from "./molecules/search-filter.js";
export type { SearchFilterProps, FilterGroup, FilterOption, FilterPreset } from "./molecules/search-filter.js";
export { PriceDisplay, PriceRange, formatPrice } from "./molecules/price-display.js";
export type { PriceDisplayProps, PriceRangeProps } from "./molecules/price-display.js";
export { Stepper } from "./molecules/stepper.js";
export type { StepperProps, Step } from "./molecules/stepper.js";
export { FileUpload } from "./molecules/file-upload.js";
export type { FileUploadProps, UploadedFile } from "./molecules/file-upload.js";
export { Timeline } from "./molecules/timeline.js";
export type { TimelineProps, TimelineItem } from "./molecules/timeline.js";
export { LanguageSelector } from "./molecules/language-selector.js";
export type { LanguageSelectorProps, Language } from "./molecules/language-selector.js";
export { OfflineIndicator } from "./molecules/offline-indicator.js";
export type { OfflineIndicatorProps } from "./molecules/offline-indicator.js";
export { VideoPlayer } from "./molecules/video-player.js";
export type { VideoPlayerProps } from "./molecules/video-player.js";
export { ScrollReveal, Parallax, StaggerChildren } from "./molecules/scroll-reveal.js";
export type { ScrollRevealProps, ParallaxProps, StaggerChildrenProps } from "./molecules/scroll-reveal.js";
export { ConfirmDialog } from "./molecules/confirm-dialog.js";
export type { ConfirmDialogProps, ConfirmDialogVariant } from "./molecules/confirm-dialog.js";
export { BulkActionBar } from "./molecules/bulk-action-bar.js";
export type { BulkActionBarProps, BulkAction } from "./molecules/bulk-action-bar.js";
export { PresenceAvatars } from "./molecules/presence-avatars.js";
export type { PresenceAvatarsProps, PresenceUser } from "./molecules/presence-avatars.js";
export { RowActions } from "./molecules/row-actions.js";
export type { RowActionsProps, RowAction } from "./molecules/row-actions.js";
export { SectionHeader } from "./molecules/section-header.js";
export type { SectionHeaderProps } from "./molecules/section-header.js";
export { ContentCard, FeatureCard } from "./molecules/content-card.js";
export type { ContentCardProps, FeatureCardProps } from "./molecules/content-card.js";
export { ContextBreadcrumb } from "./molecules/context-breadcrumb.js";
export type { ContextBreadcrumbProps, ContextLevel, ContextItem } from "./molecules/context-breadcrumb.js";
export { CollaborativeField, CollaborativeCursor, CollaboratorsList } from "./molecules/collaborative-field.js";
export type { CollaborativeFieldProps, CollaborativeCursorProps, CollaboratorsListProps, CollaborationUser, FieldPresenceState } from "./molecules/collaborative-field.js";
export { QuickAddFab } from "./molecules/quick-add-fab.js";
export type { QuickAddFabProps, QuickAddAction } from "./molecules/quick-add-fab.js";
export { SettingsRow, SettingsGroup, InfoRow, NumberedStep } from "./molecules/settings-row.js";
export type { SettingsRowProps, SettingsGroupProps, InfoRowProps, NumberedStepProps } from "./molecules/settings-row.js";

// =============================================================================
// ORGANISMS - Complex components
// =============================================================================
export { Modal, ModalHeader, ModalBody, ModalFooter } from "./organisms/modal.js";
export type { ModalProps } from "./organisms/modal.js";
export { Navigation, NavLink } from "./organisms/navigation.js";
export type { NavigationProps, NavLinkProps } from "./organisms/navigation.js";
// Sidebar components consolidated to AppSidebar - see app-sidebar.js exports below
export { Footer, FooterColumn, FooterLink } from "./organisms/footer.js";
export type { FooterProps, FooterColumnProps } from "./organisms/footer.js";
export { Hero } from "./organisms/hero.js";
export type { HeroProps } from "./organisms/hero.js";
export { FormWizard, FormStep } from "./organisms/form-wizard.js";
export type { FormWizardProps, FormStepProps } from "./organisms/form-wizard.js";
export { ImageGallery } from "./organisms/image-gallery.js";
export type { ImageGalleryProps } from "./organisms/image-gallery.js";
export type { GalleryImage } from "./organisms/image-gallery.js";
export { ErrorBoundary } from "./organisms/error-boundary.js";
export { ApiErrorBoundary } from "./organisms/api-error-boundary.js";
export { NotificationProvider, useNotifications } from "./organisms/notification-provider.js";
export { SeatingChart } from "./organisms/seating-chart.js";
export type { SeatingChartProps, Seat, Section as SeatingSection } from "./organisms/seating-chart.js";
export { Calendar } from "./organisms/calendar.js";
export type { CalendarProps, CalendarEvent } from "./organisms/calendar.js";
export { StatsDashboard, StatCard as DashboardStatCard } from "./organisms/stats-dashboard.js";
export type { StatsDashboardProps, Stat } from "./organisms/stats-dashboard.js";
export { Lightbox } from "./organisms/lightbox.js";
export type { LightboxProps, LightboxImage } from "./organisms/lightbox.js";
export { DetailDrawer } from "./organisms/detail-drawer.js";
export type { DetailDrawerProps, DetailSection, DetailAction } from "./organisms/detail-drawer.js";
export { DataGrid } from "./organisms/data-grid.js";
export type { DataGridProps, DataGridColumn } from "./organisms/data-grid.js";
export { KanbanBoard } from "./organisms/kanban-board.js";
export type { KanbanBoardProps, KanbanColumn as KanbanBoardColumn } from "./organisms/kanban-board.js";
export { DashboardBuilder } from "./organisms/dashboard-builder.js";
export type { DashboardBuilderProps, DashboardConfig, WidgetConfig, WidgetType, WidgetSize } from "./organisms/dashboard-builder.js";
export { GanttChart } from "./organisms/gantt-chart.js";
export type { GanttChartProps, GanttTask, GanttMilestone, GanttViewMode } from "./organisms/gantt-chart.js";
export { TimelineView } from "./organisms/timeline-view.js";
export type { TimelineViewProps, TimelineItem as TimelineViewItem, TimelineGrouping } from "./organisms/timeline-view.js";
export { MapView } from "./organisms/map-view.js";
export type { MapViewProps, MapLocation } from "./organisms/map-view.js";
export { GalleryView } from "./organisms/gallery-view.js";
export type { GalleryViewProps, GalleryItem, GalleryLayout, GallerySize } from "./organisms/gallery-view.js";
export { RecordFormModal } from "./organisms/record-form-modal.js";
export type { RecordFormModalProps, FormFieldConfig, FormStep as RecordFormStep, FieldType } from "./organisms/record-form-modal.js";
export { ImportExportDialog } from "./organisms/import-export-dialog.js";
export type { ImportExportDialogProps, ExportFormat, ColumnConfig, ImportTemplate } from "./organisms/import-export-dialog.js";
export { AppNavigation } from "./organisms/app-navigation.js";
export type { AppNavigationProps, NavItem as AppNavItem } from "./organisms/app-navigation.js";
export { UnifiedHeader } from "./organisms/unified-header.js";
export type { UnifiedHeaderProps, NavItem as UnifiedNavItem } from "./organisms/unified-header.js";
export { WorkflowTimeline } from "./organisms/workflow-timeline.js";
export type { WorkflowTimelineProps, WorkflowStage } from "./organisms/workflow-timeline.js";
export { ProtectedRoute } from "./organisms/protected-route.js";
export type { ProtectedRouteProps } from "./organisms/protected-route.js";
export { AppSidebar, MobileAppSidebar } from "./organisms/app-sidebar.js";
export type { AppSidebarProps, MobileAppSidebarProps, SidebarNavSection, SidebarNavItem, SidebarNavSubsection } from "./organisms/app-sidebar.js";
export { ContextSwitcher } from "./organisms/context-switcher.js";
export { GlobalSearch } from "./organisms/global-search.js";
export type { GlobalSearchProps, SearchFilter as GlobalSearchFilter, SearchResult, SearchFacet, SavedSearch } from "./organisms/global-search.js";
export { AutomationBuilder } from "./organisms/automation-builder.js";
export type { AutomationBuilderProps, AutomationWorkflow, TriggerConfig, ActionConfig, ConditionConfig, TriggerType, ActionType, ConditionOperator } from "./organisms/automation-builder.js";
export { KeyboardShortcutsModal } from "./organisms/keyboard-shortcuts-modal.js";
export type { KeyboardShortcutsModalProps } from "./organisms/keyboard-shortcuts-modal.js";
export { ActivityFeed } from "./organisms/activity-feed.js";
export type { ActivityFeedProps, ActivityItem, ActivityType, ActivityUser } from "./organisms/activity-feed.js";
export { NotificationCenter, NotificationBell } from "./organisms/notification-center.js";
export type { NotificationCenterProps, NotificationBellProps, Notification, NotificationType, NotificationPriority } from "./organisms/notification-center.js";
export type { ContextSwitcherProps, ProductionContext } from "./organisms/context-switcher.js";
// AppPageHeader - Enterprise page header with breadcrumbs, tabs, views, actions
// Use this for authenticated app pages. For marketing pages, use MarketingPageHeader from foundations.
export { PageHeader as AppPageHeader } from "./organisms/page-header.js";
export type { PageHeaderProps as AppPageHeaderProps, TabItem, ViewOption } from "./organisms/page-header.js";
// BreadcrumbItem re-exported from page-header.js but canonical source is ./types/breadcrumb.js
export { CommandPalette } from "./organisms/command-palette.js";
export type { CommandPaletteProps, CommandItem, CommandCategory } from "./organisms/command-palette.js";
export { MobileBottomNav } from "./organisms/mobile-bottom-nav.js";
export type { MobileBottomNavProps, MobileNavItem, QuickActionItem } from "./organisms/mobile-bottom-nav.js";
export { OnboardingWizard, WelcomeStep, ProfileStep, PreferencesStep, CompletionStep } from "./organisms/onboarding-wizard.js";
export type { OnboardingStep, OnboardingStepProps, OnboardingWizardProps } from "./organisms/onboarding-wizard.js";
export { AppSwitcher, PLATFORM_APPS } from "./components/AppSwitcher.js";
export type { AppSwitcherProps, AppConfig } from "./components/AppSwitcher.js";
export { CookieConsentBanner } from "./organisms/cookie-consent-banner.js";
export type { CookieConsentBannerProps, CookiePreferences } from "./organisms/cookie-consent-banner.js";
export { AgeVerificationModal, useAgeVerification } from "./molecules/age-verification-modal.js";
export type { AgeVerificationModalProps } from "./molecules/age-verification-modal.js";
export { PrivacyPreferenceCenter, defaultConsentCategories } from "./organisms/privacy-preference-center.js";
export type { PrivacyPreferenceCenterProps, ConsentCategory } from "./organisms/privacy-preference-center.js";
export { AuditTimeline } from "./organisms/audit-timeline.js";
export type { AuditTimelineProps, AuditEvent, AuditEventType, AuditFieldChange } from "./organisms/audit-timeline.js";
export { CustomFieldRenderer, CustomFieldGroup } from "./organisms/custom-field-renderer.js";
export type { CustomFieldRendererProps, CustomFieldGroupProps, CustomFieldDefinition, CustomFieldType, CustomFieldOption, FieldPermission } from "./organisms/custom-field-renderer.js";
export { BulkEditModal } from "./organisms/bulk-edit-modal.js";
export type { BulkEditModalProps, BulkEditField } from "./organisms/bulk-edit-modal.js";
export { SavedFilterBuilder } from "./organisms/saved-filter-builder.js";
export type { SavedFilterBuilderProps, FilterField as SavedFilterField, FilterCondition, FilterGroup as SavedFilterGroup, FilterOperator, FilterLogic, SavedFilter } from "./organisms/saved-filter-builder.js";

// =============================================================================
// TEMPLATES - Page-level layouts
// =============================================================================
export { PageLayout } from "./templates/page-layout.js";
export type { PageLayoutProps } from "./templates/page-layout.js";
// SectionLayout removed - use Section from foundations/layout instead
// AppShell removed - use AuthenticatedShell instead
export { AuthenticatedShell } from "./templates/authenticated-shell.js";
export type { AuthenticatedShellProps, ContextOptions } from "./templates/authenticated-shell.js";
// BreadcrumbContextItem exported from ./types/breadcrumb.js
export { ListPage } from "./templates/list-page.js";
export type { ListPageProps, ListPageColumn, ListPageFilter, ListPageAction, ListPageBulkAction } from "./templates/list-page.js";
export { ErrorPage, ErrorContent } from "./templates/error-page.js";
export type { ErrorPageProps, ErrorContentProps } from "./templates/error-page.js";
export { NotFoundPage, NotFoundContent } from "./templates/not-found-page.js";
export type { NotFoundPageProps, NotFoundContentProps } from "./templates/not-found-page.js";
export { DashboardPage } from "./templates/dashboard-page.js";
export type { DashboardPageProps } from "./templates/dashboard-page.js";
export { DetailPage } from "./templates/detail-page.js";
export type { DetailPageProps, DetailPageTab } from "./templates/detail-page.js";
export { CreatePage } from "./templates/create-page.js";
export type { CreatePageProps, FormSection } from "./templates/create-page.js";
export { EditPage } from "./templates/edit-page.js";
export type { EditPageProps, EditFormSection, EditBreadcrumbItem } from "./templates/edit-page.js";
export { WizardPage } from "./templates/wizard-page.js";
export type { WizardPageProps, WizardStep, WizardBanner } from "./templates/wizard-page.js";
export { SettingsHubPage, SettingsPageLayout } from "./templates/settings-hub-page.js";
export type { SettingsHubPageProps, SettingsPageLayoutProps, SettingsSection, SettingsCategory } from "./templates/settings-hub-page.js";
export { AuthPage } from "./templates/auth-page.js";
export type { AuthPageProps } from "./templates/auth-page.js";
export { SignInForm } from "./templates/sign-in-form.js";
export type { SignInFormProps } from "./templates/sign-in-form.js";
export { MarketingPage } from "./templates/marketing-page.js";
export type { MarketingPageProps, MarketingSection } from "./templates/marketing-page.js";
export { 
  MainContent, 
  SplitLayout as EnterpriseSplitLayout, 
  PanelLayout, 
  Toolbar, 
  ContentSection, 
  KanbanLayout, 
  KanbanCard 
} from "./templates/content-layout.js";
export type { 
  ContentLayoutProps, 
  MainContentProps, 
  SplitLayoutProps as EnterpriseSplitLayoutProps, 
  PanelLayoutProps, 
  ToolbarProps, 
  ContentSectionProps, 
  KanbanColumn, 
  KanbanLayoutProps, 
  KanbanCardProps 
} from "./templates/content-layout.js";

// =============================================================================
// SHARED TYPES - Canonical types used across components
// =============================================================================
export type { BreadcrumbItem, BreadcrumbContextItem } from "./types/breadcrumb.js";

// =============================================================================
// FOUNDATIONS - Layout primitives
// =============================================================================
export { Container, Section, Grid, Stack } from "./foundations/layout.js";
export type { SectionProps } from "./foundations/layout.js";
export { Main, Header, Article, Aside, Nav, Figure, Box, GridOverlay } from "./foundations/semantic.js";
export {
  MarketingPageHeader,
  PageContent,
  PageFooter,
  SplitLayout,
  FullBleedSection,
  ContentRegion,
} from "./foundations/page-regions.js";
export type {
  MarketingPageHeaderProps,
  PageContentProps,
  PageFooterProps,
  SplitLayoutProps,
  FullBleedSectionProps,
  ContentRegionProps,
} from "./foundations/page-regions.js";

// =============================================================================
// UTILS - Utility functions
// =============================================================================
export * from "./utils/fonts.js";
export * from "./utils/auth.js";
export * from "./utils/seo.js";
export * from "./utils/analytics.js";
export * from "./utils/accessibility.js";
export * from "./utils/performance.js";
export * from "./utils/validation.js";
export * from "./utils/format.js";
export * from "./utils/screen-reader.js";

// =============================================================================
// HOOKS - Custom React hooks
// =============================================================================
export * from "./hooks/index.js";

// =============================================================================
// MARKETING - Landing page section components (2026 Best Practices)
// =============================================================================
export * from "./marketing/index.js";
