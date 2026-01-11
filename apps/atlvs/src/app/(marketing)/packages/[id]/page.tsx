/**
 * ATLVS Travel Package Page
 * Displays a travel package with booking functionality
 */

'use client';

import React, { useState, useEffect } from 'react';
import { UnifiedBookingModal, adaptATLVSPackage, type ATLVSPackage } from '@ghxstship/ui-v2/patterns/booking';

interface PackagePageProps {
  params: {
    id: string;
  };
}

export default function PackagePage({ params }: PackagePageProps) {
  const [pkg, setPkg] = useState<ATLVSPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Fetch package data
  useEffect(() => {
    async function fetchPackage() {
      try {
        const response = await fetch(`/api/booking-packages/${params.id}`);
        if (!response.ok) {
          throw new Error('Package not found');
        }
        const data = await response.json();
        setPkg(data.package);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load package');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPackage();
  }, [params.id]);

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading package...</p>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Package Not Found</h1>
        <p>{error || 'The package you are looking for does not exist.'}</p>
      </div>
    );
  }

  const adaptedPackage = adaptATLVSPackage(pkg);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Package Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{pkg.name}</h1>
        {pkg.description && <p style={{ fontSize: '1.25rem', color: '#666' }}>{pkg.description}</p>}

        {pkg.is_featured && (
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: '#7B68EE',
            color: 'white',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginTop: '12px'
          }}>
            Featured Package
          </span>
        )}
      </div>

      {/* Package Details Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        <div style={{
          padding: '24px',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
            Base Price
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
            ${pkg.base_price.toFixed(2)}
          </div>
        </div>

        {pkg.duration_hours && (
          <div style={{
            padding: '24px',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
              Duration
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              {pkg.duration_hours} hours
            </div>
          </div>
        )}

        {(pkg.min_guests || pkg.max_guests) && (
          <div style={{
            padding: '24px',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
              Travelers
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              {pkg.min_guests || 1} - {pkg.max_guests || '∞'}
            </div>
          </div>
        )}

        {pkg.event_types.length > 0 && (
          <div style={{
            padding: '24px',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
              Event Types
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              {pkg.event_types.join(', ')}
            </div>
          </div>
        )}
      </div>

      {/* Included Items */}
      {pkg.included_items.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '24px' }}>What's Included</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {pkg.included_items.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: '16px',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'start',
                  gap: '12px'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>✓</span>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {item.category} {item.quantity > 1 ? `(×${item.quantity})` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Book Now Button */}
      <div style={{
        position: 'sticky',
        bottom: 0,
        padding: '24px',
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'center',
        gap: '16px'
      }}>
        <button
          onClick={() => setIsBookingModalOpen(true)}
          style={{
            padding: '16px 48px',
            background: '#7B68EE',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.125rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 150ms'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#6952d9';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#7B68EE';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Book This Package
        </button>
      </div>

      {/* Booking Modal */}
      <UnifiedBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        platform="atlvs"
        item={adaptedPackage}
        initialData={{
          platform: 'atlvs',
          itemType: 'package',
          itemId: pkg.id,
          status: 'draft',
          numGuests: pkg.min_guests || 1,
          startDate: new Date(),
          endDate: new Date(Date.now() + (pkg.duration_hours || 24) * 60 * 60 * 1000),
          pricing: {
            subtotal: pkg.base_price,
            addOnsTotal: 0,
            serviceFee: pkg.base_price * 0.1, // 10% service fee
            tax: pkg.base_price * 0.08, // 8% tax
            discount: 0,
            total: pkg.base_price * 1.18,
            currency: 'USD',
          },
          selectedAddOns: [],
          metadata: {},
        }}
        onBookingComplete={(booking) => {
          console.log('Booking completed:', booking);
          setIsBookingModalOpen(false);
          // TODO: Redirect to confirmation page or show success message
        }}
      />
    </div>
  );
}
