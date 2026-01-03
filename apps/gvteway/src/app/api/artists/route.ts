export const dynamic = 'force-dynamic';

import { logger, withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const GVTEWAY_ADMIN_ROLES = [
  PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

// Schema for creating/updating artists (stored in legend_people with artist metadata)
const artistSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  preferred_name: z.string().optional(),
  bio: z.string().optional(),
  email: z.string().email().optional(),
  avatar_url: z.string().url().optional(),
  metadata: z.object({
    artist_type: z.enum(['solo', 'band', 'dj', 'producer', 'group']).optional(),
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
    cover_image: z.string().optional(),
    gallery_images: z.array(z.string()).optional(),
    booking_email: z.string().email().optional(),
    management_contact: z.string().optional(),
    press_kit_url: z.string().url().optional(),
    rider_url: z.string().url().optional(),
    is_verified: z.boolean().default(false),
    is_featured: z.boolean().default(false),
  }).optional(),
});

// GET /api/artists - List artists from legend_people with artist tag
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

    // Query legend_people filtered by 'artist' tag - 3NF compliant
    let query = supabase
      .from('legend_people')
      .select(`
        id,
        first_name,
        last_name,
        display_name,
        preferred_name,
        email,
        avatar_url,
        bio,
        status,
        tags,
        metadata,
        created_at,
        updated_at,
        events:legend_event_people(
          event_id,
          role_type,
          is_headliner,
          event:legend_events!event_id(
            id,
            name,
            start_datetime,
            place:legend_places!place_id(id, name)
          )
        ),
        followers:person_followers(count)
      `, { count: 'exact' })
      .contains('tags', ['artist'])
      .eq('status', 'active')
      .order('display_name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (genre) {
      query = query.contains('metadata->genres', [genre]);
    }
    if (search) {
      query = query.or(`display_name.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }
    if (featured) {
      query = query.eq('metadata->is_featured', true);
    }
    if (verified) {
      query = query.eq('metadata->is_verified', true);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error('Error fetching artists from legend_people:', error);
      return NextResponse.json({ artists: [], summary: { total: 0, verified_count: 0, featured_count: 0, genres: [] }, total: 0, limit, offset });
    }

    interface ArtistRecord {
      id: string;
      display_name: string;
      metadata: { genres?: string[]; is_verified?: boolean; is_featured?: boolean } | null;
      followers: Array<{ count: number }>;
    }
    const artists = (data || []) as unknown as ArtistRecord[];

    const summary = {
      total: count || 0,
      verified_count: artists.filter(a => a.metadata?.is_verified).length,
      featured_count: artists.filter(a => a.metadata?.is_featured).length,
      genres: [...new Set(artists.flatMap(a => a.metadata?.genres || []))],
    };

    return NextResponse.json({ artists: data, summary, total: count, limit, offset });
  } catch (error) {
    logger.error('Error in GET /api/artists:', error instanceof Error ? error : undefined);
    return NextResponse.json({ artists: [], summary: { total: 0, verified_count: 0, featured_count: 0, genres: [] }, total: 0, limit: 50, offset: 0 });
  }
}

// POST /api/artists - Create artist in legend_people with artist tag
export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = artistSchema.parse(body);

    const userId = authResult.user?.id || body.user_id;
    const organizationId = body.organization_id;

    if (!organizationId) {
      return NextResponse.json({ error: 'organization_id is required' }, { status: 400 });
    }

    // Create artist as a legend_people record with 'artist' tag
    const { data: artist, error } = await supabase
      .from('legend_people')
      .insert({
        organization_id: organizationId,
        first_name: validated.first_name,
        last_name: validated.last_name,
        preferred_name: validated.preferred_name,
        email: validated.email,
        avatar_url: validated.avatar_url,
        bio: validated.bio,
        tags: ['artist'],
        metadata: validated.metadata || {},
        status: 'active',
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating artist in legend_people:', error);
      return NextResponse.json(
        { error: 'Failed to create artist', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ artist }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Error in POST /api/artists:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/artists - Update artist or follow/unfollow using 3NF tables
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { artist_id, action, updates } = body;

    // Get current user from auth or body
    const authResult = await withAuth(request);
    let currentUserId: string | undefined;
    if (!(authResult instanceof NextResponse)) {
      currentUserId = authResult.user?.id;
    }
    const userId = currentUserId || body.user_id;

    if (!artist_id) {
      return NextResponse.json({ error: 'artist_id is required' }, { status: 400 });
    }

    // Follow action - uses person_followers table (3NF)
    if (action === 'follow') {
      if (!userId) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      // Get the follower's person_id from platform_users -> legend_people
      const { data: followerPerson } = await supabase
        .from('legend_people')
        .select('id')
        .eq('platform_user_id', userId)
        .single();

      if (!followerPerson) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
      }

      const { data: existing } = await supabase
        .from('person_followers')
        .select('id')
        .eq('person_id', artist_id)
        .eq('follower_id', followerPerson.id)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Already following this artist' }, { status: 409 });
      }

      const { error } = await supabase
        .from('person_followers')
        .insert({ person_id: artist_id, follower_id: followerPerson.id });

      if (error) {
        logger.error('Error following artist:', error);
        return NextResponse.json(
          { error: 'Failed to follow artist', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: 'Now following artist' });
    }

    // Unfollow action - uses person_followers table (3NF)
    if (action === 'unfollow') {
      if (!userId) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const { data: followerPerson } = await supabase
        .from('legend_people')
        .select('id')
        .eq('platform_user_id', userId)
        .single();

      if (!followerPerson) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
      }

      const { error } = await supabase
        .from('person_followers')
        .delete()
        .eq('person_id', artist_id)
        .eq('follower_id', followerPerson.id);

      if (error) {
        logger.error('Error unfollowing artist:', error);
        return NextResponse.json(
          { error: 'Failed to unfollow artist', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: 'Unfollowed artist' });
    }

    // Regular update - updates legend_people record
    if (updates) {
      const { data, error } = await supabase
        .from('legend_people')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', artist_id)
        .contains('tags', ['artist'])
        .select()
        .single();

      if (error) {
        logger.error('Error updating artist:', error);
        return NextResponse.json(
          { error: 'Failed to update artist', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, artist: data });
    }

    return NextResponse.json({ error: 'No action specified' }, { status: 400 });
  } catch (error) {
    logger.error('Error in PATCH /api/artists:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
