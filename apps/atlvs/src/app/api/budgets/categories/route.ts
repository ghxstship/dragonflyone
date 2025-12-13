export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BudgetCategorySchema = z.object({
  organization_id: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  parent_id: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('finance_expense_categories')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Enrich with budget statistics
    const categoriesWithStats = await Promise.all((data || []).map(async (category) => {
      const { data: budgets } = await supabase
        .from('budgets')
        .select('planned_amount, actual_amount')
        .eq('category', category.name);

      const budget_count = budgets?.length || 0;
      const total_budgeted = budgets?.reduce((sum, b) => sum + (b.planned_amount || 0), 0) || 0;
      const total_actual = budgets?.reduce((sum, b) => sum + (b.actual_amount || 0), 0) || 0;

      return {
        ...category,
        budget_count,
        total_budgeted,
        total_actual,
        status: 'active',
      };
    }));

    return NextResponse.json({
      categories: categoriesWithStats,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch budget categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = BudgetCategorySchema.parse(body);

    const { data, error } = await supabase
      .from('finance_expense_categories')
      .insert({
        organization_id: validatedData.organization_id,
        code: validatedData.code,
        name: validatedData.name,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ category: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Failed to create budget category' }, { status: 500 });
  }
}
