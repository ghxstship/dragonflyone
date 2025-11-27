import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

const messageSchema = z.object({
  platform: z.string(),
  external_id: z.string(),
  sender_name: z.string(),
  sender_handle: z.string().optional(),
  content: z.string(),
  message_type: z.enum(['comment', 'dm', 'mention', 'review']),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    const type = searchParams.get('type');
    const assignedTo = searchParams.get('assigned_to');

    let query = supabase
      .from('social_inbox_messages')
      .select(`*, responses:social_inbox_responses(*)`)
      .order('received_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (platform) query = query.eq('platform', platform);
    if (type) query = query.eq('message_type', type);
    if (assignedTo) query = query.eq('assigned_to', assignedTo);

    const { data: messages, error } = await query.limit(100);
    if (error) throw error;

    // Get stats
    const { data: allMessages } = await supabase
      .from('social_inbox_messages')
      .select('status, platform')
      .gte('received_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const stats = {
      total_24h: allMessages?.length || 0,
      unread: allMessages?.filter(m => m.status === 'unread').length || 0,
      pending: allMessages?.filter(m => m.status === 'pending').length || 0,
      by_platform: allMessages?.reduce((acc: Record<string, number>, m) => {
        acc[m.platform] = (acc[m.platform] || 0) + 1;
        return acc;
      }, {}),
    };

    return NextResponse.json({ messages, stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'ingest') {
      const validated = messageSchema.parse(body.data);

      const { data: message, error } = await supabase
        .from('social_inbox_messages')
        .insert({
          ...validated,
          status: 'unread',
          received_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ message }, { status: 201 });
    }

    if (action === 'respond') {
      const { message_id, content, responded_by } = body;

      const { data: response, error } = await supabase
        .from('social_inbox_responses')
        .insert({
          message_id,
          content,
          responded_by,
          sent_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update message status
      await supabase
        .from('social_inbox_messages')
        .update({ status: 'responded', responded_at: new Date().toISOString() })
        .eq('id', message_id);

      return NextResponse.json({ response }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (action === 'assign') {
      const { data, error } = await supabase
        .from('social_inbox_messages')
        .update({ assigned_to: updates.assigned_to, status: 'pending' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ message: data });
    }

    if (action === 'mark_read') {
      const { data, error } = await supabase
        .from('social_inbox_messages')
        .update({ status: 'read' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ message: data });
    }

    if (action === 'archive') {
      const { data, error } = await supabase
        .from('social_inbox_messages')
        .update({ status: 'archived' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ message: data });
    }

    const { data, error } = await supabase
      .from('social_inbox_messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ message: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
