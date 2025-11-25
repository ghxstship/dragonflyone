import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const updateProfileSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  display_name: z.string().optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional(),
  cover_image_url: z.string().url().optional(),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say']).optional(),
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    timezone: z.string().optional(),
  }).optional(),
  social_links: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    spotify: z.string().optional(),
    tiktok: z.string().optional(),
  }).optional(),
  preferences: z.object({
    favorite_genres: z.array(z.string()).optional(),
    favorite_artists: z.array(z.string()).optional(),
    notification_preferences: z.record(z.boolean()).optional(),
    privacy_settings: z.record(z.boolean()).optional(),
  }).optional(),
});

// GET /api/profile - Get current user's profile
export async function GET(request: NextRequest) {
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
    const userId = searchParams.get('user_id') || user.id;
    const includeStats = searchParams.get('include_stats') === 'true';

    // Get profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        membership:user_memberships(tier_id, points_balance, member_since)
      `)
      .eq('id', userId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let stats = null;
    if (includeStats) {
      // Get user stats
      const [
        { count: eventsAttended },
        { count: reviewsCount },
        { count: followersCount },
        { count: followingCount },
      ] = await Promise.all([
        supabase.from('tickets').select('*', { count: 'exact', head: true })
          .eq('user_id', userId).eq('status', 'used'),
        supabase.from('reviews').select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase.from('user_follows').select('*', { count: 'exact', head: true })
          .eq('followed_id', userId),
        supabase.from('user_follows').select('*', { count: 'exact', head: true })
          .eq('follower_id', userId),
      ]);

      stats = {
        events_attended: eventsAttended || 0,
        reviews_count: reviewsCount || 0,
        followers_count: followersCount || 0,
        following_count: followingCount || 0,
      };
    }

    return NextResponse.json({
      profile,
      stats,
      is_own_profile: userId === user.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PATCH /api/profile - Update current user's profile
export async function PATCH(request: NextRequest) {
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
    const validated = updateProfileSchema.parse(body);

    // Build update object
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (validated.first_name) updateData.first_name = validated.first_name;
    if (validated.last_name) updateData.last_name = validated.last_name;
    if (validated.display_name !== undefined) updateData.display_name = validated.display_name;
    if (validated.bio !== undefined) updateData.bio = validated.bio;
    if (validated.avatar_url !== undefined) updateData.avatar_url = validated.avatar_url;
    if (validated.cover_image_url !== undefined) updateData.cover_image_url = validated.cover_image_url;
    if (validated.phone !== undefined) updateData.phone = validated.phone;
    if (validated.date_of_birth !== undefined) updateData.date_of_birth = validated.date_of_birth;
    if (validated.gender !== undefined) updateData.gender = validated.gender;
    if (validated.location !== undefined) updateData.location = validated.location;
    if (validated.social_links !== undefined) updateData.social_links = validated.social_links;
    if (validated.preferences !== undefined) updateData.preferences = validated.preferences;

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// DELETE /api/profile - Delete account (soft delete)
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

    const body = await request.json();
    const { confirmation, reason } = body;

    if (confirmation !== 'DELETE_MY_ACCOUNT') {
      return NextResponse.json(
        { error: 'Please confirm account deletion by providing the confirmation code' },
        { status: 400 }
      );
    }

    // Soft delete - mark account as deleted
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        status: 'deleted',
        deleted_at: new Date().toISOString(),
        deletion_reason: reason,
      })
      .eq('id', user.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Create data subject request for GDPR compliance
    await supabase.from('data_subject_requests').insert({
      user_id: user.id,
      request_type: 'erasure',
      status: 'pending',
      requester_email: user.email,
      description: reason || 'User requested account deletion',
    });

    // Log security event
    await supabase.from('security_events').insert({
      user_id: user.id,
      event_type: 'data_deletion',
      description: 'User initiated account deletion',
    });

    return NextResponse.json({
      success: true,
      message: 'Account deletion initiated. Your data will be removed within 30 days.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
