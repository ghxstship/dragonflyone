import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const challengeSchema = z.object({
  event_id: z.string().uuid().optional(),
  name: z.string().min(1),
  hashtag: z.string().min(1),
  description: z.string().optional(),
  instructions: z.string().optional(),
  prize_description: z.string().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const status = searchParams.get('status');

    let query = supabase.from('tiktok_challenges').select('*').order('created_at', { ascending: false });

    if (eventId) query = query.eq('event_id', eventId);
    if (status) query = query.eq('status', status);

    const { data: challenges, error } = await query;
    if (error) throw error;

    return NextResponse.json({ challenges });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = challengeSchema.parse(body);

    const { data: challenge, error } = await supabase
      .from('tiktok_challenges')
      .insert({ ...validated, status: 'active', submission_count: 0, created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ challenge }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (action === 'increment_submissions') {
      const { data: current } = await supabase
        .from('tiktok_challenges')
        .select('submission_count')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('tiktok_challenges')
        .update({ submission_count: (current?.submission_count || 0) + 1 })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ challenge: data });
    }

    if (action === 'end') {
      const { data, error } = await supabase
        .from('tiktok_challenges')
        .update({ status: 'ended' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ challenge: data });
    }

    const { data, error } = await supabase
      .from('tiktok_challenges')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ challenge: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
