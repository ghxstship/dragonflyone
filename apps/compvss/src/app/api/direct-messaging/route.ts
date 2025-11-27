import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Direct messaging within platform
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversation_id');

    if (conversationId) {
      const { data: messages } = await supabase.from('direct_messages').select(`
        *, sender:platform_users!sender_id(first_name, last_name)
      `).eq('conversation_id', conversationId).order('sent_at', { ascending: true });

      return NextResponse.json({ messages });
    }

    // Get conversations
    const { data: conversations } = await supabase.from('conversations').select(`
      *, participants:conversation_participants(user:platform_users(id, first_name, last_name)),
      last_message:direct_messages(content, sent_at)
    `).contains('participant_ids', [user.id]).order('updated_at', { ascending: false });

    return NextResponse.json({ conversations });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'start_conversation') {
      const { recipient_id, initial_message } = body;

      // Check for existing conversation
      const { data: existing } = await supabase.from('conversations').select('id')
        .contains('participant_ids', [user.id, recipient_id]).single();

      let conversationId = existing?.id;

      if (!conversationId) {
        const { data: conv } = await supabase.from('conversations').insert({
          participant_ids: [user.id, recipient_id]
        }).select().single();
        conversationId = conv?.id;
      }

      if (initial_message) {
        await supabase.from('direct_messages').insert({
          conversation_id: conversationId, sender_id: user.id, content: initial_message
        });
      }

      return NextResponse.json({ conversation_id: conversationId }, { status: 201 });
    }

    if (action === 'send_message') {
      const { conversation_id, content, attachments } = body;

      const { data, error } = await supabase.from('direct_messages').insert({
        conversation_id, sender_id: user.id, content, attachments: attachments || []
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await supabase.from('conversations').update({ updated_at: new Date().toISOString() })
        .eq('id', conversation_id);

      return NextResponse.json({ message: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
