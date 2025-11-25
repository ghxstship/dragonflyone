import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is part of conversation
    const { data: conversation } = await supabase
      .from('direct_message_conversations')
      .select('id')
      .eq('id', params.id)
      .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
      .single();

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get messages
    const { data: messages, error } = await supabase
      .from('direct_messages')
      .select(`
        id,
        sender_id,
        content,
        created_at,
        read,
        sender:profiles!sender_id(id, full_name, avatar_url)
      `)
      .eq('conversation_id', params.id)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mark messages as read
    await supabase
      .from('direct_messages')
      .update({ read: true })
      .eq('conversation_id', params.id)
      .neq('sender_id', user.id)
      .eq('read', false);

    const formattedMessages = messages?.map(m => ({
      id: m.id,
      sender_id: m.sender_id,
      sender_name: (m.sender as any)?.full_name || 'Unknown',
      sender_avatar: (m.sender as any)?.avatar_url,
      content: m.content,
      created_at: m.created_at,
      read: m.read,
    })) || [];

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
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
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is part of conversation
    const { data: conversation } = await supabase
      .from('direct_message_conversations')
      .select('id')
      .eq('id', params.id)
      .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
      .single();

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Create message
    const { data: message, error } = await supabase
      .from('direct_messages')
      .insert({
        conversation_id: params.id,
        sender_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update conversation last message
    await supabase
      .from('direct_message_conversations')
      .update({
        last_message: content.trim().substring(0, 100),
        last_message_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
