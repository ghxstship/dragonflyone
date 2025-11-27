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

const experienceSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  short_description: z.string().max(500).optional(),
  experience_type: z.enum(['concert', 'festival', 'theater', 'sports', 'conference', 'workshop', 'tour', 'dining', 'nightlife', 'other']),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  cover_image_url: z.string().url().optional(),
  gallery_urls: z.array(z.string().url()).optional(),
  video_url: z.string().url().optional(),
  venue_name: z.string().max(255).optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_recurring: z.boolean().default(false),
  recurrence_rule: z.string().optional(),
  price_min: z.number().optional(),
  price_max: z.number().optional(),
  currency: z.string().max(3).default('USD'),
  is_free: z.boolean().default(false),
  total_capacity: z.number().optional(),
  event_id: z.string().uuid().optional(),
  slug: z.string().max(255).optional(),
  meta_title: z.string().max(255).optional(),
  meta_description: z.string().max(500).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const experience_type = searchParams.get('experience_type');
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const is_free = searchParams.get('is_free');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const trending = searchParams.get('trending');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('experience_listings')
      .select(`
        *,
        organization:organizations(id, name, logo_url),
        event:events(id, name)
      `, { count: 'exact' })
      .eq('status', 'published');

    if (experience_type) {
      query = query.eq('experience_type', experience_type);
    }
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (category) {
      query = query.contains('categories', [category]);
    }
    if (is_free === 'true') {
      query = query.eq('is_free', true);
    }
    if (start_date) {
      query = query.gte('start_date', start_date);
    }
    if (end_date) {
      query = query.lte('end_date', end_date);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,venue_name.ilike.%${search}%`);
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }
    if (trending === 'true') {
      query = query.eq('is_trending', true);
    }

    const { data, error, count } = await query
      .order('is_featured', { ascending: false })
      .order('popularity_score', { ascending: false })
      .order('start_date', { ascending: true })
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
    console.error('Get experiences error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experiences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
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
      .select('id, organization_id, platform_roles')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAdmin = platformUser.platform_roles?.some((role: string) =>
      ['GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN'].includes(role)
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validated = experienceSchema.parse(body);

    // Generate slug if not provided
    const slug = validated.slug || validated.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

    const { data, error } = await supabase
      .from('experience_listings')
      .insert({
        organization_id: platformUser.organization_id,
        ...validated,
        slug,
        categories: validated.categories || [],
        tags: validated.tags || [],
        gallery_urls: validated.gallery_urls || [],
        available_capacity: validated.total_capacity,
        status: 'draft',
        created_by: platformUser.id,
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
    console.error('Create experience error:', error);
    return NextResponse.json(
      { error: 'Failed to create experience' },
      { status: 500 }
    );
  }
}
