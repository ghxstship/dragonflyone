/**
 * Inclusions Section Component
 * Display what's included and not included in the experience
 */

import React from 'react';
import type { Inclusions } from './types';
import './inclusions-section.css';

interface InclusionsSectionProps {
  inclusions: Inclusions;
}

export function InclusionsSection({ inclusions }: InclusionsSectionProps) {
  const hasIncluded = inclusions.included && inclusions.included.length > 0;
  const hasExcluded = inclusions.excluded && inclusions.excluded.length > 0;

  if (!hasIncluded && !hasExcluded) {
    return null;
  }

  return (
    <section className="inclusions-section" id="inclusions">
      <h2 className="inclusions-section__title">What's Included</h2>
      <p className="inclusions-section__subtitle">
        Everything you need to know about what's provided
      </p>

      <div className="inclusions-grid">
        {/* Included */}
        {hasIncluded && (
          <div className="inclusion-category">
            <div className="inclusion-category__header">
              <div className="inclusion-category__icon inclusion-category__icon--included">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="inclusion-category__title">Included</h3>
            </div>
            <ul className="inclusion-list">
              {inclusions.included.map((item) => (
                <li key={item.id} className="inclusion-item inclusion-item--included">
                  <svg
                    className="inclusion-item__icon"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="inclusion-item__text">{item.text}</span>
                  {item.category && (
                    <span className="inclusion-item__category">{item.category}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Not Included */}
        {hasExcluded && (
          <div className="inclusion-category">
            <div className="inclusion-category__header">
              <div className="inclusion-category__icon inclusion-category__icon--excluded">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <h3 className="inclusion-category__title">Not Included</h3>
            </div>
            <ul className="inclusion-list">
              {inclusions.excluded.map((item) => (
                <li key={item.id} className="inclusion-item inclusion-item--excluded">
                  <svg
                    className="inclusion-item__icon"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span className="inclusion-item__text">{item.text}</span>
                  {item.category && (
                    <span className="inclusion-item__category">{item.category}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

InclusionsSection.displayName = 'InclusionsSection';
