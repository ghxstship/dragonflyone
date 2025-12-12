export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@ghxstship/config/supabase-types';
import { z } from 'zod';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BudgetSchema = z.object({
  name: z.string().min(1),
  category: z.string(),
  budgeted_amount: z.number().positive(),
  period: z.string(),
  fiscal_year: z.number(),
  organization_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
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
      variance: (b.budgeted_amount || 0) - (b.actual_amount || 0),
      status: (b.actual_amount || 0) <= (b.budgeted_amount || 0) ? 'on-track' : 'over',
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
    const body = await request.json();
    const validatedData = BudgetSchema.parse(body);

    const { data: budget, error } = await supabase
      .from('budgets')
      .insert({
        name: validatedData.name,
        category: validatedData.category,
        budgeted_amount: validatedData.budgeted_amount,
        actual_amount: 0,
        period: validatedData.period,
        fiscal_year: validatedData.fiscal_year,
        organization_id: validatedData.organization_id,
        project_id: validatedData.project_id,
        event_id: validatedData.event_id,
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
