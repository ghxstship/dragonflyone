export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createExpenseSchema = z.object({
  project_id: z.string().uuid(),
  expense_date: z.string(),
  category: z.enum(['meals', 'transport', 'lodging', 'other']),
  amount: z.number(),
  description: z.string().optional(),
  receipt_url: z.string().url().optional(),
});

const updateExpenseSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  rejection_reason: z.string().optional(),
});

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
    const projectId = searchParams.get('project_id');
    const crewId = searchParams.get('crew_id');

    let query = supabase.from('per_diem_expenses').select(`
      *, crew:platform_users(id, email, first_name, last_name),
      project:projects(id, name)
    `);

    if (projectId) query = query.eq('project_id', projectId);
    if (crewId) query = query.eq('crew_id', crewId);

    const { data, error } = await query.order('expense_date', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    const totalAmount = data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

    return NextResponse.json({
      expenses: data,
      total_amount: totalAmount,
      by_category: {
        meals: data?.filter(e => e.category === 'meals').reduce((s, e) => s + e.amount, 0) || 0,
        transport: data?.filter(e => e.category === 'transport').reduce((s, e) => s + e.amount, 0) || 0,
        lodging: data?.filter(e => e.category === 'lodging').reduce((s, e) => s + e.amount, 0) || 0,
        other: data?.filter(e => e.category === 'other').reduce((s, e) => s + e.amount, 0) || 0
      },
      pending_approval: data?.filter(e => e.status === 'pending') || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
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

    const userId = authResult.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createExpenseSchema.parse(body);
    const { project_id, expense_date, category, amount, description, receipt_url } = validatedData;

    const { data, error } = await supabase.from('per_diem_expenses').insert({
      project_id, crew_id: userId, expense_date, category, amount, description,
      receipt_url, status: 'pending', submitted_at: new Date().toISOString()
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ expense: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit expense' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = authResult.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = updateExpenseSchema.parse(body);
    const { id, action, rejection_reason } = validatedData;

    if (action === 'approve') {
      await supabase.from('per_diem_expenses').update({
        status: 'approved', approved_by: userId, approved_at: new Date().toISOString()
      }).eq('id', id);
    } else if (action === 'reject') {
      await supabase.from('per_diem_expenses').update({
        status: 'rejected', rejection_reason
      }).eq('id', id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}
