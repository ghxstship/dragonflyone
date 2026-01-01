export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '100');

    const [interactions, leads, bookings, proposals] = await Promise.all([
      supabase
        .from('contact_interactions')
        .select('id, interaction_type, subject, body, created_at')
        .eq('contact_id', id)
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('contacts')
        .select('id, first_name, last_name, status, created_at, updated_at')
        .eq('contact_id', id)
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('legend_events')
        .select('id, booking_number, event_name, status, created_at')
        .eq('contact_id', id)
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('proposals')
        .select('id, proposal_number, name, status, created_at, sent_at')
        .eq('contact_id', id)
        .order('created_at', { ascending: false })
        .limit(limit),
    ]);

    const timeline: Array<{
      id: string;
      type: string;
      title: string;
      description?: string;
      date: string;
      metadata?: Record<string, unknown>;
    }> = [];

    if (interactions.data) {
      for (const item of interactions.data) {
        timeline.push({
          id: item.id,
          type: 'interaction',
          title: item.subject,
          description: item.body,
          date: item.created_at,
          metadata: { interaction_type: item.interaction_type },
        });
      }
    }

    if (leads.data) {
      for (const item of leads.data) {
        timeline.push({
          id: item.id,
          type: 'lead',
          title: `Lead: ${item.first_name} ${item.last_name}`,
          description: `Status: ${item.status}`,
          date: item.created_at,
        });
      }
    }

    if (bookings.data) {
      for (const item of bookings.data) {
        timeline.push({
          id: item.id,
          type: 'booking',
          title: `Booking: ${item.event_name || item.booking_number}`,
          description: `Status: ${item.status}`,
          date: item.created_at,
        });
      }
    }

    if (proposals.data) {
      for (const item of proposals.data) {
        timeline.push({
          id: item.id,
          type: 'proposal',
          title: `Proposal: ${item.name || item.proposal_number}`,
          description: `Status: ${item.status}`,
          date: item.sent_at || item.created_at,
        });
      }
    }

    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      timeline: timeline.slice(0, limit),
      total: timeline.length,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
