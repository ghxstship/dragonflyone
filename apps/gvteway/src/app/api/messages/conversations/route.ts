import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    const { data, error } = await supabase
      .from('direct_message_conversations')
      .select(`
        id,
        participant1_id,
        participant2_id,
        last_message,
        last_message_at,
        participant1:profiles!participant1_id(id, full_name, avatar_url, is_verified),
        participant2:profiles!participant2_id(id, full_name, avatar_url, is_verified)
      `)
      .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get unread counts
    const conversationIds = data?.map(c => c.id) || [];
    const { data: unreadCounts } = await supabase
      .from('direct_messages')
      .select('conversation_id')
      .in('conversation_id', conversationIds)
      .neq('sender_id', user.id)
      .eq('read', false);

    const unreadMap: Record<string, number> = {};
    unreadCounts?.forEach(m => {
      unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] || 0) + 1;
    });

    const conversations = data?.map(conv => {
      const isParticipant1 = conv.participant1_id === user.id;
      const participant = isParticipant1 ? conv.participant2 : conv.participant1;

      return {
        id: conv.id,
        participant_id: (participant as any)?.id,
        participant_name: (participant as any)?.full_name || 'Unknown',
        participant_avatar: (participant as any)?.avatar_url,
        participant_verified: (participant as any)?.is_verified || false,
        last_message: conv.last_message,
        last_message_at: conv.last_message_at,
        unread_count: unreadMap[conv.id] || 0,
      };
    }) || [];

    return NextResponse.json({ conversations });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const body = await request.json();
    const { participant_id } = body;

    if (!participant_id) {
      return NextResponse.json({ error: 'Participant ID is required' }, { status: 400 });
    }

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('direct_message_conversations')
      .select('id')
      .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${participant_id}),and(participant1_id.eq.${participant_id},participant2_id.eq.${user.id})`)
      .single();

    if (existing) {
      return NextResponse.json({ conversation_id: existing.id });
    }

    // Create new conversation
    const { data: conversation, error } = await supabase
      .from('direct_message_conversations')
      .insert({
        participant1_id: user.id,
        participant2_id: participant_id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversation_id: conversation.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
