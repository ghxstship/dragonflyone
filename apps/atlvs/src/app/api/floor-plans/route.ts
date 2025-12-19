export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const createFloorPlanSchema = z.object({
  organization_id: z.string().uuid(),
  space_id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  dimensions: z.object({
    width: z.number(),
    height: z.number(),
    unit: z.string().default('px'),
  }).optional(),
  scale: z.number().optional(),
  is_template: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);

    const orgId = searchParams.get('organization_id');
    const spaceId = searchParams.get('space_id');
    const isTemplate = searchParams.get('is_template');

    if (!orgId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 });
    }

    let query = supabase
      .from('floor_plans')
      .select(`
        *,
        space:venue_spaces(id, name)
      `)
      .eq('organization_id', orgId)
      .order('updated_at', { ascending: false });

    if (spaceId) query = query.eq('space_id', spaceId);
    if (isTemplate === 'true') query = query.eq('is_template', true);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ floor_plans: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const payload = createFloorPlanSchema.parse(body);

    const { data, error } = await supabase
      .from('floor_plans')
      .insert({
        ...payload,
        canvas_data: {},
        objects: [],
        capacity_by_setup: {},
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ floor_plan: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
