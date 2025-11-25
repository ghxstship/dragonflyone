import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const spotlightSchema = z.object({
  user_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  content_type: z.enum(['photo', 'video', 'story', 'review']),
  content_url: z.string().url().optional(),
  caption: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    if (type === 'featured') {
      const { data: spotlights, error } = await supabase
        .from('fan_spotlights')
        .select(`*, user:platform_users(id, first_name, last_name, avatar_url)`)
        .eq('status', 'featured')
        .order('featured_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return NextResponse.json({ spotlights });
    }

    let query = supabase
      .from('fan_spotlights')
      .select(`*, user:platform_users(id, first_name, last_name, avatar_url)`)
      .order('created_at', { ascending: false });

    if (eventId) query = query.eq('event_id', eventId);
    if (status) query = query.eq('status', status);

    const { data: spotlights, error } = await query;
    if (error) throw error;

    return NextResponse.json({ spotlights });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = spotlightSchema.parse(body);

    const { data: spotlight, error } = await supabase
      .from('fan_spotlights')
      .insert({ ...validated, status: 'pending', created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ spotlight }, { status: 201 });
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
    const { id, action } = body;

    if (action === 'feature') {
      const { data, error } = await supabase
        .from('fan_spotlights')
        .update({ status: 'featured', featured_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ spotlight: data });
    }

    if (action === 'approve') {
      const { data, error } = await supabase
        .from('fan_spotlights')
        .update({ status: 'approved' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ spotlight: data });
    }

    if (action === 'reject') {
      const { data, error } = await supabase
        .from('fan_spotlights')
        .update({ status: 'rejected' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ spotlight: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
