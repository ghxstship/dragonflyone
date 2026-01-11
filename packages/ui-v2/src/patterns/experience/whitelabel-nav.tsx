/**
 * White-Label Navigation Component
 * Customizable navigation bar for organizer-branded experience pages
 */

'use client';

import React, { useState } from 'react';
import type { WhiteLabelNavProps } from './types';
import './whitelabel-nav.css';

export function WhiteLabelNav({
  organizerId,
  organizerName,
  logo,
  navLinks = [],
}: WhiteLabelNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const defaultNavLinks = [
    { label: 'Experiences', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const links = navLinks.length > 0 ? navLinks : defaultNavLinks;

  return (
    <nav className="whitelabel-nav" role="navigation">
      <div className="whitelabel-nav__container">
        {/* Logo / Brand */}
        <div className="whitelabel-nav__brand">
          <a href="/" className="whitelabel-nav__logo-link">
            {logo ? (
              <img
                src={logo}
                alt={organizerName}
                className="whitelabel-nav__logo"
              />
            ) : (
              <span className="whitelabel-nav__logo-text">{organizerName}</span>
            )}
          </a>
        </div>

        {/* Desktop Navigation */}
        <div className="whitelabel-nav__links">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="whitelabel-nav__link"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="whitelabel-nav__actions">
          <a href="/auth/signin" className="whitelabel-nav__action whitelabel-nav__action--ghost">
            Sign In
          </a>
          <a href="/experiences/new" className="whitelabel-nav__action whitelabel-nav__action--primary">
            Book Now
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="whitelabel-nav__mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
        >
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
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="whitelabel-nav__mobile-menu">
          <div className="whitelabel-nav__mobile-links">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="whitelabel-nav__mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="whitelabel-nav__mobile-actions">
            <a
              href="/auth/signin"
              className="whitelabel-nav__mobile-action whitelabel-nav__mobile-action--ghost"
            >
              Sign In
            </a>
            <a
              href="/experiences/new"
              className="whitelabel-nav__mobile-action whitelabel-nav__mobile-action--primary"
            >
              Book Now
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

WhiteLabelNav.displayName = 'WhiteLabelNav';
