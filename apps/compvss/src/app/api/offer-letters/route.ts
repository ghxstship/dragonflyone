export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const generateSchema = z.object({
  action: z.literal('generate'),
  application_id: z.string().uuid(),
  template_id: z.string().uuid().optional(),
  position_title: z.string(),
  salary: z.number(),
  start_date: z.string(),
  benefits: z.array(z.string()).optional(),
  terms: z.record(z.unknown()).optional(),
});

const sendSchema = z.object({
  action: z.literal('send'),
  offer_id: z.string().uuid(),
  recipient_email: z.string().email(),
});

const signSchema = z.object({
  action: z.literal('sign'),
  signature_token: z.string(),
  signature_data: z.string(),
  ip_address: z.string().optional(),
});

const offerLetterActionSchema = z.union([generateSchema, sendSchema, signSchema]);

// Offer letter generation and e-signature
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('application_id');
    const status = searchParams.get('status');

    let query = supabase.from('offer_letters').select(`
      *, application:job_applications(id, applicant_id, opportunity_id)
    `);

    if (applicationId) query = query.eq('application_id', applicationId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ offer_letters: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = offerLetterActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'generate') {
      const { application_id, template_id, position_title, salary, start_date, benefits, terms } = validatedData as z.infer<typeof generateSchema>;

      const { data, error } = await supabase.from('offer_letters').insert({
        application_id, template_id, position_title, salary, start_date,
        benefits: benefits || [], terms: terms || {},
        status: 'draft', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ offer_letter: data }, { status: 201 });
    }

    if (action === 'send') {
      const { offer_id, recipient_email } = validatedData as z.infer<typeof sendSchema>;

      // Generate signature request token
      const signatureToken = crypto.randomUUID();

      await supabase.from('offer_letters').update({
        status: 'sent', sent_at: new Date().toISOString(),
        signature_token: signatureToken, recipient_email
      }).eq('id', offer_id);

      // Email sent via edge function with signature link

      return NextResponse.json({ success: true, signature_token: signatureToken });
    }

    if (action === 'sign') {
      const { signature_token, signature_data, ip_address } = validatedData as z.infer<typeof signSchema>;

      const { data: offer } = await supabase.from('offer_letters').select('id')
        .eq('signature_token', signature_token).eq('status', 'sent').single();

      if (!offer) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });

      await supabase.from('offer_letters').update({
        status: 'signed', signed_at: new Date().toISOString(),
        signature_data, signer_ip: ip_address
      }).eq('id', offer.id);

      // Update application status
      const { data: offerData } = await supabase.from('offer_letters').select('application_id').eq('id', offer.id).single();
      await supabase.from('job_applications').update({ status: 'offer_accepted' }).eq('id', offerData?.application_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
