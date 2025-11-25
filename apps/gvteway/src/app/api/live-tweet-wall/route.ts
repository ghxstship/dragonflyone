import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const wallSchema = z.object({
  event_id: z.string().uuid(),
  name: z.string().min(1),
  hashtags: z.array(z.string()),
  moderation_enabled: z.boolean().default(true),
  display_settings: z.object({
    theme: z.enum(['light', 'dark', 'custom']).optional(),
    refresh_interval: z.number().optional(),
    max_posts: z.number().optional(),
  }).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const wallId = searchParams.get('wall_id');
    const type = searchParams.get('type');

    if (type === 'feed' && wallId) {
      const { data: posts, error } = await supabase
        .from('tweet_wall_posts')
        .select('*')
        .eq('wall_id', wallId)
        .eq('status', 'approved')
        .order('posted_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return NextResponse.json({ posts });
    }

    if (type === 'pending' && wallId) {
      const { data: posts, error } = await supabase
        .from('tweet_wall_posts')
        .select('*')
        .eq('wall_id', wallId)
        .eq('status', 'pending')
        .order('posted_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ pending_posts: posts });
    }

    let query = supabase.from('tweet_walls').select('*');
    if (eventId) query = query.eq('event_id', eventId);

    const { data: walls, error } = await query;
    if (error) throw error;

    return NextResponse.json({ walls });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'ingest_post') {
      const { wall_id, platform, external_id, author_name, author_handle, content, media_url, posted_at } = body.data;

      // Check if moderation is enabled
      const { data: wall } = await supabase
        .from('tweet_walls')
        .select('moderation_enabled')
        .eq('id', wall_id)
        .single();

      const { data: post, error } = await supabase
        .from('tweet_wall_posts')
        .insert({
          wall_id,
          platform,
          external_id,
          author_name,
          author_handle,
          content,
          media_url,
          posted_at,
          status: wall?.moderation_enabled ? 'pending' : 'approved',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ post }, { status: 201 });
    }

    const validated = wallSchema.parse(body);

    const { data: wall, error } = await supabase
      .from('tweet_walls')
      .insert({
        ...validated,
        status: 'active',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ wall }, { status: 201 });
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

    if (action === 'approve_post') {
      const { data, error } = await supabase
        .from('tweet_wall_posts')
        .update({ status: 'approved' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ post: data });
    }

    if (action === 'reject_post') {
      const { data, error } = await supabase
        .from('tweet_wall_posts')
        .update({ status: 'rejected' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ post: data });
    }

    if (action === 'bulk_approve') {
      const { post_ids } = body;
      const { data, error } = await supabase
        .from('tweet_wall_posts')
        .update({ status: 'approved' })
        .in('id', post_ids)
        .select();

      if (error) throw error;
      return NextResponse.json({ posts: data });
    }

    const { data, error } = await supabase
      .from('tweet_walls')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ wall: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
