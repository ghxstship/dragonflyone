export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole, logger } from '@ghxstship/config';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const NotificationSchema = z.object({
  user_id: z.string().uuid(),
  type: z.enum(['price_drop', 'event_reminder', 'ticket_confirmed', 'event_update', 'system', 'order', 'follow', 'review', 'message', 'waitlist', 'promo', 'transfer', 'refund', 'security']),
  category: z.enum(['events', 'orders', 'social', 'account', 'marketing', 'system']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  title: z.string().min(1),
  message: z.string().min(1),
  link: z.string().optional(),
  reference_type: z.string().optional(),
  reference_id: z.string().uuid().optional(),
  delivery_channels: z.array(z.string()).default(['in_app']),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const isRead = searchParams.get('is_read');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (isRead !== null && isRead !== undefined) {
      query = query.eq('is_read', isRead === 'true');
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const notifications = data || [];
    const summary = {
      total: count || 0,
      unread: notifications.filter(n => !n.is_read).length,
      by_category: {
        events: notifications.filter(n => n.category === 'events').length,
        orders: notifications.filter(n => n.category === 'orders').length,
        social: notifications.filter(n => n.category === 'social').length,
        account: notifications.filter(n => n.category === 'account').length,
        system: notifications.filter(n => n.category === 'system').length,
      },
    };

    return NextResponse.json({
      notifications,
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = NotificationSchema.parse(body);

    const { data, error } = await supabase
      .from('notifications')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notification: data }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    logger.error('Error in POST /api/notifications:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
