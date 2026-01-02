export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const startConversationSchema = z.object({
  action: z.literal('start_conversation'),
  recipient_id: z.string().uuid(),
  initial_message: z.string().optional(),
});

const sendMessageSchema = z.object({
  action: z.literal('send_message'),
  conversation_id: z.string().uuid(),
  content: z.string().min(1),
  attachments: z.array(z.string()).optional(),
});

const directMessageActionSchema = z.union([startConversationSchema, sendMessageSchema]);

// Direct messaging within platform
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = authResult.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    `).contains('participant_ids', [userId]).order('updated_at', { ascending: false });

    return NextResponse.json({ conversations });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = authResult.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = directMessageActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'start_conversation') {
      const { recipient_id, initial_message } = validatedData as z.infer<typeof startConversationSchema>;

      // Check for existing conversation
      const { data: existing } = await supabase.from('conversations').select('id')
        .contains('participant_ids', [userId, recipient_id]).single();

      let conversationId = existing?.id;

      if (!conversationId) {
        const { data: conv } = await supabase.from('conversations').insert({
          participant_ids: [userId, recipient_id]
        }).select().single();
        conversationId = conv?.id;
      }

      if (initial_message) {
        await supabase.from('direct_messages').insert({
          conversation_id: conversationId, sender_id: userId, content: initial_message
        });
      }

      return NextResponse.json({ conversation_id: conversationId }, { status: 201 });
    }

    if (action === 'send_message') {
      const { conversation_id, content, attachments } = validatedData as z.infer<typeof sendMessageSchema>;

      const { data, error } = await supabase.from('direct_messages').insert({
        conversation_id, sender_id: userId, content, attachments: attachments || []
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      await supabase.from('conversations').update({ updated_at: new Date().toISOString() })
        .eq('id', conversation_id);

      return NextResponse.json({ message: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
