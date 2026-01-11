/**
 * Quick Info Bar Component
 * Sticky bar showing key experience details at a glance
 */

'use client';

import React from 'react';
import type { QuickInfoBarProps } from './types';
import { Container } from './container';
import './quick-info-bar.css';

export function QuickInfoBar({ experience }: QuickInfoBarProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="quick-info-bar">
      <Container>
        <div className="quick-info-bar__grid">
          {/* Location */}
          <div className="quick-info-bar__item">
            <div className="quick-info-bar__icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="quick-info-bar__content">
              <div className="quick-info-bar__label">Location</div>
              <div className="quick-info-bar__value">
                {experience.location.city}, {experience.location.country}
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="quick-info-bar__item">
            <div className="quick-info-bar__icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="quick-info-bar__content">
              <div className="quick-info-bar__label">Duration</div>
              <div className="quick-info-bar__value">
                {experience.duration} {experience.duration === 1 ? 'day' : 'days'}
              </div>
            </div>
          </div>

          {/* Group Size */}
          <div className="quick-info-bar__item">
            <div className="quick-info-bar__icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="quick-info-bar__content">
              <div className="quick-info-bar__label">Group Size</div>
              <div className="quick-info-bar__value">
                {experience.groupSize.min}-{experience.groupSize.max} guests
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="quick-info-bar__item">
            <div className="quick-info-bar__icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="quick-info-bar__content">
              <div className="quick-info-bar__label">Rating</div>
              <div className="quick-info-bar__value">
                {experience.rating.average.toFixed(1)}{' '}
                <span className="quick-info-bar__rating-count">
                  ({experience.rating.count} reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="quick-info-bar__item quick-info-bar__item--price">
            <div className="quick-info-bar__icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="quick-info-bar__content">
              <div className="quick-info-bar__label">From</div>
              <div className="quick-info-bar__value quick-info-bar__price">
                {formatCurrency(
                  experience.pricing.startingPrice,
                  experience.pricing.currency
                )}
                <span className="quick-info-bar__price-unit">/person</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

QuickInfoBar.displayName = 'QuickInfoBar';
