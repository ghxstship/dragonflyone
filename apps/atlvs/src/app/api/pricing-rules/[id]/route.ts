import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const updatePricingRuleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  rule_type: z.enum(['base', 'seasonal', 'event_type', 'day_of_week', 'time_of_day', 'minimum_spend', 'discount', 'surcharge']).optional(),
  price: z.number().optional(),
  percentage: z.number().optional(),
  price_unit: z.string().optional(),
  applies_to: z.array(z.string()).optional(),
  conditions: z.record(z.unknown()).optional(),
  priority: z.number().optional(),
  is_active: z.boolean().optional(),
  valid_from: z.string().optional(),
  valid_to: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: rule, error } = await supabaseAdmin
      .from('pricing_rules')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !rule) {
      return NextResponse.json({ error: 'Pricing rule not found' }, { status: 404 });
    }

    return NextResponse.json({ rule });
  } catch (error) {
    console.error('Error in GET /api/pricing/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate input
    const parseResult = updatePricingRuleSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const input = parseResult.data;

    // Check if rule exists
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('pricing_rules')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Pricing rule not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.rule_type !== undefined) updateData.rule_type = input.rule_type;
    if (input.price !== undefined) updateData.price = input.price;
    if (input.percentage !== undefined) updateData.percentage = input.percentage;
    if (input.price_unit !== undefined) updateData.price_unit = input.price_unit;
    if (input.applies_to !== undefined) updateData.applies_to = input.applies_to;
    if (input.conditions !== undefined) updateData.conditions = input.conditions;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.is_active !== undefined) updateData.is_active = input.is_active;
    if (input.valid_from !== undefined) updateData.valid_from = input.valid_from;
    if (input.valid_to !== undefined) updateData.valid_to = input.valid_to;

    const { data: rule, error } = await supabaseAdmin
      .from('pricing_rules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating pricing rule:', error);
      return NextResponse.json({ error: 'Failed to update pricing rule' }, { status: 500 });
    }

    return NextResponse.json({ rule });
  } catch (error) {
    console.error('Error in PUT /api/pricing/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if rule exists
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('pricing_rules')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Pricing rule not found' }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from('pricing_rules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting pricing rule:', error);
      return NextResponse.json({ error: 'Failed to delete pricing rule' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/pricing/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
