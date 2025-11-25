import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MessageSchema = z.object({
  conversation_id: z.string().uuid().optional(),
  message: z.string(),
  event_id: z.string().uuid().optional(),
  order_id: z.string().uuid().optional(),
  category: z.enum(['general', 'tickets', 'refunds', 'venue', 'accessibility', 'other']).optional(),
});

// GET /api/guest-chat - Get conversations and messages
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

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversation_id');
    const action = searchParams.get('action');

    if (action === 'my_conversations') {
      const { data: conversations } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          last_message:chat_messages(message, created_at, sender_type)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      // Get unread count for each conversation
      const conversationsWithUnread = await Promise.all(
        (conversations || []).map(async (conv) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('id', { count: 'exact' })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_type', 'user');

          return {
            ...conv,
            unread_count: count || 0,
          };
        })
      );

      return NextResponse.json({ conversations: conversationsWithUnread });
    }

    if (action === 'faq') {
      // Get frequently asked questions
      const { data: faqs } = await supabase
        .from('chat_faqs')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      return NextResponse.json({ faqs: faqs || [] });
    }

    if (action === 'quick_replies') {
      // Get quick reply options based on context
      const eventId = searchParams.get('event_id');
      const category = searchParams.get('category');

      let replies = [
        { id: 'hours', text: 'What are the venue hours?' },
        { id: 'parking', text: 'Where can I park?' },
        { id: 'refund', text: 'How do I get a refund?' },
        { id: 'transfer', text: 'Can I transfer my tickets?' },
        { id: 'accessibility', text: 'What accessibility options are available?' },
        { id: 'contact', text: 'How do I contact support?' },
      ];

      if (eventId) {
        replies.unshift(
          { id: 'event_time', text: 'What time does the event start?' },
          { id: 'event_location', text: 'Where is the event located?' }
        );
      }

      return NextResponse.json({ quick_replies: replies });
    }

    if (conversationId) {
      // Get conversation with messages
      const { data: conversation } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      const { data: messages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at');

      // Mark messages as read
      await supabase
        .from('chat_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_type', 'user')
        .eq('is_read', false);

      return NextResponse.json({
        conversation,
        messages: messages || [],
      });
    }

    return NextResponse.json({ error: 'Conversation ID or action required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch chat data' }, { status: 500 });
  }
}

// POST /api/guest-chat - Send message or start conversation
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
    const action = body.action || 'send_message';

    if (action === 'start_conversation') {
      const { subject, category, event_id, order_id, initial_message } = body;

      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          subject,
          category: category || 'general',
          event_id,
          order_id,
          status: 'open',
        })
        .select()
        .single();

      if (convError) {
        return NextResponse.json({ error: convError.message }, { status: 500 });
      }

      // Add initial message
      if (initial_message) {
        await supabase.from('chat_messages').insert({
          conversation_id: conversation.id,
          sender_type: 'user',
          sender_id: user.id,
          message: initial_message,
        });
      }

      // Generate auto-response based on category
      const autoResponse = await generateAutoResponse(category, initial_message, event_id);
      
      if (autoResponse) {
        await supabase.from('chat_messages').insert({
          conversation_id: conversation.id,
          sender_type: 'bot',
          message: autoResponse.message,
          metadata: autoResponse.metadata,
        });
      }

      return NextResponse.json({ conversation }, { status: 201 });
    } else if (action === 'send_message') {
      const validated = MessageSchema.parse(body);

      let conversationId = validated.conversation_id;

      // Create conversation if not exists
      if (!conversationId) {
        const { data: conversation } = await supabase
          .from('chat_conversations')
          .insert({
            user_id: user.id,
            category: validated.category || 'general',
            event_id: validated.event_id,
            order_id: validated.order_id,
            status: 'open',
          })
          .select()
          .single();

        conversationId = conversation?.id;
      }

      // Add user message
      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'user',
          sender_id: user.id,
          message: validated.message,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update conversation
      await supabase
        .from('chat_conversations')
        .update({
          updated_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

      // Generate auto-response
      const autoResponse = await generateAutoResponse(
        validated.category,
        validated.message,
        validated.event_id
      );

      let botMessage = null;
      if (autoResponse) {
        const { data: botMsg } = await supabase
          .from('chat_messages')
          .insert({
            conversation_id: conversationId,
            sender_type: 'bot',
            message: autoResponse.message,
            metadata: autoResponse.metadata,
          })
          .select()
          .single();

        botMessage = botMsg;
      }

      return NextResponse.json({
        message,
        bot_response: botMessage,
        conversation_id: conversationId,
      });
    } else if (action === 'rate_conversation') {
      const { conversation_id, rating, feedback } = body;

      await supabase
        .from('chat_conversations')
        .update({
          rating,
          feedback,
          rated_at: new Date().toISOString(),
        })
        .eq('id', conversation_id)
        .eq('user_id', user.id);

      return NextResponse.json({ success: true });
    } else if (action === 'close_conversation') {
      const { conversation_id } = body;

      await supabase
        .from('chat_conversations')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
        })
        .eq('id', conversation_id)
        .eq('user_id', user.id);

      return NextResponse.json({ success: true });
    } else if (action === 'request_agent') {
      const { conversation_id } = body;

      // Update conversation to request human agent
      await supabase
        .from('chat_conversations')
        .update({
          status: 'waiting_agent',
          agent_requested_at: new Date().toISOString(),
        })
        .eq('id', conversation_id);

      // Add system message
      await supabase.from('chat_messages').insert({
        conversation_id,
        sender_type: 'system',
        message: 'A support agent has been requested. Someone will be with you shortly.',
      });

      // Notify support team
      const { data: supportAgents } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'support_agent');

      for (const agent of supportAgents || []) {
        await supabase.from('unified_notifications').insert({
          user_id: agent.user_id,
          title: 'New Chat Request',
          message: 'A guest is requesting support assistance',
          type: 'action_required',
          priority: 'high',
          source_platform: 'gvteway',
          source_entity_type: 'chat_conversation',
          source_entity_id: conversation_id,
        });
      }

      return NextResponse.json({ success: true, status: 'waiting_agent' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// Helper function to generate auto-responses
async function generateAutoResponse(
  category: string | undefined,
  message: string,
  eventId: string | undefined
): Promise<{ message: string; metadata?: any } | null> {
  const lowerMessage = message.toLowerCase();

  // Check for common questions
  if (lowerMessage.includes('refund')) {
    return {
      message: 'For refund requests, please visit your order history and select the order you\'d like to refund. If the event allows refunds, you\'ll see a "Request Refund" button. Refunds are typically processed within 5-7 business days.',
      metadata: { topic: 'refunds', action_suggested: 'view_orders' },
    };
  }

  if (lowerMessage.includes('transfer') || lowerMessage.includes('sell')) {
    return {
      message: 'You can transfer tickets to another person through your order details. Go to "My Tickets", select the tickets you want to transfer, and enter the recipient\'s email address. They\'ll receive instructions to claim the tickets.',
      metadata: { topic: 'transfer', action_suggested: 'view_tickets' },
    };
  }

  if (lowerMessage.includes('parking')) {
    if (eventId) {
      const { data: event } = await supabase
        .from('events')
        .select('venue_name, parking_info')
        .eq('id', eventId)
        .single();

      if (event?.parking_info) {
        return {
          message: `Parking information for ${event.venue_name}: ${event.parking_info}`,
          metadata: { topic: 'parking', event_id: eventId },
        };
      }
    }
    return {
      message: 'Parking information varies by venue. Please check the event details page for specific parking instructions, or let me know which event you\'re attending.',
      metadata: { topic: 'parking' },
    };
  }

  if (lowerMessage.includes('time') || lowerMessage.includes('start') || lowerMessage.includes('doors')) {
    if (eventId) {
      const { data: event } = await supabase
        .from('events')
        .select('name, event_date, doors_open')
        .eq('id', eventId)
        .single();

      if (event) {
        const eventDate = new Date(event.event_date);
        return {
          message: `${event.name} starts at ${eventDate.toLocaleTimeString()}. ${event.doors_open ? `Doors open at ${event.doors_open}.` : ''}`,
          metadata: { topic: 'event_time', event_id: eventId },
        };
      }
    }
    return {
      message: 'Event times are listed on each event\'s detail page. Which event are you asking about?',
      metadata: { topic: 'event_time' },
    };
  }

  if (lowerMessage.includes('accessibility') || lowerMessage.includes('wheelchair') || lowerMessage.includes('ada')) {
    return {
      message: 'We\'re committed to accessibility. Most venues offer wheelchair-accessible seating, assistive listening devices, and accessible restrooms. For specific accessibility needs, please contact us and we\'ll ensure you have the best experience possible.',
      metadata: { topic: 'accessibility' },
    };
  }

  if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
    return {
      message: 'You can reach our support team at support@gvteway.com or call 1-800-GVTEWAY (1-800-488-3929). Our hours are Monday-Friday 9am-9pm EST, and Saturday-Sunday 10am-6pm EST.',
      metadata: { topic: 'contact' },
    };
  }

  // Default response
  return {
    message: 'Thanks for your message! I\'m here to help with questions about events, tickets, refunds, and more. If you need to speak with a support agent, just let me know.',
    metadata: { topic: 'general' },
  };
}
