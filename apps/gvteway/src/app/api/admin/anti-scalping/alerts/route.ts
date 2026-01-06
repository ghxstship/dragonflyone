import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { log } from '@ghxstship/config';

const alertFilterSchema = z.object({
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['open', 'investigating', 'resolved', 'false_positive']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = alertFilterSchema.parse({
      severity: searchParams.get('severity') || undefined,
      status: searchParams.get('status') || undefined,
    });

    let query = supabase
      .from('scalping_alerts')
      .select(`
        id,
        event_id,
        alert_type,
        severity,
        description,
        affected_tickets,
        status,
        created_at,
        events (
          id,
          title
        )
      `)
      .order('created_at', { ascending: false });

    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data: alerts, error } = await query.limit(100);

    if (error) {
      log.error('Error fetching scalping alerts', error, { endpoint: '/api/admin/anti-scalping/alerts', method: 'GET' });
      return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
    }

    // Transform to match the expected format
    const transformedAlerts = (alerts || []).map(alert => {
      const event = Array.isArray(alert.events) ? alert.events[0] : alert.events;
      return {
        id: alert.id,
        type: alert.alert_type,
        severity: alert.severity,
        status: alert.status === 'open' ? 'pending' : alert.status === 'false_positive' ? 'cleared' : alert.status,
        event_name: event?.title || 'Unknown Event',
        details: alert.description || '',
        ticket_count: alert.affected_tickets || 0,
        created_at: alert.created_at,
      };
    });

    return NextResponse.json({ alerts: transformedAlerts });
  } catch (error) {
    log.error('Error in anti-scalping alerts API', error, { endpoint: '/api/admin/anti-scalping/alerts', method: 'GET' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
