import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const roomSchema = z.object({
  room_type: z.enum(['direct', 'group', 'project', 'event', 'department', 'broadcast']),
  name: z.string().max(255).optional(),
  description: z.string().optional(),
  project_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  is_private: z.boolean().default(false),
  member_ids: z.array(z.string().uuid()).optional(),
  settings: z.object({
    allow_reactions: z.boolean().default(true),
    allow_threads: z.boolean().default(true),
    allow_file_sharing: z.boolean().default(true),
    message_retention_days: z.number().nullable().optional(),
  }).optional(),
});

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

    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id, organization_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const room_type = searchParams.get('room_type');
    const project_id = searchParams.get('project_id');
    const event_id = searchParams.get('event_id');

    // Get rooms user is a member of
    let query = supabase
      .from('chat_rooms')
      .select(`
        *,
        members:chat_room_members(
          user_id, role, last_read_at,
          user:platform_users(id, full_name, avatar_url)
        ),
        last_message:chat_messages(id, content, created_at, sender:platform_users(full_name))
      `)
      .eq('is_archived', false);

    if (room_type) {
      query = query.eq('room_type', room_type);
    }
    if (project_id) {
      query = query.eq('project_id', project_id);
    }
    if (event_id) {
      query = query.eq('event_id', event_id);
    }

    const { data: rooms, error } = await query.order('updated_at', { ascending: false });

    if (error) throw error;

    // Filter to only rooms user is a member of
    const userRooms = rooms?.filter(room => 
      room.members?.some((m: { user_id: string; left_at: string | null }) => 
        m.user_id === platformUser.id && !m.left_at
      ) || !room.is_private
    );

    // Calculate unread counts
    const roomsWithUnread = userRooms?.map(room => {
      const membership = room.members?.find((m: { user_id: string }) => m.user_id === platformUser.id);
      const lastReadAt = membership?.last_read_at;
      
      return {
        ...room,
        unread_count: 0, // Would calculate from messages after last_read_at
        my_role: membership?.role || 'member',
      };
    });

    return NextResponse.json({ data: roomsWithUnread });
  } catch (error) {
    console.error('Get chat rooms error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat rooms' },
      { status: 500 }
    );
  }
}

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

    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id, organization_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = roomSchema.parse(body);

    // For direct messages, check if room already exists
    if (validated.room_type === 'direct' && validated.member_ids?.length === 1) {
      const otherUserId = validated.member_ids[0];
      
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          members:chat_room_members(user_id)
        `)
        .eq('room_type', 'direct')
        .contains('members', [{ user_id: platformUser.id }, { user_id: otherUserId }]);

      if (existingRoom && existingRoom.length > 0) {
        return NextResponse.json({ data: existingRoom[0] });
      }
    }

    // Create room
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .insert({
        organization_id: platformUser.organization_id,
        room_type: validated.room_type,
        name: validated.name,
        description: validated.description,
        project_id: validated.project_id,
        event_id: validated.event_id,
        is_private: validated.is_private,
        settings: validated.settings || {},
        created_by: platformUser.id,
      })
      .select()
      .single();

    if (roomError) throw roomError;

    // Add creator as owner
    await supabase.from('chat_room_members').insert({
      room_id: room.id,
      user_id: platformUser.id,
      role: 'owner',
    });

    // Add other members
    if (validated.member_ids && validated.member_ids.length > 0) {
      const memberInserts = validated.member_ids
        .filter(id => id !== platformUser.id)
        .map(user_id => ({
          room_id: room.id,
          user_id,
          role: 'member',
        }));

      if (memberInserts.length > 0) {
        await supabase.from('chat_room_members').insert(memberInserts);
      }
    }

    return NextResponse.json({ data: room }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Create chat room error:', error);
    return NextResponse.json(
      { error: 'Failed to create chat room' },
      { status: 500 }
    );
  }
}
