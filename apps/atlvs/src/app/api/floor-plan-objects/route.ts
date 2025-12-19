export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const createObjectSchema = z.object({
  organization_id: z.string().uuid().optional(),
  name: z.string().min(1),
  category: z.string().min(1),
  icon_svg: z.string().optional(),
  icon_url: z.string().optional(),
  dimensions: z.object({
    width: z.number(),
    height: z.number(),
  }),
  default_capacity: z.number().default(1),
  is_custom: z.boolean().default(true),
  metadata: z.record(z.unknown()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);

    const orgId = searchParams.get('organization_id');
    const category = searchParams.get('category');

    let query = supabase
      .from('floor_plan_objects')
      .select('*')
      .eq('is_active', true)
      .order('category')
      .order('name');

    if (category) {
      query = query.eq('category', category);
    }

    if (orgId) {
      query = query.or(`organization_id.is.null,organization_id.eq.${orgId}`);
    } else {
      query = query.is('organization_id', null);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const grouped = (data || []).reduce((acc, obj) => {
      if (!acc[obj.category]) acc[obj.category] = [];
      acc[obj.category].push(obj);
      return acc;
    }, {} as Record<string, typeof data>);

    return NextResponse.json({ 
      objects: data,
      by_category: grouped,
      categories: Object.keys(grouped),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const payload = createObjectSchema.parse(body);

    const { data, error } = await supabase
      .from('floor_plan_objects')
      .insert(payload)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ object: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
