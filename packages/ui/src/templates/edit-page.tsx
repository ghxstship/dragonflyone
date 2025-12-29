"use client";

import { forwardRef, ReactNode } from "react";
import type { BreadcrumbItem } from "../types/breadcrumb.js";
import clsx from "clsx";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Container, Stack } from "../foundations/layout.js";
import { PageHeader as EnterprisePageHeader } from "../organisms/page-header.js";
import { MainContent } from "./content-layout.js";
import { Card } from "../molecules/card.js";
import { Button } from "../atoms/button.js";
import { Form } from "../atoms/form.js";
import { Body } from "../atoms/typography.js";
import { Link } from "../atoms/link.js";
import { Spinner } from "../atoms/spinner.js";
import { EmptyState } from "../molecules/empty-state.js";
import { Skeleton } from "../molecules/skeleton.js";

// =============================================================================
// TYPES
// =============================================================================

export interface EditFormSection {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  content: ReactNode;
}

// EditBreadcrumbItem is an alias for canonical BreadcrumbItem
export type EditBreadcrumbItem = BreadcrumbItem;

export interface EditPageProps {
  /** Page title */
  title: string;
  /** Page subtitle/description */
  subtitle?: string;
  /** Breadcrumb navigation */
  breadcrumbs?: BreadcrumbItem[];
  /** Back button href */
  backHref: string;
  /** Back button label */
  backLabel?: string;
  /** Form sections */
  sections: EditFormSection[];
  /** Form submit handler */
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  /** Submit button label */
  submitLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Cancel handler (defaults to navigating to backHref) */
  onCancel?: () => void;
  /** Is form submitting */
  isSubmitting?: boolean;
  /** Is form valid (enables/disables submit) */
  isValid?: boolean;
  /** Has form been modified */
  isDirty?: boolean;
  /** Delete handler (if provided, shows delete button) */
  onDelete?: () => void | Promise<void>;
  /** Is delete in progress */
  isDeleting?: boolean;
  /** Delete button label */
  deleteLabel?: string;
  /** Delete confirmation message */
  deleteConfirmMessage?: string;
  /** Additional actions in header */
  headerActions?: ReactNode;
  /** Show favorite toggle */
  showFavorite?: boolean;
  /** Show settings button */
  showSettings?: boolean;
  /** Dark/light theme */
  inverted?: boolean;
  /** Custom className */
  className?: string;
  /** Access denied state */
  accessDenied?: {
    title: string;
    description: string;
    action?: { label: string; onClick: () => void };
  };
  /** Loading state (fetching entity data) */
  isLoading?: boolean;
  /** Loading text */
  loadingText?: string;
  /** Entity not found state */
  notFound?: {
    title: string;
    description: string;
    action?: { label: string; onClick: () => void };
  };
  /** Error state */
  error?: {
    title: string;
    description: string;
    onRetry?: () => void;
  };
}

/**
 * EditPage template - Bold Contemporary Pop Art Adventure
 * 
 * Standardized template for all "edit" pages with pre-populated form data.
 * 
 * Features:
 * - EnterprisePageHeader with breadcrumbs
 * - Back navigation button
 * - Form sections with cards
 * - Submit/Cancel/Delete actions
 * - Loading, error, not found, and access denied states
 * - Dirty state tracking
 * - Dark-first design
 * 
 * @example
 * ```tsx
 * <EditPage
 *   title="Edit Event"
 *   subtitle="Update event details"
 *   breadcrumbs={[
 *     { label: 'Events', href: '/events' },
 *     { label: event.name, href: `/events/${event.id}` },
 *     { label: 'Edit' }
 *   ]}
 *   backHref={`/events/${event.id}`}
 *   sections={[
 *     { id: 'details', title: 'Event Details', icon: <Calendar />, content: <EventDetailsForm /> },
 *     { id: 'venue', title: 'Venue', content: <VenueForm /> },
 *   ]}
 *   onSubmit={handleSubmit}
 *   onDelete={handleDelete}
 *   isSubmitting={isSubmitting}
 *   isDirty={isDirty}
 * />
 * ```
 */
export const EditPage = forwardRef<HTMLDivElement, EditPageProps>(
  function EditPage(
    {
      title,
      subtitle,
      breadcrumbs,
      backHref,
      backLabel = "Back",
      sections,
      onSubmit,
      submitLabel = "Save Changes",
      cancelLabel = "Cancel",
      onCancel,
      isSubmitting = false,
      isValid = true,
      isDirty = false,
      onDelete,
      isDeleting = false,
      deleteLabel = "Delete",
      headerActions,
      showFavorite = false,
      showSettings = false,
      inverted = true,
      className,
      accessDenied,
      isLoading = false,
      loadingText = "Loading...",
      notFound,
      error,
    },
    ref
  ) {
    const bgClass = inverted ? "bg-ink-950" : "bg-white";

    // Loading state with skeleton
    if (isLoading) {
      return (
        <div ref={ref} className={clsx("min-h-screen", bgClass, className)}>
          <EnterprisePageHeader
            title={title}
            subtitle={subtitle}
            breadcrumbs={breadcrumbs}
            inverted={inverted}
          />
          <MainContent padding="lg" inverted={inverted}>
            <Container>
              <Stack gap={6}>
                <Body variant={inverted ? "inverted" : "default"} className="text-center">{loadingText}</Body>
                <Skeleton className="h-10 w-48" />
                <Card inverted={inverted} className="p-6">
                  <Stack gap={4}>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-2/3" />
                  </Stack>
                </Card>
                <Card inverted={inverted} className="p-6">
                  <Stack gap={4}>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </Stack>
                </Card>
              </Stack>
            </Container>
          </MainContent>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div ref={ref} className={clsx("min-h-screen", bgClass, className)}>
          <EnterprisePageHeader
            title="Error"
            subtitle=""
            inverted={inverted}
          />
          <MainContent padding="lg" inverted={inverted}>
            <Container>
              <EmptyState
                title={error.title}
                description={error.description}
                action={error.onRetry ? { label: "Retry", onClick: error.onRetry } : undefined}
                inverted={inverted}
              />
            </Container>
          </MainContent>
        </div>
      );
    }

    // Not found state
    if (notFound) {
      return (
        <div ref={ref} className={clsx("min-h-screen", bgClass, className)}>
          <EnterprisePageHeader
            title="Not Found"
            subtitle=""
            inverted={inverted}
          />
          <MainContent padding="lg" inverted={inverted}>
            <Container>
              <EmptyState
                title={notFound.title}
                description={notFound.description}
                action={notFound.action}
                inverted={inverted}
              />
            </Container>
          </MainContent>
        </div>
      );
    }

    // Access denied state
    if (accessDenied) {
      return (
        <div ref={ref} className={clsx("min-h-screen", bgClass, className)}>
          <EnterprisePageHeader
            title="Access Denied"
            subtitle=""
            inverted={inverted}
          />
          <MainContent padding="lg" inverted={inverted}>
            <Container>
              <EmptyState
                title={accessDenied.title}
                description={accessDenied.description}
                action={accessDenied.action}
                inverted={inverted}
              />
            </Container>
          </MainContent>
        </div>
      );
    }

    return (
      <div ref={ref} className={clsx("min-h-screen", bgClass, className)}>
        <EnterprisePageHeader
          title={title}
          subtitle={subtitle}
          breadcrumbs={breadcrumbs}
          showFavorite={showFavorite}
          showSettings={showSettings}
          rightContent={headerActions}
          inverted={inverted}
        />
        <MainContent padding="lg" inverted={inverted}>
          <Container>
            <Form onSubmit={onSubmit}>
              <Stack gap={6}>
                {/* Back Button */}
                <Link href={backHref} className="inline-flex items-center gap-2 w-fit">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    inverted={inverted}
                    className="w-fit"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {backLabel}
                  </Button>
                </Link>

                {/* Form Sections */}
                {sections.map((section) => (
                  <Card key={section.id} inverted={inverted} className="p-6">
                    <Stack gap={4}>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        {section.icon && (
                          <div
                            className={clsx(
                              "p-2 rounded-avatar",
                              inverted ? "bg-primary/10" : "bg-primary/10"
                            )}
                          >
                            <div className="h-5 w-5 text-primary">
                              {section.icon}
                            </div>
                          </div>
                        )}
                        <Stack gap={0}>
                          <Body
                            className={clsx(
                              "font-display font-semibold text-h4-desktop",
                              inverted ? "text-white" : "text-ink-900"
                            )}
                          >
                            {section.title}
                          </Body>
                          {section.description && (
                            <Body
                              size="sm"
                              className={inverted ? "text-grey-400" : "text-grey-600"}
                            >
                              {section.description}
                            </Body>
                          )}
                        </Stack>
                      </Stack>
                      {section.content}
                    </Stack>
                  </Card>
                ))}

                {/* Actions */}
                <Stack direction="horizontal" gap={4} className="justify-between">
                  {/* Delete Button (left side) */}
                  <div>
                    {onDelete && (
                      <Button
                        type="button"
                        variant="outline"
                        inverted={inverted}
                        onClick={onDelete}
                        disabled={isSubmitting || isDeleting}
                        className="text-error border-error hover:bg-error/10"
                      >
                        {isDeleting ? (
                          <>
                            <Spinner size="sm" className="mr-2" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deleteLabel}
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Save/Cancel (right side) */}
                  <Stack direction="horizontal" gap={4}>
                    <Button
                      type="button"
                      variant="outline"
                      inverted={inverted}
                      onClick={onCancel || (() => window.location.href = backHref)}
                      disabled={isSubmitting || isDeleting}
                    >
                      {cancelLabel}
                    </Button>
                    <Button
                      type="submit"
                      variant="solid"
                      disabled={isSubmitting || isDeleting || !isValid || !isDirty}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {submitLabel}
                        </>
                      )}
                    </Button>
                  </Stack>
                </Stack>

                {/* Dirty state indicator */}
                {isDirty && (
                  <Body size="xs" className={inverted ? "text-grey-500" : "text-grey-400"}>
                    You have unsaved changes
                  </Body>
                )}
              </Stack>
            </Form>
          </Container>
        </MainContent>
      </div>
    );
  }
);

export default EditPage;
