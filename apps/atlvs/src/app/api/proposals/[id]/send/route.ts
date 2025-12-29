export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
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

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
