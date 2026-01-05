// Design System Tokens
export * from "./tokens.js";

// =============================================================================
// ATOMS - Basic building blocks
// =============================================================================
export { Display, H1, H2, H3, H4, H5, H6, Body, Label, displayVariants, headingVariants, bodyVariants, labelVariants } from "./atoms/Typography/index.js";
export type { DisplayProps, HeadingProps, BodyProps, LabelProps } from "./atoms/Typography/index.js";
export { Button, buttonVariants } from "./atoms/Button/index.js";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./atoms/Button/index.js";
export { Input, InputGroup, inputVariants } from "./atoms/Input/index.js";
export type { InputProps, InputGroupProps, InputSizeVariant } from "./atoms/Input/index.js";
export { PhoneInput, phoneValidation, emailValidation, COUNTRY_CODES } from "./atoms/PhoneInput/index.js";
export type { PhoneInputProps, CountryCode } from "./atoms/PhoneInput/index.js";
export { AddressInput, addressValidation } from "./atoms/AddressInput/index.js";
export type { AddressInputProps, AddressData } from "./atoms/AddressInput/index.js";
export { PasswordInput } from "./atoms/PasswordInput/index.js";
export type { PasswordInputProps } from "./atoms/PasswordInput/PasswordInput.types.js";
export { PasswordRequirements } from "./atoms/PasswordRequirements/index.js";
export type { PasswordRequirementsProps, PasswordRequirement } from "./atoms/PasswordRequirements/PasswordRequirements.types.js";
export { AuthCheckbox } from "./atoms/AuthCheckbox/index.js";
export type { AuthCheckboxProps } from "./atoms/AuthCheckbox/AuthCheckbox.types.js";
export { AuthDivider } from "./atoms/AuthDivider/index.js";
export type { AuthDividerProps } from "./atoms/AuthDivider/AuthDivider.types.js";
export { Textarea, TextareaGroup, textareaVariants } from "./atoms/Textarea/index.js";
export type { TextareaProps, TextareaGroupProps } from "./atoms/Textarea/index.js";
export { Select, SelectGroup, selectVariants } from "./atoms/Select/index.js";
export type { SelectProps, SelectGroupProps } from "./atoms/Select/index.js";
export { Checkbox, checkboxVariants } from "./atoms/Checkbox/index.js";
export type { CheckboxProps } from "./atoms/Checkbox/index.js";
export { Radio, radioVariants } from "./atoms/Radio/index.js";
export type { RadioProps } from "./atoms/Radio/index.js";
export { Form } from "./atoms/Form/index.js";
export type { FormProps } from "./atoms/Form/index.js";
export { Switch, switchTrackVariants, switchThumbVariants } from "./atoms/Switch/index.js";
export type { SwitchProps } from "./atoms/Switch/index.js";
export { Badge, badgeVariants } from "./atoms/Badge/index.js";
export type { BadgeProps, BadgeVariant } from "./atoms/Badge/index.js";
export { StatusBadge } from "./atoms/StatusBadge/index.js";
export type { StatusBadgeProps } from "./atoms/StatusBadge/index.js";
export { Divider } from "./atoms/Divider/index.js";
export type { DividerProps } from "./atoms/Divider/index.js";
export { SocialAuthButtonGroup } from "./atoms/SocialAuthButtonGroup/index.js";
export type { SocialAuthButtonGroupProps, SocialAuthProvider } from "./atoms/SocialAuthButtonGroup/SocialAuthButtonGroup.types.js";
export { Tab } from "./atoms/Tab/index.js";
export type { TabProps } from "./atoms/Tab/Tab.types.js";
export { TabPanel } from "./atoms/TabPanel/index.js";
export type { TabPanelProps } from "./atoms/TabPanel/TabPanel.types.js";
export { AIChatSuggestionChip } from "./atoms/AIChatSuggestionChip/index.js";
export type { AIChatSuggestionChipProps } from "./atoms/AIChatSuggestionChip/AIChatSuggestionChip.types.js";
export { FooterLink } from "./atoms/FooterLink/index.js";
export type { FooterLinkProps } from "./atoms/FooterLink/FooterLink.types.js";
export { Spinner, spinnerVariants, spinnerContainerVariants, spinnerTextVariants } from "./atoms/Spinner/index.js";
export type { SpinnerProps } from "./atoms/Spinner/index.js";
export { ProgressBar, progressBarTrackVariants, progressBarFillVariants, progressBarLabelVariants } from "./atoms/ProgressBar/index.js";
export type { ProgressBarProps } from "./atoms/ProgressBar/index.js";
export { Link, linkVariants } from "./atoms/Link/index.js";
export type { LinkProps } from "./atoms/Link/index.js";
export { List, ListItem } from "./atoms/List/index.js";
export type { ListProps, ListItemProps } from "./atoms/List/index.js";
export {
  Icon,
  IconBox,
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
  iconVariants,
} from "./atoms/Icon/index.js";
export type { IconProps, IconBoxProps } from "./atoms/Icon/index.js";
export { SocialIcon } from "./atoms/SocialIcon/index.js";
export type { SocialIconProps } from "./atoms/SocialIcon/index.js";
export { Countdown } from "./atoms/Countdown/index.js";
export type { CountdownProps } from "./atoms/Countdown/index.js";
export { Kicker } from "./atoms/Kicker/index.js";
export type { KickerProps } from "./atoms/Kicker/index.js";
export { HalftonePattern, HeroHalftone, GridPattern } from "./atoms/HalftonePattern/index.js";
export type { HalftonePatternProps } from "./atoms/HalftonePattern/index.js";
export { Avatar, AvatarGroup, avatarVariants, avatarStatusVariants } from "./atoms/Avatar/index.js";
export type { AvatarProps, AvatarGroupProps } from "./atoms/Avatar/index.js";
export { Tooltip, tooltipVariants } from "./atoms/Tooltip/index.js";
export type { TooltipProps } from "./atoms/Tooltip/index.js";
export { DuotoneImage, ImageWithOverlay } from "./atoms/DuotoneImage/index.js";
export type { DuotoneImageProps, ImageWithOverlayProps } from "./atoms/DuotoneImage/index.js";
export { PageTransition, StaggeredTransition } from "./atoms/PageTransition/index.js";
export type { PageTransitionProps, StaggeredTransitionProps } from "./atoms/PageTransition/index.js";
export { GeometricShape, GeometricPattern } from "./atoms/GeometricShapes/index.js";
export type { GeometricShapeProps, GeometricPatternProps } from "./atoms/GeometricShapes/index.js";
export { MaskedInput } from "./atoms/MaskedInput/index.js";
export type { MaskedInputProps } from "./atoms/MaskedInput/index.js";
export { Sparkline } from "./atoms/Sparkline/index.js";
export type { SparklineProps } from "./atoms/Sparkline/index.js";
export { SuccessAnimation } from "./atoms/SuccessAnimation/index.js";
export type { SuccessAnimationProps } from "./atoms/SuccessAnimation/index.js";
export { Text } from "./atoms/Text/index.js";
export type { TextProps } from "./atoms/Text/index.js";
export { UrgencyBadge } from "./atoms/UrgencyBadge/index.js";
export type { UrgencyBadgeProps } from "./atoms/UrgencyBadge/index.js";

// Views (New ClickUp-style implementations)
export {
  TableView,
  BaseViewProps,
  ViewFilter,
  ViewSort,
  GroupConfig,
  EmptyStateConfig,
  EntityType,
  Task,
  Project,
  User,
  TaskStatus,
  TaskPriority,
  ProjectStatus,
  UserRole,
  UserStatus,
  ActivityLog,
  ActivityAction,
  WhiteboardElement,
  WhiteboardElementType,
  Document,
  DocumentComment,
  TableViewProps,
  TableColumn,
  TableRowData,
  KanbanBoardProps,
  KanbanColumn,
  KanbanSwimlane,
  CalendarView,
  CalendarViewProps,
  CalendarViewMode,
  CalendarEvent,
  CalendarDay,
  CalendarWeek,
  CalendarMonth,
  TimeSlot,
  GanttChart,
  GanttChartProps,
  GanttViewMode,
  GanttTask,
  GanttMilestone,
  GanttDependency,
  GanttTimeline,
  GanttRow,
  GanttColumn,
  GanttChartState,
  TimelineView,
  TimelineViewProps,
  TimelineGrouping,
  TimelineFilter,
  TimelineDateRange,
  TimelineConnector,
  TimelineLayout,
  TimelineViewState
} from "./organisms/Views/index.js";
export { VirtualizedList } from "./molecules/VirtualizedList/index.js";
export type { VirtualizedListProps } from "./molecules/VirtualizedList/VirtualizedList.types.js";
// Whitelabel infrastructure exports (namespaced to avoid collision with legacy theme provider)
export {
  ThemeProvider as WhitelabelThemeProvider,
  useTheme as useWhitelabelTheme,
  useBrand,
  useTokens,
  useColorMode,
} from "./whitelabel/theme-provider.js";
export { Logo as WhitelabelLogo } from "./whitelabel/logo.js";
export { PoweredBy as WhitelabelPoweredBy } from "./whitelabel/powered-by.js";
export type { ColorMode as WhitelabelColorMode } from "./whitelabel/theme-provider.js";
export type { BrandConfig, DesignTokens } from "./design-system/tokens/types.js";
export type { TenantBrandConfig } from "./whitelabel/tenant-config.schema.js";

// =============================================================================
// MOLECULES - Composed components
// =============================================================================
export { Field, fieldVariants } from "./molecules/Field/index.js";
export type { FieldProps } from "./molecules/Field/index.js";
export { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter, cardVariants } from "./molecules/Card/index.js";
export type { CardProps, CardHeaderProps, CardTitleProps, CardDescriptionProps, CardBodyProps, CardFooterProps, CardVariant } from "./molecules/Card/index.js";
export { ButtonGroup, buttonGroupVariants } from "./molecules/ButtonGroup/index.js";
export type { ButtonGroupProps } from "./molecules/ButtonGroup/index.js";
export { StatCard, statCardVariants } from "./molecules/StatCard/index.js";
export type { StatCardProps } from "./molecules/StatCard/index.js";
export { Alert, alertVariants } from "./molecules/Alert/index.js";
export type { AlertProps } from "./molecules/Alert/index.js";
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, tableVariants } from "./molecules/Table/index.js";
export type { TableProps, TableVariant, TableHeaderProps, TableBodyProps, TableRowProps, TableHeadProps, TableCellProps } from "./molecules/Table/index.js";
export { ScrollableTableWrapper } from "./molecules/ScrollableTableWrapper/index.js";
export type { ScrollableTableWrapperProps } from "./molecules/ScrollableTableWrapper/ScrollableTableWrapper.types.js";
export { Pagination, PaginationItem, paginationVariants } from "./molecules/Pagination/index.js";
export type { PaginationProps, PaginationItemProps } from "./molecules/Pagination/index.js";
export { Breadcrumb, BreadcrumbItem, breadcrumbVariants } from "./molecules/Breadcrumb/index.js";
export type { BreadcrumbProps, BreadcrumbItemProps } from "./molecules/Breadcrumb/index.js";
// BreadcrumbItem type exported from ./types/breadcrumb.js
export { Tabs, TabsList, TabsTrigger, TabsContent, TabsPanel, tabsVariants } from "./molecules/Tabs/index.js";
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps, TabsPanelProps } from "./molecules/Tabs/index.js";
export { Dropdown, DropdownItem, DropdownMenu, dropdownVariants } from "./molecules/Dropdown/index.js";
export type { DropdownProps, DropdownItemProps } from "./molecules/Dropdown/index.js";
export { Newsletter, newsletterVariants } from "./molecules/Newsletter/index.js";
export type { NewsletterProps } from "./molecules/Newsletter/index.js";
export { ProjectCard } from "./molecules/ProjectCard/index.js";
export type { ProjectCardProps } from "./molecules/ProjectCard/ProjectCard.types.js";
export { ServiceCard, serviceCardVariants } from "./molecules/ServiceCard/index.js";
export type { ServiceCardProps } from "./molecules/ServiceCard/index.js";
export { EmptyState, emptyStateVariants } from "./molecules/EmptyState/index.js";
export type { EmptyStateProps } from "./molecules/EmptyState/index.js";
export { AIChatMessage, AIChatMessageActions, AIChatTypingIndicator } from "./molecules/AIChatMessage/index.js";
export type { AIChatMessageProps, AIChatMessageActionsProps, AIChatTypingIndicatorProps, MessageRole } from "./molecules/AIChatMessage/index.js";
export { ErrorState, errorStateVariants } from "./molecules/ErrorState/index.js";
export type { ErrorStateProps } from "./molecules/ErrorState/index.js";
export { Skeleton, SkeletonCard, SkeletonTable, skeletonVariants } from "./molecules/Skeleton/index.js";
export { NotificationToast } from "./molecules/NotificationToast/index.js";
export type { NotificationToastProps, Toast } from "./molecules/NotificationToast/NotificationToast.types.js";
export { EventCard, eventCardVariants } from "./molecules/EventCard/index.js";
export type { EventCardProps } from "./molecules/EventCard/index.js";
export { TicketCard, ticketCardVariants } from "./molecules/TicketCard/index.js";
export type { TicketCardProps } from "./molecules/TicketCard/index.js";
export { CrewCard, crewCardVariants } from "./molecules/CrewCard/index.js";
export type { CrewCardProps } from "./molecules/CrewCard/index.js";
// DataTable removed - use DataGrid from organisms for full-featured tables
export { SearchFilter, searchFilterVariants } from "./molecules/SearchFilter/index.js";
export type { SearchFilterProps, FilterGroup, FilterOption, FilterPreset } from "./molecules/SearchFilter/index.js";
export { PriceDisplay, PriceRange, formatPrice } from "./molecules/PriceDisplay/index.js";
export type { PriceDisplayProps, PriceRangeProps } from "./molecules/PriceDisplay/PriceDisplay.types.js";
export { Stepper, stepperVariants } from "./molecules/Stepper/index.js";
export type { StepperProps, StepperOrientation, StepperSize } from "./molecules/Stepper/index.js";
export { FileUpload, fileUploadVariants } from "./molecules/FileUpload/index.js";
export type { FileUploadProps, UploadedFile } from "./molecules/FileUpload/index.js";
export { Timeline, timelineVariants } from "./molecules/Timeline/index.js";
export type { TimelineProps, TimelineItem, TimelineItemStatus, TimelineOrientation, TimelineItemUser } from "./molecules/Timeline/index.js";
export { LanguageSelector, languageSelectorVariants } from "./molecules/LanguageSelector/index.js";
export type { LanguageSelectorProps, Language } from "./molecules/LanguageSelector/index.js";
export { OfflineIndicator } from "./molecules/OfflineIndicator/index.js";
export type { OfflineIndicatorProps } from "./molecules/OfflineIndicator/OfflineIndicator.types.js";
export { VideoPlayer } from "./molecules/VideoPlayer/index.js";
export type { VideoPlayerProps } from "./molecules/VideoPlayer/VideoPlayer.types.js";
export { ScrollReveal, scrollRevealVariants } from "./molecules/ScrollReveal/index.js";
export type { ScrollRevealProps } from "./molecules/ScrollReveal/ScrollReveal.types.js";
export { ConfirmDialog, confirmDialogVariants } from "./molecules/ConfirmDialog/index.js";
export type { ConfirmDialogProps, ConfirmDialogVariant } from "./molecules/ConfirmDialog/ConfirmDialog.types.js";
export { RowActions } from "./molecules/RowActions/index.js";
export type { RowActionsProps, RowAction } from "./molecules/RowActions/RowActions.types.js";
export { SectionHeader, sectionHeaderVariants } from "./molecules/SectionHeader/index.js";
export type { SectionHeaderProps } from "./molecules/SectionHeader/index.js";
export { ContentCard, contentCardVariants } from "./molecules/ContentCard/index.js";
export type { ContentCardProps } from "./molecules/ContentCard/index.js";
export { ContextBreadcrumb, contextBreadcrumbVariants } from "./molecules/ContextBreadcrumb/index.js";
export type { ContextBreadcrumbProps, ContextLevel, ContextItem } from "./molecules/ContextBreadcrumb/index.js";
export { CollaborativeField, collaborativeFieldVariants } from "./molecules/CollaborativeField/index.js";
export type { CollaborativeFieldProps, CollaborationUser } from "./molecules/CollaborativeField/index.js";
export { QuickAddFab, quickAddFabVariants } from "./molecules/QuickAddFab/index.js";
export type { QuickAddFabProps, QuickAddAction } from "./molecules/QuickAddFab/index.js";
export { SettingsRow, settingsRowVariants } from "./molecules/SettingsRow/index.js";
export type { SettingsRowProps } from "./molecules/SettingsRow/index.js";
export { DownloadTemplateButton, downloadTemplateButtonVariants } from "./molecules/DownloadTemplateButton/index.js";
export type { DownloadTemplateButtonProps } from "./molecules/DownloadTemplateButton/index.js";
// AI Chat Components - Message bubbles, input, conversation items
export { AIChatInput, aiChatInputVariants } from "./molecules/AIChatInput/index.js";
export type { AIChatInputProps } from "./molecules/AIChatInput/index.js";
export { AIChatConversationItem, AIChatConversationGroup, aiChatConversationItemVariants } from "./molecules/AIChatConversationItem/index.js";
export type { AIChatConversationItemProps, AIChatConversationGroupProps } from "./molecules/AIChatConversationItem/index.js";
export { AIChatEmptyState, aiChatEmptyStateVariants } from "./molecules/AIChatEmptyState/index.js";
export type { AIChatEmptyStateProps } from "./molecules/AIChatEmptyState/index.js";
// Auth Form Components - Specialized inputs for authentication flows
export {
  AuthInput,
  AuthFormField,
  AuthPasswordInput,
  authFormFieldVariants
} from "./molecules/AuthFormField/index.js";
export type {
  AuthInputProps,
  AuthFormFieldProps,
  AuthPasswordInputProps,
  AuthInputSize
} from "./molecules/AuthFormField/index.js";

// Age Verification Component
export { AgeVerificationModal, ageVerificationModalVariants } from "./molecules/AgeVerificationModal/index.js";
export type { AgeVerificationModalProps } from "./molecules/AgeVerificationModal/index.js";

// =============================================================================
// ORGANISMS - Complex components
// =============================================================================
export { Modal, ModalHeader, ModalBody, ModalFooter } from "./organisms/Modal/index.js";
export type { ModalProps } from "./organisms/Modal/Modal.types.js";
export { Navigation, NavLink } from "./organisms/Navigation/index.js";
export type { NavigationProps, NavLinkProps } from "./organisms/Navigation/Navigation.types.js";
// Sidebar components consolidated to AppSidebar - see app-sidebar.js exports below
export { Footer } from "./organisms/Footer/index.js";
export type { FooterProps } from "./organisms/Footer/Footer.types.js";
export { Hero } from "./organisms/Hero/index.js";
export type { HeroProps } from "./organisms/Hero/Hero.types.js";
export { FormWizard, FormStep } from "./organisms/FormWizard/index.js";
export type { FormWizardProps, FormStepProps } from "./organisms/FormWizard/FormWizard.types.js";
export { ImageGallery } from "./organisms/ImageGallery/index.js";
export type { ImageGalleryProps } from "./organisms/ImageGallery/ImageGallery.types.js";
export type { GalleryImage } from "./organisms/ImageGallery/ImageGallery.types.js";
export { ErrorBoundary } from "./organisms/ErrorBoundary/index.js";
export { ApiErrorBoundary } from "./organisms/ApiErrorBoundary/index.js";
export { NotificationProvider, useNotifications } from "./organisms/NotificationProvider/index.js";
export { SeatingChart } from "./organisms/SeatingChart/index.js";
export type { SeatingChartProps, Seat, Section as SeatingSection } from "./organisms/SeatingChart/SeatingChart.types.js";
export { Calendar } from "./organisms/Calendar/index.js";
export type { CalendarProps, CalendarEvent as CalendarMoleculeEvent } from "./organisms/Calendar/Calendar.types.js";
export { StatsDashboard, StatCard as DashboardStatCard } from "./organisms/StatsDashboard/index.js";
export type { StatsDashboardProps, Stat } from "./organisms/StatsDashboard/StatsDashboard.types.js";
export { Lightbox } from "./organisms/Lightbox/index.js";
export type { LightboxProps, LightboxImage } from "./organisms/Lightbox/Lightbox.types.js";
export { DetailDrawer } from "./organisms/DetailDrawer/index.js";
export type { DetailDrawerProps, DetailSection, DetailAction } from "./organisms/DetailDrawer/DetailDrawer.types.js";
export { DataGrid } from "./organisms/DataGrid/index.js";
export type { DataGridProps, DataGridColumn } from "./organisms/DataGrid/DataGrid.types.js";
export { DashboardBuilder } from "./organisms/DashboardBuilder/index.js";
export type { DashboardBuilderProps, DashboardConfig, WidgetConfig, WidgetType, WidgetSize } from "./organisms/DashboardBuilder/DashboardBuilder.types.js";
export { MapView } from "./organisms/MapView/index.js";
export type { MapViewProps, MapLocation } from "./organisms/MapView/MapView.types.js";
export { GalleryView } from "./organisms/GalleryView/index.js";
export type { GalleryViewProps, GalleryItem, GalleryLayout, GallerySize } from "./organisms/GalleryView/GalleryView.types.js";
export { RecordFormModal } from "./organisms/RecordFormModal/index.js";
export type { RecordFormModalProps, FormFieldConfig, FormStep as RecordFormStep, FieldType } from "./organisms/RecordFormModal/RecordFormModal.types.js";
export { ImportExportDialog } from "./organisms/ImportExportDialog/index.js";
export type { ImportExportDialogProps, ExportFormat, ColumnConfig, ImportTemplate } from "./organisms/ImportExportDialog/ImportExportDialog.types.js";
export { AppNavigation } from "./organisms/AppNavigation/index.js";
export type { AppNavigationProps, NavItem as AppNavItem } from "./organisms/AppNavigation/AppNavigation.types.js";
// Public Navbar - for public/marketing pages
export { PublicNavbar } from "./organisms/PublicNavbar/index.js";
export type { PublicNavbarProps, PublicNavItem } from "./organisms/PublicNavbar/PublicNavbar.types.js";
export { WorkflowTimeline } from "./organisms/WorkflowTimeline/index.js";
export type { WorkflowTimelineProps, WorkflowStage } from "./organisms/WorkflowTimeline/WorkflowTimeline.types.js";
export { ProtectedRoute } from "./organisms/ProtectedRoute/index.js";
export type { ProtectedRouteProps } from "./organisms/ProtectedRoute/ProtectedRoute.types.js";
export { ActivityFeed } from "./organisms/ActivityFeed/index.js";
export type { ActivityFeedProps, ActivityItem, ActivityUser, ActivityType } from "./organisms/ActivityFeed/index.js";
export { AppNavbar } from "./organisms/AppNavbar/index.js";
export type { AppNavbarProps, NavItem, NotificationItem, UserProfile } from "./organisms/AppNavbar/index.js";
export { AppSidebar } from "./organisms/AppSidebar/index.js";
export type { AppSidebarProps, SidebarItem, SidebarSection } from "./organisms/AppSidebar/index.js";
export { ContextSwitcher } from "./organisms/ContextSwitcher/index.js";
export { GlobalSearch } from "./organisms/GlobalSearch/index.js";
export type { GlobalSearchProps, SearchFilter as GlobalSearchFilter, SearchResult, SearchFacet, SavedSearch } from "./organisms/GlobalSearch/GlobalSearch.types.js";
export { AutomationBuilder } from "./organisms/AutomationBuilder/index.js";
export type { AutomationBuilderProps, AutomationWorkflow, TriggerConfig, ActionConfig, ConditionConfig, TriggerType, ActionType, ConditionOperator } from "./organisms/AutomationBuilder/AutomationBuilder.types.js";
export { KeyboardShortcutsModal } from "./organisms/KeyboardShortcutsModal/index.js";
export type { KeyboardShortcutsModalProps } from "./organisms/KeyboardShortcutsModal/KeyboardShortcutsModal.types.js";
// NotificationCenter is deprecated - use AppNavbar's integrated notification system instead
export { NotificationCenter, NotificationBell } from "./organisms/NotificationCenter/index.js";
export type { NotificationCenterProps, NotificationBellProps, Notification, NotificationType, NotificationPriority } from "./organisms/NotificationCenter/NotificationCenter.types.js";
export type { ContextSwitcherProps, ProductionContext } from "./organisms/ContextSwitcher/ContextSwitcher.types.js";
// AppPageHeader - Enterprise page header with breadcrumbs, tabs, views, actions
// Use this for authenticated app pages. For marketing pages, use MarketingPageHeader from foundations.
export { PageHeader as AppPageHeader } from "./organisms/PageHeader/index.js";
export type { PageHeaderProps as AppPageHeaderProps, TabItem, ViewOption } from "./organisms/PageHeader/PageHeader.types.js";
// BreadcrumbItem re-exported from page-header.js but canonical source is ./types/breadcrumb.js
export { CommandPalette } from "./organisms/CommandPalette/index.js";
export type { CommandPaletteProps, CommandItem, CommandCategory } from "./organisms/CommandPalette/CommandPalette.types.js";
export { MobileBottomNav } from "./organisms/MobileBottomNav/index.js";
export type { MobileBottomNavProps, MobileNavItem, QuickActionItem } from "./organisms/MobileBottomNav/MobileBottomNav.types.js";
export { OnboardingWizard, WelcomeStep, ProfileStep, PreferencesStep, CompletionStep } from "./organisms/OnboardingWizard/index.js";
export type { OnboardingStep, OnboardingStepProps, OnboardingWizardProps } from "./organisms/OnboardingWizard/OnboardingWizard.types.js";
export { AppSwitcher, PLATFORM_APPS } from "./components/AppSwitcher.js";
export type { AppSwitcherProps, AppConfig } from "./components/AppSwitcher.js";
export { CookieConsentBanner } from "./organisms/CookieConsentBanner/index.js";
export type { CookieConsentBannerProps, CookiePreferences } from "./organisms/CookieConsentBanner/CookieConsentBanner.types.js";
export { PrivacyPreferenceCenter, defaultConsentCategories } from "./organisms/PrivacyPreferenceCenter/index.js";
export type { PrivacyPreferenceCenterProps, ConsentCategory } from "./organisms/PrivacyPreferenceCenter/PrivacyPreferenceCenter.types.js";
export { AuditTimeline } from "./organisms/AuditTimeline/index.js";
export type { AuditTimelineProps, AuditEvent, AuditEventType, AuditFieldChange } from "./organisms/AuditTimeline/AuditTimeline.types.js";
export { CustomFieldRenderer, CustomFieldGroup } from "./organisms/CustomFieldRenderer/index.js";
export type { CustomFieldRendererProps, CustomFieldGroupProps, CustomFieldDefinition, CustomFieldType, CustomFieldOption, FieldPermission } from "./organisms/CustomFieldRenderer/CustomFieldRenderer.types.js";
export { BulkEditModal } from "./organisms/BulkEditModal/index.js";
export type { BulkEditModalProps, BulkEditField } from "./organisms/BulkEditModal/BulkEditModal.types.js";
export { SavedFilterBuilder } from "./organisms/SavedFilterBuilder/index.js";
export type { SavedFilterBuilderProps, FilterField as SavedFilterField, FilterCondition, FilterGroup as SavedFilterGroup, FilterOperator, FilterLogic, SavedFilter } from "./organisms/SavedFilterBuilder/SavedFilterBuilder.types.js";
export { SettingsGroup } from "./molecules/SettingsGroup/index.js";
export type { SettingsGroupProps } from "./molecules/SettingsGroup/SettingsGroup.types.js";
export { AIChatSuggestionChips } from "./molecules/AIChatSuggestionChips/index.js";
export type { AIChatSuggestionChipsProps } from "./molecules/AIChatSuggestionChips/AIChatSuggestionChips.types.js";
export { FooterColumn } from "./molecules/FooterColumn/index.js";
export type { FooterColumnProps } from "./molecules/FooterColumn/FooterColumn.types.js";
export { StaggerChildren } from "./molecules/StaggerChildren/index.js";
export type { StaggerChildrenProps } from "./molecules/StaggerChildren/StaggerChildren.types.js";

// =============================================================================
// TEMPLATES - Page-level layouts
// =============================================================================
export { AuthenticatedShell } from "./templates/AuthenticatedShell/index.js";
export type { AuthenticatedShellProps } from "./templates/AuthenticatedShell/AuthenticatedShell.types.js";
export { ListPage } from "./templates/ListPage/index.js";
export type { ListPageProps, ListPageColumn, ListPageAction, ViewConfig, ViewIconType } from "./templates/ListPage/ListPage.types.js";
export { DashboardPage } from "./templates/DashboardPage/index.js";
export type { DashboardPageProps } from "./templates/DashboardPage/DashboardPage.types.js";
export { DetailPage } from "./templates/DetailPage/index.js";
export type { DetailPageProps, DetailPageTab } from "./templates/DetailPage/DetailPage.types.js";
export { CreatePage, EditPage, HubPage, WizardPage, SettingsPageLayout, SettingsHubPage, MarketingPage, PageLayout } from "./templates/index.js";
export type { CreatePageProps, EditPageProps, HubPageProps, HubItem, WizardPageProps, WizardStep, SettingsPageLayoutProps, SettingsSection, SettingsHubPageProps, MarketingPageProps, PageLayoutProps, FormSection } from "./templates/index.js";
export { AuthPage } from "./templates/AuthPage/index.js";
export type { AuthPageProps } from "./templates/AuthPage/AuthPage.types.js";
export { AuthSplitLayout } from "./templates/AuthSplitLayout/index.js";
export type { AuthSplitLayoutProps } from "./templates/AuthSplitLayout/AuthSplitLayout.types.js";
export { AIChatLayout, AIChatHeader, AIChatSidebar, AIChatMain, AIChatArtifact } from "./templates/AIChatLayout/index.js";
export { AIChatLayoutProvider, useAIChatLayout } from "./templates/AIChatLayout/index.js";
export type { AIChatLayoutProps, AIChatHeaderProps, AIChatSidebarProps, AIChatMainProps, AIChatArtifactProps } from "./templates/AIChatLayout/AIChatLayout.types.js";
export { CanvasLayout } from "./templates/CanvasLayout/index.js";
export type { CanvasLayoutProps } from "./templates/CanvasLayout/CanvasLayout.types.js";
export { CenteredLayout } from "./templates/CenteredLayout/index.js";
export type { CenteredLayoutProps } from "./templates/CenteredLayout/CenteredLayout.types.js";
export { ClientPortalShell } from "./templates/ClientPortalShell/index.js";
export type { ClientPortalShellProps } from "./templates/ClientPortalShell/ClientPortalShell.types.js";
export { MainContent, SplitLayout as ContentSplitLayout, PanelLayout, Toolbar, ContentSection, KanbanLayout, KanbanCard } from "./templates/ContentLayout/index.js";
export type { ContentLayoutProps, SplitLayoutProps as ContentSplitLayoutProps, PanelLayoutProps, ToolbarProps, ContentSectionProps, KanbanLayoutProps, KanbanCardProps } from "./templates/ContentLayout/ContentLayout.types.js";

// =============================================================================
// SHARED TYPES - Canonical types used across components
// =============================================================================
// BreadcrumbItem type is now exported from ./molecules/Breadcrumb/index.js

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
// PROVIDERS - Context providers
// =============================================================================
export { ThemeProvider, useTheme, useThemeSafe } from "./providers/theme-provider.js";

// =============================================================================
// THEME - Theme utilities and components
// =============================================================================
export { ThemeScript } from "./components/theme-script.js";
export { ThemeToggle } from "./components/theme-toggle.js";

// =============================================================================
// MARKETING - Landing page section components (2026 Best Practices)
// =============================================================================
export * from "./marketing/index.js";

// =============================================================================
// NAVIGATION - Navigation utilities and components
// =============================================================================
export * from "./navigation/index.js";
