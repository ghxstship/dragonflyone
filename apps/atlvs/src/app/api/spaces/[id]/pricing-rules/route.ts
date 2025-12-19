import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const pricingRuleSchema = z.object({
  name: z.string().min(1),
  rule_type: z.enum(['base', 'seasonal', 'day_of_week', 'time_of_day', 'package', 'minimum', 'add_on']),
  price: z.number().min(0),
  price_unit: z.enum(['flat', 'per_hour', 'per_person', 'per_day']).default('flat'),
  applies_to_days: z.array(z.number().min(0).max(6)).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  min_hours: z.number().min(0).optional(),
  min_guests: z.number().min(1).optional(),
  priority: z.number().default(0),
  is_active: z.boolean().default(true),
  description: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const spaceId = params.id;
    const { searchParams } = new URL(request.url);

    const ruleType = searchParams.get('rule_type');
    const activeOnly = searchParams.get('active_only') !== 'false';

    let query = supabase
      .from('space_pricing_rules')
      .select('*')
      .eq('space_id', spaceId)
      .order('priority', { ascending: false })
      .order('name', { ascending: true });

    if (ruleType) {
      query = query.eq('rule_type', ruleType);
    }
    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: rules, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch pricing rules' },
        { status: 500 }
      );
    }

    // Group by rule type
    const byType: Record<string, typeof rules> = {};
    rules?.forEach((rule) => {
      if (!byType[rule.rule_type]) {
        byType[rule.rule_type] = [];
      }
      byType[rule.rule_type].push(rule);
    });

    return NextResponse.json({
      rules: rules || [],
      by_type: byType,
      count: rules?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const spaceId = params.id;

    const body = await request.json();
    const validatedData = pricingRuleSchema.parse(body);

    // Check if space exists
    const { data: space, error: spaceError } = await supabase
      .from('spaces')
      .select('id')
      .eq('id', spaceId)
      .single();

    if (spaceError || !space) {
      return NextResponse.json(
        { error: 'Space not found' },
        { status: 404 }
      );
    }

    const { data: rule, error } = await supabase
      .from('space_pricing_rules')
      .insert({
        space_id: spaceId,
        name: validatedData.name,
        rule_type: validatedData.rule_type,
        price: validatedData.price,
        price_unit: validatedData.price_unit,
        applies_to_days: validatedData.applies_to_days || null,
        start_date: validatedData.start_date || null,
        end_date: validatedData.end_date || null,
        start_time: validatedData.start_time || null,
        end_time: validatedData.end_time || null,
        min_hours: validatedData.min_hours || null,
        min_guests: validatedData.min_guests || null,
        priority: validatedData.priority,
        is_active: validatedData.is_active,
        description: validatedData.description || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create pricing rule' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rule,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
