import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const postSchema = z.object({
  shop_id: z.string().uuid(),
  content: z.string().optional(),
  media_urls: z.array(z.string().url()).optional(),
  media_type: z.enum(['image', 'video', 'carousel', 'story']).optional(),
  tagged_products: z.array(z.object({
    product_type: z.string(),
    product_id: z.string().uuid(),
    position: z.object({ x: z.number(), y: z.number() }).optional(),
  })).optional(),
  scheduled_at: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shop_id = searchParams.get('shop_id');
    const author_id = searchParams.get('author_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('social_posts')
      .select(`
        *,
        shop:social_shops(id, name, slug, logo_url),
        author:platform_users!author_id(id, full_name, avatar_url)
      `, { count: 'exact' })
      .eq('status', 'published');

    if (shop_id) {
      query = query.eq('shop_id', shop_id);
    }
    if (author_id) {
      query = query.eq('author_id', author_id);
    }

    const { data, error, count } = await query
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get social posts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = postSchema.parse(body);

    // Verify user owns the shop
    const { data: shop } = await supabase
      .from('social_shops')
      .select('id')
      .eq('id', validated.shop_id)
      .eq('owner_id', platformUser.id)
      .single();

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found or you do not have permission' },
        { status: 403 }
      );
    }

    const isScheduled = validated.scheduled_at && new Date(validated.scheduled_at) > new Date();

    const { data, error } = await supabase
      .from('social_posts')
      .insert({
        shop_id: validated.shop_id,
        author_id: platformUser.id,
        content: validated.content,
        media_urls: validated.media_urls || [],
        media_type: validated.media_type,
        tagged_products: validated.tagged_products || [],
        status: isScheduled ? 'draft' : 'published',
        scheduled_at: validated.scheduled_at,
        published_at: isScheduled ? null : new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Create social post error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
