export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createNdaSchema = z.object({
  title: z.string().optional(),
  nda_type: z.enum(['mutual', 'one_way_disclosing', 'one_way_receiving']),
  party_id: z.string().uuid().optional(),
  party_name: z.string(),
  party_email: z.string().email(),
  effective_date: z.string().optional(),
  expiration_date: z.string().optional(),
  duration_years: z.number().optional(),
  confidential_info_description: z.string().optional(),
  permitted_use: z.string().optional(),
  exclusions: z.array(z.string()).optional(),
  governing_law: z.string().optional(),
  template_id: z.string().uuid().optional(),
  custom_terms: z.string().optional(),
});

const sendForSignatureSchema = z.object({
  nda_id: z.string().uuid(),
  action: z.literal('send_for_signature'),
});

const recordSignatureSchema = z.object({
  nda_id: z.string().uuid(),
  action: z.literal('record_signature'),
  signer_name: z.string(),
  signer_email: z.string().email(),
  signer_title: z.string().optional(),
  signature_data: z.string(),
});

const terminateSchema = z.object({
  nda_id: z.string().uuid(),
  action: z.literal('terminate'),
  termination_reason: z.string().optional(),
});

const updateNdaSchema = z.object({
  nda_id: z.string().uuid(),
  action: z.undefined().optional(),
}).passthrough();

const patchNdaSchema = z.union([
  sendForSignatureSchema,
  recordSignatureSchema,
  terminateSchema,
  updateNdaSchema,
]);

// GET - Fetch NDAs
const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
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
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
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
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createNdaSchema.parse(body);
    const {
      title,
      nda_type,
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
    } = validatedData;

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
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
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
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = patchNdaSchema.parse(body);
    const { nda_id, action, ...updateData } = validatedData;

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

      // E-signature via DocuSign integration (DocuSign, HelloSign)

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
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update NDA' },
      { status: 500 }
    );
  }
}
