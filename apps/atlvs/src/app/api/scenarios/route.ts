import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const scenarioSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.enum(['financial', 'operational', 'market', 'strategic', 'risk']),
  scenario_type: z.enum(['best_case', 'base_case', 'worst_case', 'custom']),
  time_period: z.string().optional(),
  revenue_forecast: z.number().optional(),
  cost_forecast: z.number().optional(),
  probability: z.number().min(0).max(100).optional(),
  impact_level: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assumptions: z.array(z.string()).optional(),
  variables: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const scenarioType = searchParams.get('scenario_type');
    const status = searchParams.get('status');

    let query = supabase
      .from('scenarios')
      .select(`
        *,
        created_by_user:platform_users!scenarios_created_by_fkey(id, full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (scenarioType) {
      query = query.eq('scenario_type', scenarioType);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: scenarios, error } = await query;

    if (error) {
      console.error('Error fetching scenarios:', error);
      return NextResponse.json(
        { error: 'Failed to fetch scenarios', details: error.message },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const summary = {
      total: scenarios?.length || 0,
      by_type: {
        best_case: scenarios?.filter(s => s.scenario_type === 'best_case') || [],
        base_case: scenarios?.filter(s => s.scenario_type === 'base_case') || [],
        worst_case: scenarios?.filter(s => s.scenario_type === 'worst_case') || [],
        custom: scenarios?.filter(s => s.scenario_type === 'custom') || [],
      },
      best_case_revenue: scenarios?.find(s => s.scenario_type === 'best_case')?.revenue_forecast || 0,
      base_case_revenue: scenarios?.find(s => s.scenario_type === 'base_case')?.revenue_forecast || 0,
      worst_case_revenue: scenarios?.find(s => s.scenario_type === 'worst_case')?.revenue_forecast || 0,
    };

    return NextResponse.json({
      scenarios: scenarios || [],
      summary,
    });
  } catch (error) {
    console.error('Error in GET /api/scenarios:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const validated = scenarioSchema.parse(body);

    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    const { data: scenario, error } = await supabase
      .from('scenarios')
      .insert([
        {
          ...validated,
          organization_id: organizationId,
          created_by: userId,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating scenario:', error);
      return NextResponse.json(
        { error: 'Failed to create scenario', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(scenario, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/scenarios:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
