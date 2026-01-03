"use client";

import { forwardRef, useState } from "react";
import clsx from "clsx";
import { Container, Stack } from "../foundations/layout.js";
import { Kicker } from "../atoms/kicker.js";
import { Body, H2 } from "../atoms/typography.js";
import { ChevronDown } from "lucide-react";

/**
 * FAQSection - Expandable FAQ accordion
 * 2026 Best Practices:
 * - Accessible accordion pattern
 * - Schema.org FAQ markup for SEO
 * - Smooth expand/collapse animations
 * Bold Contemporary Pop Art Adventure Design System
 */

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQSectionProps {
  /** Section kicker text */
  kicker?: string;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** FAQ items */
  faqs: FAQItem[];
  /** Allow multiple items open */
  allowMultiple?: boolean;
  /** 
   * Section theme variant
   * - "dark": Force dark theme (default)
   * - "light": Force light theme
   * - "inverted": Invert relative to page theme
   */
  sectionVariant?: "dark" | "light" | "inverted";
  /** Layout variant */
  variant?: "default" | "two-column";
  className?: string;
}

function FAQAccordionItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-center justify-between text-left group"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${faq.id}`}
      >
        <Body className="text-text-primary font-semibold pr-4 group-hover:text-primary transition-colors">
          {faq.question}
        </Body>
        <ChevronDown
          className={clsx(
            "size-5 text-text-muted flex-shrink-0 transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        id={`faq-answer-${faq.id}`}
        className={clsx(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-96 pb-6" : "max-h-0"
        )}
      >
        <Body className="text-text-muted leading-relaxed">{faq.answer}</Body>
      </div>
    </div>
  );
}

export const FAQSection = forwardRef<HTMLElement, FAQSectionProps>(
  function FAQSection(
    {
      kicker,
      title,
      description,
      faqs,
      allowMultiple = false,
      sectionVariant = "dark",
      variant = "default",
      className,
    },
    ref
  ) {
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    const sectionVariantClasses = {
      dark: "section-dark bg-surface-primary",
      light: "section-light bg-surface-primary",
      inverted: "section-inverted bg-surface-primary",
    };

    const toggleItem = (id: string) => {
      setOpenItems((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          if (!allowMultiple) {
            next.clear();
          }
          next.add(id);
        }
        return next;
      });
    };

    // Split FAQs for two-column layout
    const midpoint = Math.ceil(faqs.length / 2);
    const leftColumn = faqs.slice(0, midpoint);
    const rightColumn = faqs.slice(midpoint);

    return (
      <section
        ref={ref}
        className={clsx("py-12 sm:py-16 md:py-24 lg:py-32", sectionVariantClasses[sectionVariant], className)}
        itemScope
        itemType="https://schema.org/FAQPage"
      >
        <Container size="lg">
          {/* Section Header */}
          {(kicker || title || description) && (
            <Stack gap={4} className="mb-8 sm:mb-10 md:mb-12 text-center items-center">
              {kicker && <Kicker>{kicker}</Kicker>}
              {title && <H2 className="text-text-primary">{title}</H2>}
              {description && (
                <Body size="lg" className="text-text-muted max-w-2xl">
                  {description}
                </Body>
              )}
            </Stack>
          )}

          {/* FAQ Content */}
          {variant === "two-column" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                {leftColumn.map((faq) => (
                  <div
                    key={faq.id}
                    itemScope
                    itemProp="mainEntity"
                    itemType="https://schema.org/Question"
                  >
                    <FAQAccordionItem
                      faq={faq}
                      isOpen={openItems.has(faq.id)}
                      onToggle={() => toggleItem(faq.id)}
                    />
                    <meta itemProp="name" content={faq.question} />
                    <div
                      itemScope
                      itemProp="acceptedAnswer"
                      itemType="https://schema.org/Answer"
                    >
                      <meta itemProp="text" content={faq.answer} />
                    </div>
                  </div>
                ))}
              </div>
              <div>
                {rightColumn.map((faq) => (
                  <div
                    key={faq.id}
                    itemScope
                    itemProp="mainEntity"
                    itemType="https://schema.org/Question"
                  >
                    <FAQAccordionItem
                      faq={faq}
                      isOpen={openItems.has(faq.id)}
                      onToggle={() => toggleItem(faq.id)}
                    />
                    <meta itemProp="name" content={faq.question} />
                    <div
                      itemScope
                      itemProp="acceptedAnswer"
                      itemType="https://schema.org/Answer"
                    >
                      <meta itemProp="text" content={faq.answer} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                >
                  <FAQAccordionItem
                    faq={faq}
                    isOpen={openItems.has(faq.id)}
                    onToggle={() => toggleItem(faq.id)}
                  />
                  <meta itemProp="name" content={faq.question} />
                  <div
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <meta itemProp="text" content={faq.answer} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>
    );
  }
);

export default FAQSection;
