import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

const floorConfigSchema = z.object({
  event_id: z.string().uuid(),
  name: z.string().min(1),
  capacity: z.number().min(1),
  zones: z.array(z.object({
    name: z.string(),
    capacity: z.number().min(1),
    price_tier: z.string().optional(),
  })).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (!eventId) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

    const { data: config, error } = await supabase
      .from('ga_floor_configs')
      .select('*')
      .eq('event_id', eventId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return NextResponse.json({ config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = floorConfigSchema.parse(body);

    const { data: config, error } = await supabase
      .from('ga_floor_configs')
      .insert({ ...validated, created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ config }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: config, error } = await supabase
      .from('ga_floor_configs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
