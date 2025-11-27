import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Offer letter generation and e-signature
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('application_id');
    const status = searchParams.get('status');

    let query = supabase.from('offer_letters').select(`
      *, application:job_applications(id, applicant_id, opportunity_id)
    `);

    if (applicationId) query = query.eq('application_id', applicationId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ offer_letters: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'generate') {
      const { application_id, template_id, position_title, salary, start_date, benefits, terms } = body;

      const { data, error } = await supabase.from('offer_letters').insert({
        application_id, template_id, position_title, salary, start_date,
        benefits: benefits || [], terms: terms || {},
        status: 'draft', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ offer_letter: data }, { status: 201 });
    }

    if (action === 'send') {
      const { offer_id, recipient_email } = body;

      // Generate signature request token
      const signatureToken = crypto.randomUUID();

      await supabase.from('offer_letters').update({
        status: 'sent', sent_at: new Date().toISOString(),
        signature_token: signatureToken, recipient_email
      }).eq('id', offer_id);

      // TODO: Send email with signature link

      return NextResponse.json({ success: true, signature_token: signatureToken });
    }

    if (action === 'sign') {
      const { signature_token, signature_data, ip_address } = body;

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
