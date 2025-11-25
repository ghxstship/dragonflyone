import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FanProfileSchema = z.object({
  display_name: z.string().optional(),
  bio: z.string().optional(),
  avatar_url: z.string().optional(),
  favorite_genres: z.array(z.string()).optional(),
  favorite_artists: z.array(z.string().uuid()).optional(),
  favorite_venues: z.array(z.string().uuid()).optional(),
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  preferences: z.object({
    email_notifications: z.boolean().default(true),
    push_notifications: z.boolean().default(true),
    show_activity: z.boolean().default(true),
    show_favorites: z.boolean().default(true),
  }).optional(),
  social_links: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    spotify: z.string().optional(),
  }).optional(),
});

// GET /api/fan-profiles - Get fan profile and activity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const action = searchParams.get('action');

    const authHeader = request.headers.get('authorization');
    let currentUser = null;

    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      currentUser = user;
    }

    if (action === 'my_profile') {
      if (!currentUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { data: profile } = await supabase
        .from('fan_profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      // Get activity stats
      const { data: ticketCount } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('user_id', currentUser.id)
        .eq('status', 'completed');

      const { data: eventsAttended } = await supabase
        .from('event_attendance')
        .select('id', { count: 'exact' })
        .eq('user_id', currentUser.id);

      const { data: reviews } = await supabase
        .from('event_reviews')
        .select('id', { count: 'exact' })
        .eq('user_id', currentUser.id);

      return NextResponse.json({
        profile: profile || {},
        stats: {
          tickets_purchased: ticketCount?.length || 0,
          events_attended: eventsAttended?.length || 0,
          reviews_written: reviews?.length || 0,
        },
      });
    }

    if (action === 'activity' && currentUser) {
      // Get recent activity
      const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
          id, created_at, total_amount,
          event:events(id, name, event_date)
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: recentReviews } = await supabase
        .from('event_reviews')
        .select(`
          id, rating, review_text, created_at,
          event:events(id, name)
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(10);

      return NextResponse.json({
        recent_orders: recentOrders || [],
        recent_reviews: recentReviews || [],
      });
    }

    if (action === 'recommendations' && currentUser) {
      // Get personalized recommendations based on preferences
      const { data: profile } = await supabase
        .from('fan_profiles')
        .select('favorite_genres, favorite_artists, favorite_venues')
        .eq('user_id', currentUser.id)
        .single();

      let recommendedEvents: any[] = [];

      const favoriteGenres = profile?.favorite_genres as string[] | null;
      const favoriteArtists = profile?.favorite_artists as string[] | null;

      if (favoriteGenres && favoriteGenres.length > 0) {
        const { data: genreEvents } = await supabase
          .from('events')
          .select('*')
          .contains('genres', favoriteGenres)
          .gte('event_date', new Date().toISOString())
          .order('event_date')
          .limit(10);

        recommendedEvents = genreEvents || [];
      }

      if (favoriteArtists && favoriteArtists.length > 0) {
        const { data: artistEvents } = await supabase
          .from('events')
          .select('*')
          .in('artist_id', favoriteArtists)
          .gte('event_date', new Date().toISOString())
          .order('event_date')
          .limit(10);

        recommendedEvents = [...recommendedEvents, ...(artistEvents || [])];
      }

      // Remove duplicates
      const uniqueEvents = Array.from(
        new Map(recommendedEvents.map(e => [e.id, e])).values()
      );

      return NextResponse.json({
        recommendations: uniqueEvents.slice(0, 10),
        based_on: {
          genres: profile?.favorite_genres || [],
          artists: profile?.favorite_artists?.length || 0,
        },
      });
    }

    if (action === 'favorites' && currentUser) {
      const { data: favoriteEvents } = await supabase
        .from('fan_favorites')
        .select(`
          *,
          event:events(id, name, event_date, venue_name, image_url)
        `)
        .eq('user_id', currentUser.id)
        .eq('favorite_type', 'event')
        .order('created_at', { ascending: false });

      const { data: favoriteArtists } = await supabase
        .from('fan_favorites')
        .select(`
          *,
          artist:artists(id, name, image_url)
        `)
        .eq('user_id', currentUser.id)
        .eq('favorite_type', 'artist')
        .order('created_at', { ascending: false });

      const { data: favoriteVenues } = await supabase
        .from('fan_favorites')
        .select(`
          *,
          venue:venues(id, name, city, state)
        `)
        .eq('user_id', currentUser.id)
        .eq('favorite_type', 'venue')
        .order('created_at', { ascending: false });

      return NextResponse.json({
        events: favoriteEvents || [],
        artists: favoriteArtists || [],
        venues: favoriteVenues || [],
      });
    }

    if (userId) {
      // Get public profile
      const { data: profile } = await supabase
        .from('fan_profiles')
        .select('display_name, bio, avatar_url, favorite_genres, preferences')
        .eq('user_id', userId)
        .single();

      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      // Only show if user allows
      if (!profile.preferences?.show_activity) {
        return NextResponse.json({
          profile: {
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            bio: profile.bio,
          },
        });
      }

      return NextResponse.json({ profile });
    }

    return NextResponse.json({ error: 'User ID or action required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// POST /api/fan-profiles - Create or update profile, add favorites
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

    const body = await request.json();
    const action = body.action || 'update_profile';

    if (action === 'update_profile') {
      const validated = FanProfileSchema.parse(body);

      const { data: profile, error } = await supabase
        .from('fan_profiles')
        .upsert({
          user_id: user.id,
          ...validated,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ profile });
    } else if (action === 'add_favorite') {
      const { favorite_type, entity_id } = body;

      if (!['event', 'artist', 'venue'].includes(favorite_type)) {
        return NextResponse.json({ error: 'Invalid favorite type' }, { status: 400 });
      }

      const { data: favorite, error } = await supabase
        .from('fan_favorites')
        .upsert({
          user_id: user.id,
          favorite_type,
          entity_id,
        }, { onConflict: 'user_id,favorite_type,entity_id' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ favorite }, { status: 201 });
    } else if (action === 'remove_favorite') {
      const { favorite_type, entity_id } = body;

      const { error } = await supabase
        .from('fan_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('favorite_type', favorite_type)
        .eq('entity_id', entity_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } else if (action === 'log_attendance') {
      const { event_id } = body;

      const { data: attendance, error } = await supabase
        .from('event_attendance')
        .upsert({
          user_id: user.id,
          event_id,
          attended_at: new Date().toISOString(),
        }, { onConflict: 'user_id,event_id' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ attendance });
    } else if (action === 'submit_review') {
      const { event_id, rating, review_text, photos } = body;

      // Check if user attended
      const { data: attendance } = await supabase
        .from('event_attendance')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', event_id)
        .single();

      const { data: review, error } = await supabase
        .from('event_reviews')
        .upsert({
          user_id: user.id,
          event_id,
          rating,
          review_text,
          photos,
          verified_attendance: !!attendance,
        }, { onConflict: 'user_id,event_id' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ review });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// DELETE /api/fan-profiles - Delete profile data
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'clear_favorites') {
      await supabase
        .from('fan_favorites')
        .delete()
        .eq('user_id', user.id);

      return NextResponse.json({ success: true });
    }

    if (action === 'delete_profile') {
      await supabase
        .from('fan_profiles')
        .delete()
        .eq('user_id', user.id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Action required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
