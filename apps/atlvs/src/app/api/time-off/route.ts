export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const timeOffRequestSchema = z.object({
  employee_id: z.string().uuid(),
  request_type: z.enum(['vacation', 'sick', 'personal', 'bereavement', 'jury_duty', 'military', 'unpaid', 'other']),
  start_date: z.string(),
  end_date: z.string(),
  hours_requested: z.number().positive(),
  reason: z.string().optional(),
});

// GET /api/time-off - List time off requests
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
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employee_id');
    const requestType = searchParams.get('request_type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('time_off_requests')
      .select(`
        id, request_type, start_date, end_date, hours_requested, status, reason, created_at,
        employee:employees(id, first_name, last_name, employee_number, department_id),
        approved_by_user:platform_users!approved_by(id, full_name)
      `, { count: 'exact' })
      .order('start_date', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }
    if (requestType) {
      query = query.eq('request_type', requestType);
    }
    if (startDate) {
      query = query.gte('start_date', startDate);
    }
    if (endDate) {
      query = query.lte('end_date', endDate);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      logger.error('Error fetching time off requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch time off requests', details: error.message },
        { status: 500 }
      );
    }

    interface TimeOffRecord {
      id: string;
      status: string;
      request_type: string;
      hours_requested: number;
      [key: string]: unknown;
    }
    const requests = (data || []) as unknown as TimeOffRecord[];

    const summary = {
      total: requests.length,
      by_status: {
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
        cancelled: requests.filter(r => r.status === 'cancelled').length,
      },
      by_type: requests.reduce((acc, r) => {
        acc[r.request_type] = (acc[r.request_type] || 0) + r.hours_requested;
        return acc;
      }, {} as Record<string, number>),
      total_hours_pending: requests
        .filter(r => r.status === 'pending')
        .reduce((sum, r) => sum + r.hours_requested, 0),
    };

    const totalCount = count || (requests?.length ?? 0);
    const pagination = {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: offset + (requests?.length ?? 0) < totalCount,
    };

    return NextResponse.json({ requests: data, summary, pagination });
  } catch (error) {
    logger.error('Error in GET /api/time-off:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/time-off - Create time off request
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

    const body = await request.json();
    const validated = timeOffRequestSchema.parse(body);

    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';

    // Check PTO balance
    const year = new Date(validated.start_date).getFullYear();
    const { data: balance } = await supabase
      .from('pto_balances')
      .select('*')
      .eq('employee_id', validated.employee_id)
      .eq('year', year)
      .eq('pto_type', validated.request_type)
      .single();

    if (balance && balance.available_hours < validated.hours_requested) {
      return NextResponse.json(
        { error: 'Insufficient PTO balance', available: balance.available_hours },
        { status: 400 }
      );
    }

    // Create request
    const { data: timeOffRequest, error } = await supabase
      .from('time_off_requests')
      .insert({
        organization_id: organizationId,
        ...validated,
        status: 'pending',
      })
      .select(`
        *,
        employee:employees(id, first_name, last_name)
      `)
      .single();

    if (error) {
      logger.error('Error creating time off request:', error);
      return NextResponse.json(
        { error: 'Failed to create time off request', details: error.message },
        { status: 500 }
      );
    }

    // Update pending hours in PTO balance
    if (balance) {
      await supabase
        .from('pto_balances')
        .update({
          pending_hours: (balance.pending_hours || 0) + validated.hours_requested,
          updated_at: new Date().toISOString(),
        })
        .eq('id', balance.id);
    }

    return NextResponse.json(timeOffRequest, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Error in POST /api/time-off:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/time-off - Approve/reject time off requests
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

    const body = await request.json();
    const { request_ids, action, reason } = body;
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    if (!request_ids || !Array.isArray(request_ids) || request_ids.length === 0) {
      return NextResponse.json(
        { error: 'request_ids array is required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject', 'cancel'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be approve, reject, or cancel' },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    switch (action) {
      case 'approve':
        updates.status = 'approved';
        updates.approved_at = new Date().toISOString();
        updates.approved_by = userId;
        break;
      case 'reject':
        updates.status = 'rejected';
        updates.rejection_reason = reason;
        break;
      case 'cancel':
        updates.status = 'cancelled';
        break;
    }

    const { data, error } = await supabase
      .from('time_off_requests')
      .update(updates)
      .in('id', request_ids)
      .eq('status', 'pending')
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update time off requests', details: error.message },
        { status: 500 }
      );
    }

    // Send notifications
    for (const req of data || []) {
      await supabase.from('notifications').insert({
        user_id: req.employee_id,
        type: `time_off_${action}ed`,
        title: `Time Off Request ${action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Cancelled'}`,
        message: `Your ${req.request_type} request for ${req.hours_requested} hours has been ${action}ed`,
        data: { request_id: req.id },
      });
    }

    return NextResponse.json({
      success: true,
      action,
      updated: data?.length || 0,
      requests: data,
    });
  } catch (error) {
    logger.error('Error in PATCH /api/time-off:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
