/**
 * COMPVSS Competition Entry Retrieval API
 * Get entry by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id: entryId } = params;

    // Get entry
    const { data: entry, error: entryError } = await supabase
      .from('competition_entries')
      .select('*')
      .eq('id', entryId)
      .single();

    if (entryError || !entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    // Get competition details for dates
    const { data: competition } = await supabase
      .from('competitions')
      .select('start_date, end_date')
      .eq('id', entry.competition_id)
      .single();

    // Format as unified booking data
    const unifiedEntry = {
      platform: 'compvss' as const,
      itemType: 'competition' as const,
      itemId: entry.competition_id,
      bookingId: entry.id,
      bookingNumber: entry.entry_number,
      status: entry.status,

      startDate: competition ? new Date(competition.start_date) : new Date(),
      endDate: competition ? new Date(competition.end_date) : new Date(),
      createdAt: new Date(entry.created_at),
      confirmedAt: entry.confirmed_at ? new Date(entry.confirmed_at) : undefined,

      numGuests: entry.num_participants,
      guestDetails: {
        firstName: entry.participant_first_name,
        lastName: entry.participant_last_name,
        email: entry.participant_email,
        phone: entry.participant_phone,
        country: entry.participant_country,
        specialRequests: entry.special_requests,
        agreeToTerms: true,
        marketingOptIn: entry.marketing_opt_in,
      },

      pricing: {
        subtotal: entry.subtotal,
        addOnsTotal: entry.add_ons_total,
        serviceFee: entry.service_fee,
        tax: entry.tax,
        discount: entry.discount,
        total: entry.total,
        currency: entry.currency,
      },

      selectedAddOns: [],
      paymentIntentId: entry.payment_intent_id,
      paymentStatus: entry.payment_status,

      metadata: {
        competitionName: entry.competition_name,
        teamName: entry.team_name,
        category: entry.category,
      },
    };

    return NextResponse.json(unifiedEntry);
  } catch (error) {
    console.error('Entry retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
