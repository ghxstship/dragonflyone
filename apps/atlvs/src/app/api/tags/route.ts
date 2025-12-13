export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const TagSchema = z.object({
  tag_name: z.string().min(1).max(100),
  tag_type: z.enum(['general', 'industry', 'compliance', 'feature', 'category', 'priority']).default('general'),
  description: z.string().optional(),
  color_hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const tagType = searchParams.get('tag_type');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('catalog_tags')
      .select('*', { count: 'exact' })
      .order('tag_name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (tagType && tagType !== 'all') {
      query = query.eq('tag_type', tagType);
    }
    if (search) {
      query = query.ilike('tag_name', `%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const tags = data || [];
    const summary = {
      total: count || 0,
      by_type: tags.reduce((acc, t) => {
        acc[t.tag_type] = (acc[t.tag_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      tags,
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const validatedData = TagSchema.parse(body);

    const { data, error } = await supabase
      .from('catalog_tags')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Tag name already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tag: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
