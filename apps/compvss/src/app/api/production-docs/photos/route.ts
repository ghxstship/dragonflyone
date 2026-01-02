export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole, logger } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const photoSchema = z.object({
  album_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  file_url: z.string().url(),
  thumbnail_url: z.string().url().optional(),
  file_name: z.string().max(255).optional(),
  file_size: z.number().optional(),
  mime_type: z.string().max(100).optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  caption: z.string().optional(),
  alt_text: z.string().max(500).optional(),
  taken_at: z.string().optional(),
  location_name: z.string().max(255).optional(),
  gps_latitude: z.number().optional(),
  gps_longitude: z.number().optional(),
  photo_type: z.enum(['equipment', 'venue', 'crew', 'audience', 'artist', 'setup', 'damage', 'safety', 'marketing', 'other']).optional(),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().default(false),
});

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
    const album_id = searchParams.get('album_id');
    const project_id = searchParams.get('project_id');
    const event_id = searchParams.get('event_id');
    const photo_type = searchParams.get('photo_type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('production_photos')
      .select(`
        *,
        album:production_albums(id, name, album_type),
        uploader:platform_users!uploaded_by(id, full_name, avatar_url)
      `, { count: 'exact' });

    if (album_id) {
      query = query.eq('album_id', album_id);
    }
    if (project_id) {
      query = query.eq('project_id', project_id);
    }
    if (event_id) {
      query = query.eq('event_id', event_id);
    }
    if (photo_type) {
      query = query.eq('photo_type', photo_type);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
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
    logger.error('Get production photos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
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

    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id')
      .eq('auth_user_id', userId)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = photoSchema.parse(body);

    const { data, error } = await supabase
      .from('production_photos')
      .insert({
        ...validated,
        tags: validated.tags || [],
        uploaded_by: platformUser.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Create timeline entry
    await supabase.from('production_timeline_entries').insert({
      project_id: validated.project_id,
      event_id: validated.event_id,
      entry_type: 'photo',
      title: validated.title || 'Photo uploaded',
      description: validated.description,
      related_photo_id: data.id,
      created_by: platformUser.id,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Upload production photo error:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}
