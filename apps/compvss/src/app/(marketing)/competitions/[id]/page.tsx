/**
 * COMPVSS Competition Page
 * Displays a competition with entry/registration functionality
 */

'use client';

import React, { useState, useEffect } from 'react';
import { UnifiedBookingModal, adaptCOMPVSSCompetition, type COMPVSSCompetition } from '@ghxstship/ui-v2/patterns/booking';

interface CompetitionPageProps {
  params: {
    id: string;
  };
}

export default function CompetitionPage({ params }: CompetitionPageProps) {
  const [competition, setCompetition] = useState<COMPVSSCompetition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  // Fetch competition data
  useEffect(() => {
    async function fetchCompetition() {
      try {
        const response = await fetch(`/api/competitions/${params.id}`);
        if (!response.ok) {
          throw new Error('Competition not found');
        }
        const data = await response.json();
        setCompetition(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load competition');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCompetition();
  }, [params.id]);

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading competition...</p>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Competition Not Found</h1>
        <p>{error || 'The competition you are looking for does not exist.'}</p>
      </div>
    );
  }

  const adaptedCompetition = adaptCOMPVSSCompetition(competition);
  const isOpen = competition.status === 'open';
  const startDate = new Date(competition.startDate);
  const endDate = new Date(competition.endDate);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Competition Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>{competition.name}</h1>
          <span style={{
            padding: '6px 12px',
            background: isOpen ? '#10B981' : '#6B7280',
            color: 'white',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'capitalize'
          }}>
            {competition.status}
          </span>
        </div>

        {competition.description && (
          <p style={{ fontSize: '1.25rem', color: '#666', lineHeight: 1.6 }}>
            {competition.description}
          </p>
        )}
      </div>

      {/* Competition Details Grid */}
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
            Entry Fee
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
            ${competition.entryFee.toFixed(2)}
          </div>
        </div>

        <div style={{
          padding: '24px',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
            Start Date
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>
            {startDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>

        <div style={{
          padding: '24px',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
            End Date
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>
            {endDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>

        {competition.maxParticipants && (
          <div style={{
            padding: '24px',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
              Max Participants
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              {competition.maxParticipants}
            </div>
          </div>
        )}
      </div>

      {/* Location */}
      {competition.location && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '16px' }}>Location</h2>
          <div style={{
            padding: '24px',
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>
              {competition.location.name}
            </div>
            {competition.location.address && (
              <div style={{ color: '#6b7280' }}>{competition.location.address}</div>
            )}
            {(competition.location.city || competition.location.country) && (
              <div style={{ color: '#6b7280' }}>
                {competition.location.city}
                {competition.location.city && competition.location.country && ', '}
                {competition.location.country}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '16px' }}>Category</h2>
        <div style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: '#7B68EE',
          color: 'white',
          borderRadius: '8px',
          fontWeight: 600
        }}>
          {competition.category}
        </div>
      </div>

      {/* Register Button */}
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
        {isOpen ? (
          <button
            onClick={() => setIsEntryModalOpen(true)}
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
            Register for Competition
          </button>
        ) : (
          <div style={{
            padding: '16px 48px',
            background: '#e5e7eb',
            color: '#6b7280',
            borderRadius: '8px',
            fontSize: '1.125rem',
            fontWeight: 600
          }}>
            Registration {competition.status === 'draft' ? 'Not Yet Open' : 'Closed'}
          </div>
        )}
      </div>

      {/* Entry Modal */}
      <UnifiedBookingModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        platform="compvss"
        item={adaptedCompetition}
        initialData={{
          platform: 'compvss',
          itemType: 'competition',
          itemId: competition.id,
          status: 'draft',
          numGuests: 1,
          startDate: startDate,
          endDate: endDate,
          pricing: {
            subtotal: competition.entryFee,
            addOnsTotal: 0,
            serviceFee: competition.entryFee * 0.05, // 5% service fee
            tax: competition.entryFee * 0.08, // 8% tax
            discount: 0,
            total: competition.entryFee * 1.13,
            currency: 'USD',
          },
          selectedAddOns: [],
          metadata: {},
        }}
        onBookingComplete={(entry) => {
          console.log('Entry completed:', entry);
          setIsEntryModalOpen(false);
          // TODO: Redirect to confirmation page or show success message
        }}
      />
    </div>
  );
}
