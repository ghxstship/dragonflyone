import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// GET - Fetch NDAs
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const partyId = searchParams.get('party_id');

    let query = supabase
      .from('ndas')
      .select(`
        *,
        created_by:platform_users!created_by(id, email, first_name, last_name),
        party:contacts(id, name, email, company),
        signatures:nda_signatures(*)
      `);

    if (status) {
      query = query.eq('status', status);
    }

    if (partyId) {
      query = query.eq('party_id', partyId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get expiring soon
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoon = data.filter(
      nda => nda.expiration_date && new Date(nda.expiration_date) <= thirtyDaysFromNow && nda.status === 'active'
    );

    return NextResponse.json({
      ndas: data,
      expiring_soon: expiringSoon,
      stats: {
        total: data.length,
        active: data.filter(n => n.status === 'active').length,
        pending: data.filter(n => n.status === 'pending_signature').length,
        expired: data.filter(n => n.status === 'expired').length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch NDAs' },
      { status: 500 }
    );
  }
}

// POST - Create NDA
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      nda_type, // 'mutual', 'one_way_disclosing', 'one_way_receiving'
      party_id,
      party_name,
      party_email,
      effective_date,
      expiration_date,
      duration_years,
      confidential_info_description,
      permitted_use,
      exclusions,
      governing_law,
      template_id,
      custom_terms,
    } = body;

    // Calculate expiration if duration provided
    let expDate = expiration_date;
    if (!expDate && duration_years) {
      const exp = new Date(effective_date || new Date());
      exp.setFullYear(exp.getFullYear() + duration_years);
      expDate = exp.toISOString();
    }

    const { data: nda, error } = await supabase
      .from('ndas')
      .insert({
        title: title || `NDA - ${party_name}`,
        nda_type,
        party_id,
        party_name,
        party_email,
        effective_date: effective_date || new Date().toISOString(),
        expiration_date: expDate,
        confidential_info_description,
        permitted_use,
        exclusions: exclusions || [],
        governing_law: governing_law || 'Florida',
        template_id,
        custom_terms,
        status: 'draft',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ nda }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create NDA' },
      { status: 500 }
    );
  }
}

// PATCH - Update NDA, send for signature, or record signature
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { nda_id, action, ...updateData } = body;

    if (action === 'send_for_signature') {
      // Update status and send email
      await supabase
        .from('ndas')
        .update({
          status: 'pending_signature',
          sent_at: new Date().toISOString(),
          sent_by: user.id,
        })
        .eq('id', nda_id);

      // TODO: Integrate with e-signature service (DocuSign, HelloSign)

      return NextResponse.json({ success: true, message: 'NDA sent for signature' });
    }

    if (action === 'record_signature') {
      const { signer_name, signer_email, signer_title, signature_data } = updateData;

      // Record signature
      await supabase.from('nda_signatures').insert({
        nda_id,
        signer_name,
        signer_email,
        signer_title,
        signature_data,
        signed_at: new Date().toISOString(),
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      });

      // Check if all required signatures are collected
      const { data: signatures } = await supabase
        .from('nda_signatures')
        .select('*')
        .eq('nda_id', nda_id);

      // If both parties signed (for mutual NDA), activate
      if (signatures && signatures.length >= 2) {
        await supabase
          .from('ndas')
          .update({
            status: 'active',
            fully_executed_at: new Date().toISOString(),
          })
          .eq('id', nda_id);
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'terminate') {
      const { termination_reason } = updateData;

      await supabase
        .from('ndas')
        .update({
          status: 'terminated',
          terminated_at: new Date().toISOString(),
          terminated_by: user.id,
          termination_reason,
        })
        .eq('id', nda_id);

      return NextResponse.json({ success: true });
    }

    // Default: update NDA
    const { error } = await supabase
      .from('ndas')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', nda_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update NDA' },
      { status: 500 }
    );
  }
}
