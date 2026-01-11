/**
 * COMPVSS Competition Entry Creation API
 * Creates a new competition entry/registration
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createCompetitionEntrySchema = z.object({
  competitionId: z.string().uuid(),
  numParticipants: z.number().min(1),
  participantDetails: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    country: z.string(),
    specialRequests: z.string().optional(),
    agreeToTerms: z.boolean(),
    marketingOptIn: z.boolean().optional(),
  }),
  pricing: z.object({
    subtotal: z.number(),
    addOnsTotal: z.number(),
    serviceFee: z.number(),
    tax: z.number(),
    discount: z.number(),
    total: z.number(),
    currency: z.string(),
  }),
  teamName: z.string().optional(),
  category: z.string().optional(),
});

type CreateCompetitionEntryRequest = z.infer<typeof createCompetitionEntrySchema>;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: CreateCompetitionEntryRequest = await request.json();

    // Validate request
    const validatedData = createCompetitionEntrySchema.parse(body);

    // Check if competition exists and is open
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', validatedData.competitionId)
      .eq('status', 'open')
      .single();

    if (compError || !competition) {
      return NextResponse.json(
        { error: 'Competition not found or not open for registration' },
        { status: 404 }
      );
    }

    // Check participant limit
    if (competition.max_participants) {
      const { count } = await supabase
        .from('competition_entries')
        .select('*', { count: 'exact', head: true })
        .eq('competition_id', validatedData.competitionId)
        .eq('status', 'confirmed');

      if (count && count >= competition.max_participants) {
        return NextResponse.json(
          { error: 'Competition is full' },
          { status: 400 }
        );
      }
    }

    // Generate entry number
    const entryNumber = `COMP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create entry record
    const { data: entry, error: entryError } = await supabase
      .from('competition_entries')
      .insert({
        entry_number: entryNumber,
        competition_id: validatedData.competitionId,
        competition_name: competition.name,
        status: 'pending',

        // Participants
        num_participants: validatedData.numParticipants,
        team_name: validatedData.teamName || null,
        category: validatedData.category || competition.category,

        // Participant details
        participant_first_name: validatedData.participantDetails.firstName,
        participant_last_name: validatedData.participantDetails.lastName,
        participant_email: validatedData.participantDetails.email,
        participant_phone: validatedData.participantDetails.phone,
        participant_country: validatedData.participantDetails.country,
        special_requests: validatedData.participantDetails.specialRequests || null,
        marketing_opt_in: validatedData.participantDetails.marketingOptIn || false,

        // Pricing
        subtotal: validatedData.pricing.subtotal,
        add_ons_total: validatedData.pricing.addOnsTotal,
        service_fee: validatedData.pricing.serviceFee,
        tax: validatedData.pricing.tax,
        discount: validatedData.pricing.discount,
        total: validatedData.pricing.total,
        currency: validatedData.pricing.currency,

        // Metadata
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (entryError) {
      console.error('Entry creation error:', entryError);
      return NextResponse.json(
        { error: 'Failed to create entry' },
        { status: 500 }
      );
    }

    // Return entry info
    return NextResponse.json(
      {
        entryId: entry.id,
        entryNumber: entry.entry_number,
        status: entry.status,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Competition entry creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
