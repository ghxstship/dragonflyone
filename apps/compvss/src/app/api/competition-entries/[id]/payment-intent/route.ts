/**
 * COMPVSS Competition Entry Payment Intent API
 * Creates Stripe payment intent for a competition entry
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(
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

    // Check if entry is in valid state
    if (entry.status !== 'pending') {
      return NextResponse.json(
        { error: 'Entry is not in pending state' },
        { status: 400 }
      );
    }

    // If payment intent already exists, retrieve it
    if (entry.payment_intent_id) {
      try {
        const existingIntent = await stripe.paymentIntents.retrieve(
          entry.payment_intent_id
        );

        if (existingIntent.status === 'succeeded') {
          return NextResponse.json(
            { error: 'Payment already completed' },
            { status: 400 }
          );
        }

        // Return existing intent if still valid
        if (
          existingIntent.status === 'requires_payment_method' ||
          existingIntent.status === 'requires_confirmation'
        ) {
          return NextResponse.json({
            clientSecret: existingIntent.client_secret,
            paymentIntentId: existingIntent.id,
          });
        }
      } catch (err) {
        console.error('Error retrieving existing payment intent:', err);
        // Continue to create new intent
      }
    }

    // Create new payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(entry.total * 100), // Convert to cents
      currency: entry.currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        entryId: entry.id,
        entryNumber: entry.entry_number,
        platform: 'compvss',
        competitionId: entry.competition_id,
        numParticipants: entry.num_participants.toString(),
        teamName: entry.team_name || '',
      },
      description: `COMPVSS Competition Entry: ${entry.competition_name}`,
      receipt_email: entry.participant_email,
    });

    // Update entry with payment intent ID
    await supabase
      .from('competition_entries')
      .update({
        payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
