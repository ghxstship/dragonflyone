export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const sendProposalSchema = z.object({
  recipient_email: z.string().email().optional(),
  subject: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const { recipient_email, subject, message } = sendProposalSchema.parse(body);

    const { data: proposal, error: fetchError } = await supabase
      .from('proposals')
      .select(`
        *,
        contact:contacts(id, first_name, last_name, email)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const emailTo = recipient_email || proposal.contact?.email;
    if (!emailTo) {
      return NextResponse.json({ error: 'No recipient email provided' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('proposals')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from('contact_interactions').insert({
      contact_id: proposal.contact_id,
      organization_id: proposal.organization_id,
      interaction_type: 'proposal_sent',
      subject: subject || `Proposal sent: ${proposal.name}`,
      body: message,
      metadata: {
        proposal_id: id,
        proposal_number: proposal.proposal_number,
        recipient_email: emailTo,
      },
    });

    return NextResponse.json({
      proposal: data,
      sent_to: emailTo,
      public_url: `/p/${proposal.public_token}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
