export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PipelineStageSchema = z.object({
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  order_index: z.number().int().min(0).default(0),
  probability: z.number().int().min(0).max(100).default(0),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3B82F6'),
  is_won: z.boolean().default(false),
  is_lost: z.boolean().default(false),
  auto_actions: z.array(z.object({
    action_type: z.enum(['send_email', 'create_task', 'notify_user', 'update_field']),
    config: z.record(z.any()),
  })).default([]),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');

    let query = supabase
      .from('pipeline_stages')
      .select('*, leads(count)')
      .order('order_index', { ascending: true });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ stages: data || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pipeline stages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = PipelineStageSchema.parse(body);

    // Get max order_index for organization
    const { data: existingStages } = await supabase
      .from('pipeline_stages')
      .select('order_index')
      .eq('organization_id', validatedData.organization_id)
      .order('order_index', { ascending: false })
      .limit(1);

    const maxOrderIndex = existingStages?.[0]?.order_index ?? -1;
    validatedData.order_index = maxOrderIndex + 1;

    const { data, error } = await supabase
      .from('pipeline_stages')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ stage: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create pipeline stage' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { stages } = body;

    if (!Array.isArray(stages)) {
      return NextResponse.json({ error: 'stages must be an array' }, { status: 400 });
    }

    // Batch update order indices
    const updates = stages.map((stage: { id: string; order_index: number }) =>
      supabase
        .from('pipeline_stages')
        .update({ order_index: stage.order_index })
        .eq('id', stage.id)
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reorder pipeline stages' }, { status: 500 });
  }
}
