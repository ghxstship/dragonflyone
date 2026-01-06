"use client";

import { forwardRef } from "react";
import clsx from "clsx";
import { ArrowLeft, Save } from "lucide-react";
import { createPageVariants, createPageHeaderVariants, createPageContentVariants } from "./CreatePage.variants.js";
import type { CreatePageProps } from "./CreatePage.types.js";

/**
 * CreatePage template - Standardized template for create/edit pages
 * 
 * @example
 * ```tsx
 * <CreatePage
 *   title="Create New Event"
 *   subtitle="Add a new event to your calendar"
 *   backHref="/events"
 *   sections={[
 *     { id: 'details', title: 'Event Details', content: <EventDetailsForm /> },
 *   ]}
 *   onSubmit={handleSubmit}
 * />
 * ```
 */
export const CreatePage = forwardRef<HTMLDivElement, CreatePageProps>(
  function CreatePage({
    title,
    subtitle,
    breadcrumbs,
    backHref,
    backLabel = "Back",
    sections,
    onSubmit,
    submitLabel = "Create",
    cancelLabel = "Cancel",
    cancelHref,
    loading = false,
    disabled = false,
    showSave = true,
    actions,
    headerActions,
    inverted = false,
    className,
    ...props
  }, ref) {
    const handleCancel = () => {
      if (cancelHref) {
        window.location.href = cancelHref;
      }
    };

    return (
      <div
        ref={ref}
        className={clsx(createPageVariants({ className }))}
        {...props}
      >
        {/* Header */}
        <header className={createPageHeaderVariants({})}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Back Button */}
                <a
                  href={backHref}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-secondary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {backLabel}
                </a>
                
                {/* Title */}
                <div>
                  <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
                  {subtitle && (
                    <p className="text-sm text-text-muted mt-1">{subtitle}</p>
                  )}
                </div>
              </div>
              
              {/* Header Actions */}
              {headerActions && (
                <div className="flex items-center gap-2">
                  {headerActions}
                </div>
              )}
            </div>
            
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-2 text-sm text-text-muted px-6 pb-4">
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {index > 0 && <span>/</span>}
                    {crumb.href ? (
                      <a href={crumb.href} className="hover:text-text-primary transition-colors">
                        {crumb.label}
                      </a>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                  </div>
                ))}
              </nav>
            )}
          </div>
        </header>

        {/* Content */}
        <main className={createPageContentVariants({})}>
          <div className="max-w-4xl mx-auto px-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Form Sections */}
              {sections.map((section) => (
                <div key={section.id} className="bg-surface-elevated border border-border rounded-lg p-6">
                  <div className="space-y-4">
                    {/* Section Header */}
                    <div className="flex items-center gap-3">
                      {section.icon && (
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {section.icon}
                        </div>
                      )}
                      <div>
                        <h2 className="text-lg font-semibold text-text-primary">{section.title}</h2>
                        {section.description && (
                          <p className="text-sm text-text-muted">{section.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Section Content */}
                    <div>{section.content}</div>
                  </div>
                </div>
              ))}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                {/* Additional Actions */}
                {actions}
                
                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-surface-secondary transition-colors disabled:opacity-50"
                >
                  {cancelLabel}
                </button>
                
                {/* Save Button */}
                {showSave && (
                  <button
                    type="submit"
                    disabled={loading || disabled}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    <Save className="w-4 h-4" />
                    {submitLabel}
                  </button>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }
);

export default CreatePage;
