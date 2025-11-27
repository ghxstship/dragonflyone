import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const messageSchema = z.object({
  room_id: z.string().uuid(),
  parent_id: z.string().uuid().optional(),
  message_type: z.enum(['text', 'image', 'file', 'audio', 'video', 'system', 'poll', 'location']).default('text'),
  content: z.string().max(10000),
  attachments: z.array(z.object({
    type: z.string(),
    url: z.string().url(),
    name: z.string(),
    size: z.number().optional(),
    mime_type: z.string().optional(),
  })).optional(),
  mentions: z.array(z.string().uuid()).optional(),
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

    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const room_id = searchParams.get('room_id');
    const before = searchParams.get('before'); // For pagination
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!room_id) {
      return NextResponse.json(
        { error: 'room_id is required' },
        { status: 400 }
      );
    }

    // Verify user is member of room
    const { data: membership } = await supabase
      .from('chat_room_members')
      .select('id')
      .eq('room_id', room_id)
      .eq('user_id', platformUser.id)
      .is('left_at', null)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this room' },
        { status: 403 }
      );
    }

    let query = supabase
      .from('chat_messages')
      .select(`
        *,
        sender:platform_users!sender_id(id, full_name, avatar_url),
        replies:chat_messages!parent_id(id, content, sender:platform_users(full_name))
      `)
      .eq('room_id', room_id)
      .eq('is_deleted', false)
      .is('parent_id', null) // Only top-level messages
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Update last read timestamp
    await supabase
      .from('chat_room_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('room_id', room_id)
      .eq('user_id', platformUser.id);

    return NextResponse.json({
      data: data?.reverse(), // Return in chronological order
      has_more: data?.length === limit,
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
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
      .select('id, full_name')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = messageSchema.parse(body);

    // Verify user is member of room
    const { data: membership } = await supabase
      .from('chat_room_members')
      .select('id')
      .eq('room_id', validated.room_id)
      .eq('user_id', platformUser.id)
      .is('left_at', null)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this room' },
        { status: 403 }
      );
    }

    // Create message
    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: validated.room_id,
        sender_id: platformUser.id,
        parent_id: validated.parent_id,
        message_type: validated.message_type,
        content: validated.content,
        attachments: validated.attachments || [],
        mentions: validated.mentions || [],
      })
      .select(`
        *,
        sender:platform_users!sender_id(id, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    // Clear typing indicator
    await supabase
      .from('typing_indicators')
      .delete()
      .eq('room_id', validated.room_id)
      .eq('user_id', platformUser.id);

    // TODO: Send push notifications to mentioned users and room members

    return NextResponse.json({ data: message }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
