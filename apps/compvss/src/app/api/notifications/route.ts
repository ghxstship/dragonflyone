export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin, fromDynamic } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';

const createNotificationSchema = z.object({
  recipient_ids: z.array(z.string().uuid()).min(1),
  title: z.string().min(1).max(255),
  message: z.string().min(1).max(1000),
  type: z.enum(['info', 'success', 'warning', 'error', 'urgent']),
  action_url: z.string().url().optional(),
  action_label: z.string().max(50).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export const GET = apiRoute(
  async (request: NextRequest, context: Record<string, unknown>) => {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const userId = (context.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data: notifications, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch notifications', message: error.message },
        { status: 500 }
      );
    }

    const { count: unreadCount } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    return NextResponse.json({ 
      notifications: notifications || [], 
      unreadCount: unreadCount || 0 
    });
  },
  {
    auth: true,
    audit: { action: 'notifications:list', resource: 'notifications' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest, context: Record<string, unknown>) => {
    const body = await request.json();
    const data = createNotificationSchema.parse(body);
    const userId = (context.user as { id?: string })?.id;

    const notificationsToInsert = data.recipient_ids.map(recipientId => ({
      user_id: recipientId,
      created_by: userId,
      title: data.title,
      message: data.message,
      type: data.type === 'urgent' ? 'system' : data.type,
      link: data.action_url,
      action_type: data.action_label,
      priority: data.priority,
      is_read: false,
    }));

    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .insert(notificationsToInsert)
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create notifications', message: error.message },
        { status: 500 }
      );
    }

    interface NotificationChannel { type: string; user_id: string; enabled: boolean }
    for (const recipientId of data.recipient_ids) {
      await fromDynamic(supabaseAdmin, 'notification_channels')
        .select('*')
        .eq('user_id', recipientId)
        .eq('enabled', true)
        .then(({ data: channels }: { data: NotificationChannel[] | null }) => {
          channels?.forEach(async (channel: NotificationChannel) => {
            if (channel.type === 'realtime') {
              await supabaseAdmin
                .channel('notifications')
                .send({
                  type: 'broadcast',
                  event: 'notification',
                  payload: { recipient_id: recipientId, notification: notifications[0] },
                });
            }
          });
        });
    }

    return NextResponse.json({ 
      success: true,
      sent: notifications?.length || 0 
    }, { status: 201 });
  },
  {
    auth: true,
    validation: createNotificationSchema,
    audit: { action: 'notifications:create', resource: 'notifications' },
  }
);

export const PATCH = apiRoute(
  async (request: NextRequest, context: Record<string, unknown>) => {
    const body = await request.json();
    const { notification_ids, read } = z.object({
      notification_ids: z.array(z.string().uuid()),
      read: z.boolean(),
    }).parse(body);
    const userId = (context.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: read, read_at: read ? new Date().toISOString() : null })
      .in('id', notification_ids)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update notifications', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, updated: notification_ids.length });
  },
  {
    auth: true,
    audit: { action: 'notifications:update', resource: 'notifications' },
  }
);
