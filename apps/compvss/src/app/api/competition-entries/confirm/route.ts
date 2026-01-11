/**
 * COMPVSS Competition Entry Confirmation API
 * Confirms an entry after successful payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const confirmEntrySchema = z.object({
  entryId: z.string().uuid(),
  paymentIntentId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { entryId, paymentIntentId } = confirmEntrySchema.parse(body);

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

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

    // Verify payment intent matches entry
    if (entry.payment_intent_id !== paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent mismatch' },
        { status: 400 }
      );
    }

    // Get competition details for dates
    const { data: competition } = await supabase
      .from('competitions')
      .select('start_date, end_date')
      .eq('id', entry.competition_id)
      .single();

    // Update entry status
    const { data: confirmedEntry, error: updateError } = await supabase
      .from('competition_entries')
      .update({
        status: 'confirmed',
        payment_status: 'succeeded',
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId)
      .select()
      .single();

    if (updateError) {
      console.error('Entry confirmation error:', updateError);
      return NextResponse.json(
        { error: 'Failed to confirm entry' },
        { status: 500 }
      );
    }

    // TODO: Send confirmation emails
    // - Email to participant
    // - Notification to competition organizer

    // Format response
    const confirmation = {
      platform: 'compvss' as const,
      itemType: 'competition' as const,
      itemId: confirmedEntry.competition_id,
      bookingId: confirmedEntry.id,
      bookingNumber: confirmedEntry.entry_number,
      status: confirmedEntry.status,

      startDate: competition ? new Date(competition.start_date) : new Date(),
      endDate: competition ? new Date(competition.end_date) : new Date(),
      confirmedAt: new Date(confirmedEntry.confirmed_at),

      numGuests: confirmedEntry.num_participants,
      guestDetails: {
        firstName: confirmedEntry.participant_first_name,
        lastName: confirmedEntry.participant_last_name,
        email: confirmedEntry.participant_email,
        phone: confirmedEntry.participant_phone,
        country: confirmedEntry.participant_country,
        specialRequests: confirmedEntry.special_requests,
        agreeToTerms: true,
        marketingOptIn: confirmedEntry.marketing_opt_in,
      },

      pricing: {
        subtotal: confirmedEntry.subtotal,
        addOnsTotal: confirmedEntry.add_ons_total,
        serviceFee: confirmedEntry.service_fee,
        tax: confirmedEntry.tax,
        discount: confirmedEntry.discount,
        total: confirmedEntry.total,
        currency: confirmedEntry.currency,
      },

      selectedAddOns: [],
      paymentIntentId: confirmedEntry.payment_intent_id,
      paymentStatus: confirmedEntry.payment_status,

      metadata: {
        competitionName: confirmedEntry.competition_name,
        teamName: confirmedEntry.team_name,
        category: confirmedEntry.category,
      },
    };

    return NextResponse.json(confirmation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Entry confirmation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
