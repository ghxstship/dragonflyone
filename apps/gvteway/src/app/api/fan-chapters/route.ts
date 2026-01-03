export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/fan-chapters - List fan clubs from fan_clubs (3NF table from 0029 migration)
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get('artist_id');
    const search = searchParams.get('search');

    // Query fan_clubs - the 3NF table for fan chapters/clubs
    let query = supabase
      .from('fan_clubs')
      .select(`
        *,
        artist:legend_people!artist_id(id, display_name, avatar_url),
        members:fan_club_members(count)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (artistId) {
      query = query.eq('artist_id', artistId);
    }
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching fan clubs:', error);
      return NextResponse.json({ chapters: [], total: 0 });
    }

    return NextResponse.json({ chapters: data || [], total: data?.length || 0 });
  } catch (error) {
    logger.error('Error in GET /api/fan-chapters:', error instanceof Error ? error : undefined);
    return NextResponse.json({ chapters: [], total: 0 });
  }
}

// POST /api/fan-chapters - Create fan club or join using fan_clubs/fan_club_members (3NF tables)
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

    // Get the person_id for the current user
    const { data: personData } = await supabase
      .from('legend_people')
      .select('id')
      .eq('platform_user_id', user.id)
      .single();

    if (!personData) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'create_chapter') {
      const { artist_id, name, description, organization_id, tier_benefits } = body;

      if (!organization_id) {
        return NextResponse.json({ error: 'organization_id is required' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('fan_clubs')
        .insert({
          organization_id,
          artist_id,
          name,
          description,
          tier_benefits: tier_benefits || {},
          is_active: true,
          created_by: personData.id,
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating fan club:', error);
        return NextResponse.json({ error: 'Failed to create fan club', details: error.message }, { status: 500 });
      }

      // Add creator as first member with admin role
      await supabase.from('fan_club_members').insert({
        fan_club_id: data.id,
        person_id: personData.id,
        membership_tier: 'founder',
        is_active: true,
      });

      return NextResponse.json({ chapter: data }, { status: 201 });
    }

    if (action === 'join') {
      const { fan_club_id, membership_tier } = body;

      const { data: existing } = await supabase
        .from('fan_club_members')
        .select('id')
        .eq('fan_club_id', fan_club_id)
        .eq('person_id', personData.id)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Already a member' }, { status: 400 });
      }

      const { error } = await supabase.from('fan_club_members').insert({
        fan_club_id,
        person_id: personData.id,
        membership_tier: membership_tier || 'basic',
        is_active: true,
      });

      if (error) {
        logger.error('Error joining fan club:', error);
        return NextResponse.json({ error: 'Failed to join fan club' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Joined fan club' });
    }

    if (action === 'create_event') {
      const { fan_club_id, name, description, start_datetime, place_id, organization_id } = body;

      if (!organization_id) {
        return NextResponse.json({ error: 'organization_id is required' }, { status: 400 });
      }

      // Create event in legend_events (3NF table)
      const { data, error } = await supabase
        .from('legend_events')
        .insert({
          organization_id,
          name,
          description,
          start_datetime,
          place_id,
          event_type: 'fan_meetup',
          status: 'active',
          metadata: { fan_club_id },
          created_by: personData.id,
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating fan club event:', error);
        return NextResponse.json({ error: 'Failed to create event', details: error.message }, { status: 500 });
      }
      return NextResponse.json({ event: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error('Error in POST /api/fan-chapters:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}

// Haversine formula for calculating distance between two coordinates
// Used for finding nearby chapters and geographic filtering
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
