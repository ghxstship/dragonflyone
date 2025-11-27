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

const followSchema = z.object({
  follow_type: z.enum(['artist', 'venue', 'organizer']),
  artist_id: z.string().uuid().optional(),
  venue_id: z.string().uuid().optional(),
  organizer_id: z.string().uuid().optional(),
  notify_new_events: z.boolean().default(true),
  notify_presales: z.boolean().default(true),
  notify_announcements: z.boolean().default(true),
});

// GET /api/follows - Get user's follows
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const followType = searchParams.get('type');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('user_follows')
      .select(`
        *,
        artists (
          id,
          name,
          profile_image_url,
          genre,
          follower_count
        ),
        venues (
          id,
          name,
          city,
          state,
          cover_image_url
        ),
        organizers:organizer_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (followType) {
      query = query.eq('follow_type', followType);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by type
    const grouped = {
      artists: data?.filter(f => f.follow_type === 'artist').map(f => ({
        ...f.artists,
        notifications: {
          new_events: f.notify_new_events,
          presales: f.notify_presales,
          announcements: f.notify_announcements,
        },
      })) || [],
      venues: data?.filter(f => f.follow_type === 'venue').map(f => ({
        ...f.venues,
        notifications: {
          new_events: f.notify_new_events,
          presales: f.notify_presales,
          announcements: f.notify_announcements,
        },
      })) || [],
      organizers: data?.filter(f => f.follow_type === 'organizer').map(f => ({
        ...f.organizers,
        notifications: {
          new_events: f.notify_new_events,
          presales: f.notify_presales,
          announcements: f.notify_announcements,
        },
      })) || [],
    };

    return NextResponse.json({
      follows: data,
      grouped,
      counts: {
        artists: grouped.artists.length,
        venues: grouped.venues.length,
        organizers: grouped.organizers.length,
        total: data?.length || 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/follows - Follow an entity
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = followSchema.parse(body);
    const userId = body.user_id;

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Validate that the correct ID is provided for the type
    if (validated.follow_type === 'artist' && !validated.artist_id) {
      return NextResponse.json(
        { error: 'artist_id is required for artist follows' },
        { status: 400 }
      );
    }
    if (validated.follow_type === 'venue' && !validated.venue_id) {
      return NextResponse.json(
        { error: 'venue_id is required for venue follows' },
        { status: 400 }
      );
    }
    if (validated.follow_type === 'organizer' && !validated.organizer_id) {
      return NextResponse.json(
        { error: 'organizer_id is required for organizer follows' },
        { status: 400 }
      );
    }

    // Check if already following
    let existingQuery = supabase
      .from('user_follows')
      .select('id')
      .eq('user_id', userId)
      .eq('follow_type', validated.follow_type);

    if (validated.artist_id) {
      existingQuery = existingQuery.eq('artist_id', validated.artist_id);
    }
    if (validated.venue_id) {
      existingQuery = existingQuery.eq('venue_id', validated.venue_id);
    }
    if (validated.organizer_id) {
      existingQuery = existingQuery.eq('organizer_id', validated.organizer_id);
    }

    const { data: existing } = await existingQuery.single();

    if (existing) {
      return NextResponse.json(
        { error: 'Already following' },
        { status: 409 }
      );
    }

    // Add follow
    const { data: follow, error: insertError } = await supabase
      .from('user_follows')
      .insert({
        user_id: userId,
        ...validated,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to follow' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      follow,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/follows - Update notification preferences
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, user_id, notify_new_events, notify_presales, notify_announcements } = body;

    if (!id || !user_id) {
      return NextResponse.json(
        { error: 'id and user_id are required' },
        { status: 400 }
      );
    }

    const updates: Record<string, boolean> = {};
    if (notify_new_events !== undefined) updates.notify_new_events = notify_new_events;
    if (notify_presales !== undefined) updates.notify_presales = notify_presales;
    if (notify_announcements !== undefined) updates.notify_announcements = notify_announcements;

    const { data, error } = await supabase
      .from('user_follows')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      follow: data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/follows - Unfollow
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const followId = searchParams.get('id');
    const followType = searchParams.get('type');
    const artistId = searchParams.get('artist_id');
    const venueId = searchParams.get('venue_id');
    const organizerId = searchParams.get('organizer_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('user_follows')
      .delete()
      .eq('user_id', userId);

    if (followId) {
      query = query.eq('id', followId);
    } else if (followType) {
      query = query.eq('follow_type', followType);
      if (artistId) query = query.eq('artist_id', artistId);
      if (venueId) query = query.eq('venue_id', venueId);
      if (organizerId) query = query.eq('organizer_id', organizerId);
    } else {
      return NextResponse.json(
        { error: 'id or (type and entity_id) is required' },
        { status: 400 }
      );
    }

    const { error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Unfollowed successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
