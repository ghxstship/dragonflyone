export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const ArtistSchema = z.object({
  organization_id: z.string().uuid(),
  name: z.string().min(1),
  artist_type: z.enum(['solo', 'band', 'dj', 'orchestra', 'ensemble', 'other']).default('band'),
  genres: z.array(z.string()).optional(),
  bio: z.string().optional(),
  hometown: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const status = searchParams.get('status');
    const artistType = searchParams.get('artist_type');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('artists')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (artistType && artistType !== 'all') {
      query = query.eq('artist_type', artistType);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,genres.cs.{${search}}`);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const summary = {
      total: count || 0,
      by_type: {
        solo: data?.filter(a => a.artist_type === 'solo').length || 0,
        band: data?.filter(a => a.artist_type === 'band').length || 0,
        dj: data?.filter(a => a.artist_type === 'dj').length || 0,
        other: data?.filter(a => !['solo', 'band', 'dj'].includes(a.artist_type)).length || 0,
      },
      verified: data?.filter(a => a.verified).length || 0,
    };

    return NextResponse.json({
      artists: data || [],
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to fetch artists' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = ArtistSchema.parse(body);

    const { data, error } = await supabase
      .from('artists')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ artist: data }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Failed to create artist' }, { status: 500 });
  }
}
