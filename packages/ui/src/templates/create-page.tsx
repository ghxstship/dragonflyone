"use client";

import { forwardRef, ReactNode } from "react";
import clsx from "clsx";
import { ArrowLeft, Save } from "lucide-react";
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

// =============================================================================
// TYPES
// =============================================================================

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  content: ReactNode;
}

// BreadcrumbItem imported from canonical types
import type { BreadcrumbItem } from "../types/breadcrumb.js";
export type { BreadcrumbItem } from "../types/breadcrumb.js";

export interface CreatePageProps {
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
  sections: FormSection[];
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
  /** Loading state */
  isLoading?: boolean;
  /** Loading text */
  loadingText?: string;
}

/**
 * CreatePage template - Bold Contemporary Pop Art Adventure
 * 
 * Standardized template for all "create new" / "add new" pages.
 * 
 * Features:
 * - EnterprisePageHeader with breadcrumbs
 * - Back navigation button
 * - Form sections with cards
 * - Submit/Cancel actions
 * - Loading and access denied states
 * - Dark-first design
 * 
 * @example
 * ```tsx
 * <CreatePage
 *   title="Create New Event"
 *   subtitle="Add a new event to your calendar"
 *   breadcrumbs={[{ label: 'Events', href: '/events' }, { label: 'New Event' }]}
 *   backHref="/events"
 *   sections={[
 *     { id: 'details', title: 'Event Details', icon: <Calendar />, content: <EventDetailsForm /> },
 *     { id: 'venue', title: 'Venue', content: <VenueForm /> },
 *   ]}
 *   onSubmit={handleSubmit}
 *   isSubmitting={isSubmitting}
 * />
 * ```
 */
export const CreatePage = forwardRef<HTMLDivElement, CreatePageProps>(
  function CreatePage(
    {
      title,
      subtitle,
      breadcrumbs,
      backHref,
      backLabel = "Back",
      sections,
      onSubmit,
      submitLabel = "Create",
      cancelLabel = "Cancel",
      onCancel,
      isSubmitting = false,
      isValid = true,
      headerActions,
      showFavorite = false,
      showSettings = false,
      inverted = true,
      className,
      accessDenied,
      isLoading = false,
      loadingText = "Loading...",
    },
    ref
  ) {
    const bgClass = inverted ? "bg-surface-inverse" : "bg-surface-primary";

    // Loading state
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
              <Stack gap={6} className="items-center justify-center py-16">
                <Spinner size="lg" />
                <Body className={inverted ? "text-text-muted" : "text-text-muted"}>
                  {loadingText}
                </Body>
              </Stack>
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
                              inverted ? "text-text-primary" : "text-text-primary"
                            )}
                          >
                            {section.title}
                          </Body>
                          {section.description && (
                            <Body
                              size="sm"
                              className={inverted ? "text-text-muted" : "text-text-muted"}
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
                <Stack direction="horizontal" gap={4} className="justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    inverted={inverted}
                    onClick={onCancel || (() => window.location.href = backHref)}
                    disabled={isSubmitting}
                  >
                    {cancelLabel}
                  </Button>
                  <Button
                    type="submit"
                    variant="solid"
                    disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Creating...
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
            </Form>
          </Container>
        </MainContent>
      </div>
    );
  }
);

export default CreatePage;
