/**
 * ATLVS Travel Packages List Page
 * Browse all available travel packages
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ATLVSPackage } from '@ghxstship/ui-v2/patterns/booking';

export default function PackagesPage() {
  const [packages, setPackages] = useState<ATLVSPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  useEffect(() => {
    async function fetchPackages() {
      try {
        const params = new URLSearchParams();
        if (eventTypeFilter) params.append('event_type', eventTypeFilter);
        if (featuredOnly) params.append('featured', 'true');

        const response = await fetch(`/api/booking-packages?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch packages');
        }
        const data = await response.json();
        setPackages(data.packages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load packages');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPackages();
  }, [eventTypeFilter, featuredOnly]);

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading packages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Error Loading Packages</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Travel Packages</h1>
        <p style={{ fontSize: '1.25rem', color: '#666' }}>
          Discover our curated collection of travel experiences
        </p>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={(e) => setFeaturedOnly(e.target.checked)}
          />
          <span>Featured Only</span>
        </label>
      </div>

      {/* Packages Grid */}
      {packages.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6b7280' }}>
          <p style={{ fontSize: '1.125rem' }}>No packages found matching your criteria</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '32px'
        }}>
          {packages.map((pkg) => (
            <Link
              key={pkg.id}
              href={`/packages/${pkg.id}`}
              style={{
                display: 'block',
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                transition: 'all 150ms',
                textDecoration: 'none',
                color: 'inherit'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Package Card */}
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                    {pkg.name}
                  </h3>
                  {pkg.is_featured && (
                    <span style={{
                      padding: '4px 8px',
                      background: '#7B68EE',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      Featured
                    </span>
                  )}
                </div>

                {pkg.description && (
                  <p style={{
                    color: '#6b7280',
                    marginBottom: '16px',
                    lineHeight: 1.6,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {pkg.description}
                  </p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  {pkg.duration_hours && (
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      ⏱️ {pkg.duration_hours}h
                    </div>
                  )}
                  {(pkg.min_guests || pkg.max_guests) && (
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      👥 {pkg.min_guests || 1}-{pkg.max_guests || '∞'}
                    </div>
                  )}
                  {pkg.included_items.length > 0 && (
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      ✓ {pkg.included_items.length} items included
                    </div>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>From</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                      ${pkg.base_price.toFixed(2)}
                    </div>
                  </div>
                  <div style={{
                    padding: '12px 24px',
                    background: '#7B68EE',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}>
                    View Details →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
