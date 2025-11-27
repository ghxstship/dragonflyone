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

const artistSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  bio: z.string().optional(),
  short_bio: z.string().max(280).optional(),
  genres: z.array(z.string()).optional(),
  origin_city: z.string().optional(),
  origin_country: z.string().optional(),
  formed_year: z.number().int().optional(),
  website: z.string().url().optional(),
  social_links: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    spotify: z.string().optional(),
    soundcloud: z.string().optional(),
    youtube: z.string().optional(),
    tiktok: z.string().optional(),
  }).optional(),
  profile_image: z.string().optional(),
  cover_image: z.string().optional(),
  gallery_images: z.array(z.string()).optional(),
  booking_email: z.string().email().optional(),
  management_contact: z.string().optional(),
  press_kit_url: z.string().url().optional(),
  rider_url: z.string().url().optional(),
  is_verified: z.boolean().default(false),
});

// GET /api/artists - List artists
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured') === 'true';
    const verified = searchParams.get('verified') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('artists')
      .select(`
        *,
        upcoming_events:events(
          id,
          name,
          start_date,
          venue:venues(id, name, city)
        ),
        followers:artist_followers(count)
      `, { count: 'exact' })
      .eq('is_active', true)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (genre) {
      query = query.contains('genres', [genre]);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,genres.cs.{${search}}`);
    }
    if (featured) {
      query = query.eq('is_featured', true);
    }
    if (verified) {
      query = query.eq('is_verified', true);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching artists:', error);
      return NextResponse.json(
        { error: 'Failed to fetch artists', details: error.message },
        { status: 500 }
      );
    }

    interface ArtistRecord {
      id: string;
      genres: string[];
      is_verified: boolean;
      is_featured: boolean;
      followers: Array<{ count: number }>;
      [key: string]: unknown;
    }
    const artists = (data || []) as unknown as ArtistRecord[];

    const summary = {
      total: count || 0,
      verified_count: artists.filter(a => a.is_verified).length,
      featured_count: artists.filter(a => a.is_featured).length,
      genres: [...new Set(artists.flatMap(a => a.genres || []))],
    };

    return NextResponse.json({ artists: data, summary, total: count, limit, offset });
  } catch (error) {
    console.error('Error in GET /api/artists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/artists - Create artist
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = artistSchema.parse(body);

    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    // Generate slug if not provided
    const slug = validated.slug || validated.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const { data: artist, error } = await supabase
      .from('artists')
      .insert({
        ...validated,
        slug,
        is_active: true,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating artist:', error);
      return NextResponse.json(
        { error: 'Failed to create artist', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(artist, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in POST /api/artists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/artists - Update artist or follow/unfollow
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { artist_id, action, updates } = body;
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    if (!artist_id) {
      return NextResponse.json({ error: 'artist_id is required' }, { status: 400 });
    }

    if (action === 'follow') {
      const { data: existing } = await supabase
        .from('artist_followers')
        .select('id')
        .eq('artist_id', artist_id)
        .eq('user_id', userId)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Already following this artist' }, { status: 409 });
      }

      const { error } = await supabase
        .from('artist_followers')
        .insert({ artist_id, user_id: userId });

      if (error) {
        return NextResponse.json(
          { error: 'Failed to follow artist', details: error.message },
          { status: 500 }
        );
      }

      // Update follower count
      await supabase.rpc('increment_artist_followers', { p_artist_id: artist_id });

      return NextResponse.json({ success: true, message: 'Now following artist' });
    }

    if (action === 'unfollow') {
      const { error } = await supabase
        .from('artist_followers')
        .delete()
        .eq('artist_id', artist_id)
        .eq('user_id', userId);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to unfollow artist', details: error.message },
          { status: 500 }
        );
      }

      // Update follower count
      await supabase.rpc('decrement_artist_followers', { p_artist_id: artist_id });

      return NextResponse.json({ success: true, message: 'Unfollowed artist' });
    }

    // Regular update
    if (updates) {
      const { data, error } = await supabase
        .from('artists')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', artist_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update artist', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, artist: data });
    }

    return NextResponse.json({ error: 'No action specified' }, { status: 400 });
  } catch (error) {
    console.error('Error in PATCH /api/artists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
