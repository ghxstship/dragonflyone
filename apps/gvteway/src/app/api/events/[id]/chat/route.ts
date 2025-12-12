export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Types for chat
interface ChatUser {
  full_name?: string;
  avatar_url?: string;
  role?: string;
}

interface ChatEvent {
  id: string;
  title: string;
  date: string;
}

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Table does not exist in schema - return empty response
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    // Get or create chat room for event
    const { data: initialChatRoom, error: roomError } = await supabase
      .from('event_chat_rooms')
      .select(`
        id,
        event_id,
        status,
        rules,
        events (
          id,
          title,
          date
        )
      `)
      .eq('event_id', params.id)
      .single();

    let chatRoom = initialChatRoom;

    if (roomError && (roomError.message?.includes('does not exist') || roomError.code === '42P01')) {
      return NextResponse.json({ chat_room: null, messages: [] });
    }

    if (roomError && roomError.code === 'PGRST116') {
      // Create chat room if it doesn't exist
      const { data: event } = await supabase
        .from('events')
        .select('id, title, date')
        .eq('id', params.id)
        .single();

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      const { data: newRoom, error: createError } = await supabase
        .from('event_chat_rooms')
        .insert({
          event_id: params.id,
          status: 'active',
          rules: [
            'Be respectful to other fans',
            'No hate speech or harassment',
            'No spam or self-promotion',
            'No sharing of illegal content',
            'Keep discussions relevant to the event',
          ],
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      chatRoom = { ...newRoom, events: event };
    } else if (roomError) {
      return NextResponse.json({ error: roomError.message }, { status: 500 });
    }

    if (!chatRoom) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('event_chat_messages')
      .select(`
        id,
        user_id,
        content,
        is_pinned,
        created_at,
        user:profiles!user_id(id, full_name, avatar_url, role)
      `)
      .eq('chat_room_id', chatRoom.id)
      .order('created_at', { ascending: true })
      .limit(100);

    if (messagesError) {
      return NextResponse.json({ error: messagesError.message }, { status: 500 });
    }

    // Get participant count
    const { count: participantCount } = await supabase
      .from('event_chat_messages')
      .select('user_id', { count: 'exact', head: true })
      .eq('chat_room_id', chatRoom.id);

    const formattedMessages = messages?.map(msg => {
      const user = msg.user as ChatUser | null;
      return {
        id: msg.id,
        user_id: msg.user_id,
        user_name: user?.full_name || 'Anonymous',
        user_avatar: user?.avatar_url,
        content: msg.content,
        created_at: msg.created_at,
        is_pinned: msg.is_pinned,
        is_moderator: ['admin', 'super_admin', 'moderator'].includes(user?.role || ''),
      };
    }) || [];

    const event = chatRoom.events as ChatEvent | null;
    return NextResponse.json({
      chat_room: {
        id: chatRoom.id,
        event_id: chatRoom.event_id,
        event_title: event?.title,
        event_date: event?.date,
        status: chatRoom.status,
        participant_count: participantCount || 0,
        rules: chatRoom.rules,
      },
      messages: formattedMessages,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ chat_room: null, messages: [] });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    if (content.length > 500) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 });
    }

    // Get chat room
    const { data: chatRoom, error: roomError } = await supabase
      .from('event_chat_rooms')
      .select('id, status')
      .eq('event_id', params.id)
      .single();

    if (roomError || !chatRoom) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }

    if (chatRoom.status !== 'active') {
      return NextResponse.json({ error: 'Chat room is not active' }, { status: 400 });
    }

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('event_chat_messages')
      .insert({
        chat_room_id: chatRoom.id,
        user_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (messageError) {
      return NextResponse.json({ error: messageError.message }, { status: 500 });
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ message: null });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
