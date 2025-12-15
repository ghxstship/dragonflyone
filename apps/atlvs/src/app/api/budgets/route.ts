export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@ghxstship/config/supabase-types';
import { withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN,
  PlatformRole.ATLVS_ADMIN,
  PlatformRole.ATLVS_TEAM_MEMBER,
  PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN,
  PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

const BudgetSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  planned_amount: z.number().positive(),
  period_start: z.string(),
  period_end: z.string(),
  organization_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    // Authorization check
    const userRoles = authResult.user?.platformRoles || [];
    const hasAccess = ATLVS_ROLES.some(role => userRoles.includes(role));
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    const fiscalYear = searchParams.get('fiscal_year');
    const organizationId = searchParams.get('organization_id');
    const projectId = searchParams.get('project_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('budgets')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (period) {
      query = query.eq('period', period);
    }

    if (fiscalYear) {
      query = query.eq('fiscal_year', parseInt(fiscalYear));
    }

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data: budgets, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate variance for each budget
    const budgetsWithVariance = budgets?.map(b => ({
      ...b,
      variance: (b.planned_amount || 0) - (b.actual_amount || 0),
      computed_status: (b.actual_amount || 0) <= (b.planned_amount || 0) ? 'on-track' : 'over',
    })) || [];

    return NextResponse.json({
      budgets: budgetsWithVariance,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    // Authorization check - only admins can create budgets
    const userRoles = authResult.user?.platformRoles || [];
    const canCreate = ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role));
    if (!canCreate) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = BudgetSchema.parse(body);

    const { data: budget, error } = await supabase
      .from('budgets')
      .insert({
        name: validatedData.name,
        category: validatedData.category,
        planned_amount: validatedData.planned_amount,
        actual_amount: 0,
        period_start: validatedData.period_start,
        period_end: validatedData.period_end,
        organization_id: validatedData.organization_id,
        project_id: validatedData.project_id,
        notes: validatedData.notes,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}
