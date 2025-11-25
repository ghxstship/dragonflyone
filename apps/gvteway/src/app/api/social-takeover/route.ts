import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const takeoverSchema = z.object({
  event_id: z.string().uuid().optional(),
  artist_id: z.string().uuid().optional(),
  title: z.string().min(1),
  platforms: z.array(z.string()),
  scheduled_start: z.string().datetime(),
  scheduled_end: z.string().datetime(),
  guidelines: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('social_takeovers')
      .select(`*, artist:artists(id, name), posts:takeover_posts(*)`)
      .order('scheduled_start', { ascending: false });

    if (eventId) query = query.eq('event_id', eventId);
    if (status) query = query.eq('status', status);

    const { data: takeovers, error } = await query;
    if (error) throw error;

    return NextResponse.json({ takeovers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'add_post') {
      const { takeover_id, content, media_url, platform, posted_at } = body.data;

      const { data: post, error } = await supabase
        .from('takeover_posts')
        .insert({
          takeover_id,
          content,
          media_url,
          platform,
          posted_at: posted_at || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ post }, { status: 201 });
    }

    const validated = takeoverSchema.parse(body);
    const createdBy = body.created_by;

    const { data: takeover, error } = await supabase
      .from('social_takeovers')
      .insert({
        ...validated,
        status: 'scheduled',
        created_by: createdBy,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ takeover }, { status: 201 });
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

    if (action === 'start') {
      const { data, error } = await supabase
        .from('social_takeovers')
        .update({ status: 'active', actual_start: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ takeover: data });
    }

    if (action === 'end') {
      const { data, error } = await supabase
        .from('social_takeovers')
        .update({ status: 'completed', actual_end: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ takeover: data });
    }

    const { data, error } = await supabase
      .from('social_takeovers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ takeover: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
