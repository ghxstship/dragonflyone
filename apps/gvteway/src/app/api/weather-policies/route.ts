import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const weatherPolicySchema = z.object({
  event_id: z.string().uuid(),
  rain_policy: z.string().optional(),
  extreme_heat_policy: z.string().optional(),
  extreme_cold_policy: z.string().optional(),
  lightning_policy: z.string().optional(),
  cancellation_policy: z.string().optional(),
  refund_policy: z.string().optional(),
  contingency_venue_id: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (!eventId) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

    const { data: policy, error } = await supabase
      .from('event_weather_policies')
      .select(`*, contingency_venue:venues(id, name, address)`)
      .eq('event_id', eventId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return NextResponse.json({ policy });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = weatherPolicySchema.parse(body);

    const { data: policy, error } = await supabase
      .from('event_weather_policies')
      .insert({ ...validated, created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ policy }, { status: 201 });
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

    const { data: policy, error } = await supabase
      .from('event_weather_policies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ policy });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
