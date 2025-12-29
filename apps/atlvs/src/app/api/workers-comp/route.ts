export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createClaimSchema = z.object({
  employee_id: z.string().uuid(),
  incident_id: z.string().uuid().optional(),
  injury_type: z.string().min(1),
  injury_description: z.string(),
  body_part: z.string(),
  treatment_type: z.string().optional(),
  medical_provider: z.string().optional(),
  reserve_amount: z.number().min(0).optional(),
});

const addPaymentSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('add_payment'),
  amount: z.number().positive(),
  notes: z.string().optional(),
});

const closeClaimSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('close'),
  notes: z.string().optional(),
});

const updateReserveSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('update_reserve'),
  amount: z.number().min(0),
});

const updateClaimSchema = z.discriminatedUnion('action', [addPaymentSchema, closeClaimSchema, updateReserveSchema]);

// Workers compensation claims tracking
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

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    let query = supabase.from('workers_comp_claims').select(`
      id, claim_number, injury_type, injury_description, body_part, status, amount_paid, reserve_amount, filed_at, created_at,
      employee:employees(id, first_name, last_name, department),
      incident:incident_reports(id, description, incident_date)
    `, { count: 'exact' });

    if (employeeId) query = query.eq('employee_id', employeeId);
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query
      .order('filed_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    const totalPaid = data?.reduce((s, c) => s + (c.amount_paid || 0), 0) || 0;
    const totalReserved = data?.reduce((s, c) => s + (c.reserve_amount || 0), 0) || 0;

    const totalCount = count || (data?.length ?? 0);
    const pagination = {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: offset + (data?.length ?? 0) < totalCount,
    };

    return NextResponse.json({
      claims: data,
      summary: {
        total_claims: totalCount,
        open: data?.filter(c => c.status === 'open').length || 0,
        closed: data?.filter(c => c.status === 'closed').length || 0,
        total_paid: totalPaid,
        total_reserved: totalReserved
      },
      pagination,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 });
  }
}

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

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createClaimSchema.parse(body);
    const { employee_id, incident_id, injury_type, injury_description, body_part, treatment_type, medical_provider, reserve_amount } = validatedData;

    const claimNumber = `WC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const { data, error } = await supabase.from('workers_comp_claims').insert({
      employee_id, incident_id, claim_number: claimNumber, injury_type,
      injury_description, body_part, treatment_type, medical_provider,
      reserve_amount: reserve_amount || 0, status: 'open',
      filed_at: new Date().toISOString(), filed_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ claim: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to file claim' }, { status: 500 });
  }
}

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

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = updateClaimSchema.parse(body);
    const { id, action } = validatedData;

    if (action === 'add_payment') {
      const { amount, notes } = validatedData;
      const { data: claim } = await supabase.from('workers_comp_claims').select('amount_paid').eq('id', id).single();
      
      await supabase.from('workers_comp_payments').insert({
        claim_id: id, amount, payment_date: new Date().toISOString(), notes, processed_by: user.id
      });

      await supabase.from('workers_comp_claims').update({
        amount_paid: (claim?.amount_paid || 0) + amount
      }).eq('id', id);

      return NextResponse.json({ success: true });
    }

    if (action === 'close') {
      const { notes } = validatedData;
      await supabase.from('workers_comp_claims').update({
        status: 'closed', closed_at: new Date().toISOString(), closure_notes: notes
      }).eq('id', id);

      return NextResponse.json({ success: true });
    }

    if (action === 'update_reserve') {
      const { amount } = validatedData;
      await supabase.from('workers_comp_claims').update({ reserve_amount: amount }).eq('id', id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
