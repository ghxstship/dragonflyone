import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const photoSchema = z.object({
  photo_url: z.string().url(),
  thumbnail_url: z.string().url().optional(),
  project_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  caption: z.string().optional(),
  location: z.string().max(255).optional(),
  photo_date: z.string().optional(),
  tags: z.array(z.string()).optional(),
  tagged_users: z.array(z.string().uuid()).optional(),
  visibility: z.enum(['public', 'connections', 'private']).default('connections'),
  is_profile_photo: z.boolean().default(false),
  is_cover_photo: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
});

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const project_id = searchParams.get('project_id');
    const event_id = searchParams.get('event_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('crew_photos')
      .select(`
        *,
        user:platform_users!user_id(id, email, full_name, avatar_url),
        project:projects(id, name),
        event:events(id, name)
      `, { count: 'exact' });

    if (user_id) {
      query = query.eq('user_id', user_id);
    }
    if (project_id) {
      query = query.eq('project_id', project_id);
    }
    if (event_id) {
      query = query.eq('event_id', event_id);
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
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
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
    const validated = photoSchema.parse(body);

    // If setting as profile photo, unset any existing
    if (validated.is_profile_photo) {
      await supabase
        .from('crew_photos')
        .update({ is_profile_photo: false })
        .eq('user_id', user.id)
        .eq('is_profile_photo', true);
    }

    // If setting as cover photo, unset any existing
    if (validated.is_cover_photo) {
      await supabase
        .from('crew_photos')
        .update({ is_cover_photo: false })
        .eq('user_id', user.id)
        .eq('is_cover_photo', true);
    }

    const { data, error } = await supabase
      .from('crew_photos')
      .insert({
        user_id: user.id,
        ...validated,
      })
      .select()
      .single();

    if (error) throw error;

    // Create activity feed entry
    await supabase.from('crew_activity_feed').insert({
      user_id: user.id,
      activity_type: 'photo_upload',
      target_type: 'photo',
      target_id: data.id,
      content: validated.caption,
      visibility: validated.visibility,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}
