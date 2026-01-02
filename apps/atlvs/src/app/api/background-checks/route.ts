export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createCheckSchema = z.object({
  employee_id: z.string().uuid(),
  check_type: z.string().min(1),
  provider: z.string().optional(),
  package_level: z.string().optional(),
});

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('update_status'),
  status: z.string(),
  results: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
});

const renewSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('renew'),
});

const updateCheckSchema = z.discriminatedUnion('action', [updateStatusSchema, renewSchema]);

// Background check tracking and renewal alerts
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

    let query = supabase.from('background_checks').select(`
      *, employee:employees(id, first_name, last_name, email, hire_date)
    `);

    if (employeeId) query = query.eq('employee_id', employeeId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Get checks expiring soon (within 90 days)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 90);

    const expiringSoon = data?.filter(c => 
      c.expiry_date && new Date(c.expiry_date) <= futureDate && new Date(c.expiry_date) > new Date()
    ) || [];

    return NextResponse.json({
      checks: data,
      expiring_soon: expiringSoon,
      pending: data?.filter(c => c.status === 'pending') || [],
      summary: {
        total: data?.length || 0,
        cleared: data?.filter(c => c.status === 'cleared').length || 0,
        pending: data?.filter(c => c.status === 'pending').length || 0,
        flagged: data?.filter(c => c.status === 'flagged').length || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch checks' }, { status: 500 });
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

    const userId = authResult.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createCheckSchema.parse(body);
    const { employee_id, check_type, provider, package_level } = validatedData;

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year validity

    const { data, error } = await supabase.from('background_checks').insert({
      employee_id, check_type, provider, package_level,
      status: 'pending', initiated_at: new Date().toISOString(),
      expiry_date: expiryDate.toISOString(), initiated_by: userId
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ check: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to initiate check' }, { status: 500 });
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

    const userId = authResult.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = updateCheckSchema.parse(body);
    const { id, action } = validatedData;

    if (action === 'update_status') {
      const { status, results, notes } = validatedData;
      await supabase.from('background_checks').update({
        status, results, notes, completed_at: status !== 'pending' ? new Date().toISOString() : null,
        reviewed_by: userId
      }).eq('id', id);

      return NextResponse.json({ success: true });
    }

    if (action === 'renew') {
      const { data: existing } = await supabase.from('background_checks').select('*').eq('id', id).single();
      
      const newExpiryDate = new Date();
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);

      const { data, error } = await supabase.from('background_checks').insert({
        employee_id: existing?.employee_id,
        check_type: existing?.check_type,
        provider: existing?.provider,
        package_level: existing?.package_level,
        status: 'pending',
        initiated_at: new Date().toISOString(),
        expiry_date: newExpiryDate.toISOString(),
        initiated_by: userId,
        previous_check_id: id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ check: data, message: 'Renewal initiated' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
