export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createGuestArtistSchema = z.object({
  event_id: z.string().uuid(),
  artist_id: z.string().uuid(),
  host_artist_id: z.string().uuid().optional(),
  appearance_time: z.string().optional(),
  songs: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const updateGuestArtistSchema = z.object({
  id: z.string().uuid(),
  status: z.string().optional(),
  checked_in: z.boolean().optional(),
  actual_appearance_time: z.string().optional(),
});

// Guest artist coordination
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    const { data, error } = await supabase.from('guest_artists').select(`
      *, artist:artists(id, name), host_artist:artists!host_artist_id(id, name)
    `).eq('event_id', eventId).order('appearance_time', { ascending: true });

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ guest_artists: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createGuestArtistSchema.parse(body);
    const { event_id, artist_id, host_artist_id, appearance_time, songs, requirements, notes } = validatedData;

    const { data, error } = await supabase.from('guest_artists').insert({
      event_id, artist_id, host_artist_id, appearance_time,
      songs: songs || [], requirements: requirements || [], notes, status: 'confirmed'
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ guest_artist: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateGuestArtistSchema.parse(body);
    const { id, status, checked_in, actual_appearance_time } = validatedData;

    await supabase.from('guest_artists').update({
      status, checked_in, actual_appearance_time,
      checked_in_at: checked_in ? new Date().toISOString() : null
    }).eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
