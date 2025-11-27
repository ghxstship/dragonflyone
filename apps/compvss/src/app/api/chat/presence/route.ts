import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const presenceSchema = z.object({
  status: z.enum(['online', 'away', 'busy', 'dnd', 'offline']),
  status_text: z.string().max(255).optional(),
  status_emoji: z.string().max(10).optional(),
  current_room_id: z.string().uuid().optional().nullable(),
});

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const user_ids = searchParams.get('user_ids')?.split(',').filter(Boolean);
    const room_id = searchParams.get('room_id');

    let query = supabase
      .from('user_presence')
      .select(`
        *,
        user:platform_users(id, full_name, avatar_url)
      `);

    if (user_ids && user_ids.length > 0) {
      query = query.in('user_id', user_ids);
    }

    if (room_id) {
      // Get presence for all members of a room
      const { data: members } = await supabase
        .from('chat_room_members')
        .select('user_id')
        .eq('room_id', room_id)
        .is('left_at', null);

      if (members) {
        const memberIds = members.map(m => m.user_id);
        query = query.in('user_id', memberIds);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Get presence error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch presence' },
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

    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = presenceSchema.parse(body);

    const { data, error } = await supabase
      .from('user_presence')
      .upsert({
        user_id: platformUser.id,
        status: validated.status,
        status_text: validated.status_text,
        status_emoji: validated.status_emoji,
        current_room_id: validated.current_room_id,
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Update presence error:', error);
    return NextResponse.json(
      { error: 'Failed to update presence' },
      { status: 500 }
    );
  }
}
