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

const ageRestrictionSchema = z.object({
  event_id: z.string().uuid(),
  minimum_age: z.number().min(0).optional(),
  restriction_type: z.enum(['all_ages', '18+', '21+', 'family', 'custom']),
  content_warnings: z.array(z.string()).optional(),
  verification_required: z.boolean().default(false),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (!eventId) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

    const { data: restriction, error } = await supabase
      .from('event_age_restrictions')
      .select('*')
      .eq('event_id', eventId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return NextResponse.json({ restriction });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = ageRestrictionSchema.parse(body);

    const { data: restriction, error } = await supabase
      .from('event_age_restrictions')
      .insert({ ...validated, created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ restriction }, { status: 201 });
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

    const { data: restriction, error } = await supabase
      .from('event_age_restrictions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ restriction });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
