export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}



export async function GET(request: NextRequest) {
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

    const { data, error } = await supabase
      .from('support_conversations')
      .select(`
        *,
        events (
          id,
          title
        ),
        support_messages (
          id,
          sender,
          content,
          agent_name,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    interface SupportEventInfo { title?: string }
    interface SupportMessage { id: string; sender: string; content: string; agent_name?: string; created_at: string }
    const conversations = data?.map(conv => {
      const event = conv.events as SupportEventInfo | null;
      const messages = (conv.support_messages || []) as SupportMessage[];
      return {
        id: conv.id,
        subject: conv.subject,
        status: conv.status,
        event_id: conv.event_id,
        event_title: event?.title,
        created_at: conv.created_at,
        messages: messages
          .sort((a: SupportMessage, b: SupportMessage) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((msg: SupportMessage) => ({
            id: msg.id,
            sender: msg.sender,
            content: msg.content,
            agent_name: msg.agent_name,
            timestamp: msg.created_at,
          })),
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

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('support_conversations')
      .insert({
        user_id: user.id,
        subject: body.subject,
        category: body.category || 'general',
        event_id: body.event_id || null,
        order_id: body.order_id || null,
        status: 'open',
      })
      .select()
      .single();

    if (convError) {
      return NextResponse.json({ error: convError.message }, { status: 500 });
    }

    // Add system message
    await supabase
      .from('support_messages')
      .insert({
        conversation_id: conversation.id,
        sender: 'system',
        content: 'Conversation started. A support agent will be with you shortly.',
      });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
