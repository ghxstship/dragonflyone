import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const addFavoriteSchema = z.object({
  favorite_type: z.enum(['event', 'artist', 'venue']),
  event_id: z.string().uuid().optional(),
  artist_id: z.string().uuid().optional(),
  venue_id: z.string().uuid().optional(),
});

// GET /api/favorites - Get user's favorites
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const favoriteType = searchParams.get('type');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('user_favorites')
      .select(`
        *,
        events (
          id,
          name,
          start_date,
          cover_image_url,
          venue_id,
          min_price,
          status
        ),
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
          cover_image_url,
          capacity
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (favoriteType) {
      query = query.eq('favorite_type', favoriteType);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by type
    const grouped = {
      events: data?.filter(f => f.favorite_type === 'event').map(f => f.events) || [],
      artists: data?.filter(f => f.favorite_type === 'artist').map(f => f.artists) || [],
      venues: data?.filter(f => f.favorite_type === 'venue').map(f => f.venues) || [],
    };

    return NextResponse.json({
      favorites: data,
      grouped,
      counts: {
        events: grouped.events.length,
        artists: grouped.artists.length,
        venues: grouped.venues.length,
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

// POST /api/favorites - Add to favorites
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = addFavoriteSchema.parse(body);
    const userId = body.user_id;

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Validate that the correct ID is provided for the type
    if (validated.favorite_type === 'event' && !validated.event_id) {
      return NextResponse.json(
        { error: 'event_id is required for event favorites' },
        { status: 400 }
      );
    }
    if (validated.favorite_type === 'artist' && !validated.artist_id) {
      return NextResponse.json(
        { error: 'artist_id is required for artist favorites' },
        { status: 400 }
      );
    }
    if (validated.favorite_type === 'venue' && !validated.venue_id) {
      return NextResponse.json(
        { error: 'venue_id is required for venue favorites' },
        { status: 400 }
      );
    }

    // Check if already favorited
    let existingQuery = supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('favorite_type', validated.favorite_type);

    if (validated.event_id) {
      existingQuery = existingQuery.eq('event_id', validated.event_id);
    }
    if (validated.artist_id) {
      existingQuery = existingQuery.eq('artist_id', validated.artist_id);
    }
    if (validated.venue_id) {
      existingQuery = existingQuery.eq('venue_id', validated.venue_id);
    }

    const { data: existing } = await existingQuery.single();

    if (existing) {
      return NextResponse.json(
        { error: 'Already in favorites' },
        { status: 409 }
      );
    }

    // Add to favorites
    const { data: favorite, error: insertError } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        ...validated,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to add to favorites' },
        { status: 500 }
      );
    }

    // Update favorite count on the entity
    if (validated.event_id) {
      await supabase.rpc('increment_favorite_count', {
        table_name: 'events',
        row_id: validated.event_id,
      });
    }

    return NextResponse.json({
      success: true,
      favorite,
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

// DELETE /api/favorites - Remove from favorites
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const favoriteId = searchParams.get('id');
    const favoriteType = searchParams.get('type');
    const eventId = searchParams.get('event_id');
    const artistId = searchParams.get('artist_id');
    const venueId = searchParams.get('venue_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId);

    if (favoriteId) {
      query = query.eq('id', favoriteId);
    } else if (favoriteType) {
      query = query.eq('favorite_type', favoriteType);
      if (eventId) query = query.eq('event_id', eventId);
      if (artistId) query = query.eq('artist_id', artistId);
      if (venueId) query = query.eq('venue_id', venueId);
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
      message: 'Removed from favorites',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
