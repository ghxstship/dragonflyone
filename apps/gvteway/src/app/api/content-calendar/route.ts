export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}



const postSchema = z.object({
  event_id: z.string().uuid().optional(),
  title: z.string().min(1),
  content: z.string(),
  platforms: z.array(z.string()),
  scheduled_at: z.string().datetime(),
  media_urls: z.array(z.string()).optional(),
  hashtags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const platform = searchParams.get('platform');

    let query = supabase
      .from('scheduled_social_posts')
      .select('*')
      .order('scheduled_at', { ascending: true });

    if (eventId) query = query.eq('event_id', eventId);
    if (startDate) query = query.gte('scheduled_at', startDate);
    if (endDate) query = query.lte('scheduled_at', endDate);
    if (platform) query = query.contains('platforms', [platform]);

    const { data: posts, error } = await query;
    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ posts: [], by_date: {} });
      }
      throw error;
    }

    // Group by date for calendar view
    interface ContentPost { scheduled_at: string; [key: string]: unknown }
    const byDate = posts?.reduce((acc: Record<string, ContentPost[]>, post: ContentPost) => {
      const date = post.scheduled_at.split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(post);
      return acc;
    }, {} as Record<string, ContentPost[]>);

    return NextResponse.json({ posts, by_date: byDate });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'bulk_schedule') {
      const { posts } = body.data;

      const postRecords = posts.map((p: Record<string, unknown>) => ({
        ...p,
        status: 'scheduled',
        created_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('scheduled_social_posts')
        .insert(postRecords)
        .select();

      if (error) throw error;
      return NextResponse.json({ posts: data, count: data?.length }, { status: 201 });
    }

    const validated = postSchema.parse(body);
    const createdBy = body.created_by;

    const { data: post, error } = await supabase
      .from('scheduled_social_posts')
      .insert({
        ...validated,
        status: 'scheduled',
        created_by: createdBy,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (action === 'publish') {
      const { data, error } = await supabase
        .from('scheduled_social_posts')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ post: data });
    }

    if (action === 'cancel') {
      const { data, error } = await supabase
        .from('scheduled_social_posts')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ post: data });
    }

    const { data, error } = await supabase
      .from('scheduled_social_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ post: null });
      }
      throw error;
    }
    return NextResponse.json({ post: data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ post: null });
    }
    return NextResponse.json({ error: msg || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase.from('scheduled_social_posts').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
