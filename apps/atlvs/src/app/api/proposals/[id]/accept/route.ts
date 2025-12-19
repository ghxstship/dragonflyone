export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const acceptProposalSchema = z.object({
  signature_data: z.object({
    signature: z.string(),
    signed_by: z.string(),
    signed_at: z.string(),
  }).optional(),
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const payload = acceptProposalSchema.parse(body);

    const { data: proposal, error: fetchError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    if (proposal.status === 'accepted') {
      return NextResponse.json({ error: 'Proposal already accepted' }, { status: 400 });
    }

    if (proposal.status === 'expired') {
      return NextResponse.json({ error: 'Proposal has expired' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('proposals')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString(),
        signature_data: payload.signature_data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (proposal.booking_id) {
      await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', proposal.booking_id);
    }

    return NextResponse.json({ proposal: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
