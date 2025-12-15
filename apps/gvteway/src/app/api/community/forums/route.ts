export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@ghxstship/config/supabase-types';
import { z } from 'zod';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ForumSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.string(),
  created_by: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('forums')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: forums, error, count } = await query;

    if (error) {
      return NextResponse.json({ forums: [], categories: [], total: 0, limit, offset });
    }

    // Get forum categories for filtering
    const { data: categories } = await supabase
      .from('forum_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    return NextResponse.json({
      forums: forums?.map(f => ({
        id: f.id,
        title: f.title,
        description: f.description,
        category: f.category,
        posts: Array.isArray(f.forum_posts) ? f.forum_posts[0]?.count || 0 : 0,
        members: Array.isArray(f.forum_members) ? f.forum_members[0]?.count || 0 : 0,
        is_active: f.is_active,
        created_at: f.created_at,
        updated_at: f.updated_at,
      })) || [],
      categories: categories || [],
      total: count || forums?.length || 0,
      limit,
      offset,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch forums' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ForumSchema.parse(body);

    const { data: forum, error } = await supabase
      .from('forums')
      .insert({
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        created_by: validatedData.created_by,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add creator as first member
    await supabase.from('forum_members').insert({
      forum_id: forum.id,
      user_id: validatedData.created_by,
      role: 'admin',
    });

    return NextResponse.json(forum, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create forum' }, { status: 500 });
  }
}
