/**
 * Host Profile Section Component
 * Showcase the experience organizer
 */

import React from 'react';
import type { Organizer } from './types';
import './host-profile-section.css';

interface HostProfileSectionProps {
  organizer: Organizer;
}

export function HostProfileSection({ organizer }: HostProfileSectionProps) {
  return (
    <section className="host-profile-section" id="host">
      <h2 className="host-profile-section__title">Meet Your Host</h2>

      <div className="host-profile-card">
        {/* Avatar & Basic Info */}
        <div className="host-profile-card__header">
          {organizer.avatar ? (
            <img
              src={organizer.avatar}
              alt={organizer.name}
              className="host-profile-card__avatar"
            />
          ) : (
            <div className="host-profile-card__avatar host-profile-card__avatar--placeholder">
              {organizer.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="host-profile-card__info">
            <h3 className="host-profile-card__name">{organizer.name}</h3>
            <div className="host-profile-card__meta">
              <div className="host-profile-card__meta-item">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>
                  Member since {new Date(organizer.stats.memberSince).getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {organizer.bio && (
          <div className="host-profile-card__bio">
            <p>{organizer.bio}</p>
          </div>
        )}

        {/* Stats */}
        <div className="host-profile-card__stats">
          <div className="host-stat">
            <div className="host-stat__icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="host-stat__content">
              <div className="host-stat__value">{organizer.stats.eventsHosted}</div>
              <div className="host-stat__label">Events Hosted</div>
            </div>
          </div>

          <div className="host-stat">
            <div className="host-stat__icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="host-stat__content">
              <div className="host-stat__value">{organizer.stats.rating.toFixed(1)}</div>
              <div className="host-stat__label">Host Rating</div>
            </div>
          </div>

          <div className="host-stat">
            <div className="host-stat__icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="host-stat__content">
              <div className="host-stat__value">{organizer.stats.responseRate}%</div>
              <div className="host-stat__label">Response Rate</div>
            </div>
          </div>

          <div className="host-stat">
            <div className="host-stat__icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="host-stat__content">
              <div className="host-stat__value">{organizer.stats.responseTime}</div>
              <div className="host-stat__label">Response Time</div>
            </div>
          </div>
        </div>

        {/* Contact Button */}
        {(organizer.contactEmail || organizer.contactPhone) && (
          <div className="host-profile-card__actions">
            <button className="host-profile-card__contact-btn">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Contact Host
            </button>
          </div>
        )}

        {/* Verification Badge */}
        <div className="host-profile-card__badge">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Verified Host</span>
        </div>
      </div>
    </section>
  );
}

HostProfileSection.displayName = 'HostProfileSection';
