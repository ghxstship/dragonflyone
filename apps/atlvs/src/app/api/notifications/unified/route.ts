import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const NotificationSchema = z.object({
  user_id: z.string().uuid().optional(),
  user_ids: z.array(z.string().uuid()).optional(),
  role: z.string().optional(),
  title: z.string(),
  message: z.string(),
  type: z.enum(['info', 'success', 'warning', 'error', 'action_required']).default('info'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  channels: z.array(z.enum(['in_app', 'email', 'sms', 'push'])).default(['in_app']),
  link: z.string().optional(),
  source_platform: z.enum(['atlvs', 'compvss', 'gvteway']),
  source_entity_type: z.string().optional(),
  source_entity_id: z.string().uuid().optional(),
  expires_at: z.string().optional(),
  action_buttons: z.array(z.object({
    label: z.string(),
    action: z.string(),
    style: z.enum(['primary', 'secondary', 'danger']).optional(),
  })).optional(),
});

// GET /api/notifications/unified - Get notifications across platforms
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
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
    const platform = searchParams.get('platform');
    const type = searchParams.get('type');
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('unified_notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (platform) {
      query = query.eq('source_platform', platform);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data: notifications, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get unread counts by platform
    const { data: unreadCounts } = await supabase
      .from('unified_notifications')
      .select('source_platform')
      .eq('user_id', user.id)
      .eq('is_read', false);

    const countsByPlatform: Record<string, number> = {
      atlvs: 0,
      compvss: 0,
      gvteway: 0,
    };

    unreadCounts?.forEach(n => {
      if (n.source_platform && countsByPlatform[n.source_platform] !== undefined) {
        countsByPlatform[n.source_platform]++;
      }
    });

    return NextResponse.json({
      notifications: notifications || [],
      total: count || 0,
      unread_counts: countsByPlatform,
      total_unread: unreadCounts?.length || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST /api/notifications/unified - Send unified notification
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
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
    const action = body.action || 'send';

    if (action === 'send') {
      const validated = NotificationSchema.parse(body);

      // Determine recipients
      let recipientIds: string[] = [];

      if (validated.user_id) {
        recipientIds = [validated.user_id];
      } else if (validated.user_ids) {
        recipientIds = validated.user_ids;
      } else if (validated.role) {
        // Get users with the specified role
        const { data: roleUsers } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', validated.role);
        recipientIds = roleUsers?.map(u => u.user_id) || [];
      }

      if (recipientIds.length === 0) {
        return NextResponse.json({ error: 'No recipients specified' }, { status: 400 });
      }

      // Create notifications for each recipient
      const notifications = recipientIds.map(userId => ({
        user_id: userId,
        title: validated.title,
        message: validated.message,
        type: validated.type,
        priority: validated.priority,
        channels: validated.channels,
        link: validated.link,
        source_platform: validated.source_platform,
        source_entity_type: validated.source_entity_type,
        source_entity_id: validated.source_entity_id,
        expires_at: validated.expires_at,
        action_buttons: validated.action_buttons,
        is_read: false,
        sent_by: user.id,
      }));

      const { data: created, error } = await supabase
        .from('unified_notifications')
        .insert(notifications)
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Queue delivery for other channels
      const deliveryQueue = [];

      for (const notification of created || []) {
        if (validated.channels.includes('email')) {
          deliveryQueue.push({
            notification_id: notification.id,
            channel: 'email',
            status: 'pending',
          });
        }
        if (validated.channels.includes('sms')) {
          deliveryQueue.push({
            notification_id: notification.id,
            channel: 'sms',
            status: 'pending',
          });
        }
        if (validated.channels.includes('push')) {
          deliveryQueue.push({
            notification_id: notification.id,
            channel: 'push',
            status: 'pending',
          });
        }
      }

      if (deliveryQueue.length > 0) {
        await supabase.from('notification_delivery_queue').insert(deliveryQueue);
      }

      return NextResponse.json({
        success: true,
        notifications_created: created?.length || 0,
        delivery_queued: deliveryQueue.length,
      }, { status: 201 });
    } else if (action === 'mark_read') {
      const { notification_ids } = body;

      if (!notification_ids || notification_ids.length === 0) {
        return NextResponse.json({ error: 'Notification IDs required' }, { status: 400 });
      }

      const { error } = await supabase
        .from('unified_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', notification_ids)
        .eq('user_id', user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } else if (action === 'mark_all_read') {
      const { platform } = body;

      let query = supabase
        .from('unified_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (platform) {
        query = query.eq('source_platform', platform);
      }

      const { error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } else if (action === 'dismiss') {
      const { notification_id } = body;

      const { error } = await supabase
        .from('unified_notifications')
        .update({ dismissed: true, dismissed_at: new Date().toISOString() })
        .eq('id', notification_id)
        .eq('user_id', user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } else if (action === 'update_preferences') {
      const { preferences } = body;

      const { data: updated, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ preferences: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process notification' }, { status: 500 });
  }
}

// DELETE /api/notifications/unified - Delete notifications
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
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
    const notificationId = searchParams.get('notification_id');
    const deleteAll = searchParams.get('delete_all') === 'true';

    if (deleteAll) {
      const { error } = await supabase
        .from('unified_notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('is_read', true);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'All read notifications deleted' });
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('unified_notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
