/**
 * FAQ Section Component
 * Accordion-style frequently asked questions
 */

'use client';

import React, { useState } from 'react';
import type { FAQItem } from './types';
import './faq-section.css';

interface FAQSectionProps {
  faq: FAQItem[];
}

export function FAQSection({ faq }: FAQSectionProps) {
  if (!faq || faq.length === 0) {
    return null;
  }

  return (
    <section className="faq-section" id="faq">
      <h2 className="faq-section__title">Frequently Asked Questions</h2>
      <p className="faq-section__subtitle">
        Find answers to common questions about this experience
      </p>

      <div className="faq-list">
        {faq.map((item) => (
          <FAQAccordionItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

interface FAQAccordionItemProps {
  item: FAQItem;
}

function FAQAccordionItem({ item }: FAQAccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}>
      <button
        className="faq-item__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="faq-item__question">{item.question}</span>
        <svg
          className="faq-item__icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div className="faq-item__content-wrapper">
        <div className="faq-item__content">
          <p className="faq-item__answer">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

FAQSection.displayName = 'FAQSection';
