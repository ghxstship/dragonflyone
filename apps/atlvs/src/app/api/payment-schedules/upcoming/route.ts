export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const days = parseInt(searchParams.get('days') || '30');

    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get upcoming milestones
    let query = supabase
      .from('payment_milestones')
      .select(`
        *,
        schedule:payment_schedules(
          *,
          booking:bookings(
            id,
            booking_number,
            event_name,
            event_date,
            total_amount,
            contact:contacts(id, first_name, last_name, email, phone)
          )
        )
      `)
      .eq('status', 'pending')
      .gte('due_date', today)
      .lte('due_date', futureDate)
      .order('due_date', { ascending: true });

    if (organizationId) {
      query = query.eq('schedule.organization_id', organizationId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by due date
    const milestones = data || [];
    const grouped: Record<string, typeof milestones> = {};
    
    for (const milestone of milestones) {
      const date = milestone.due_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(milestone);
    }

    // Calculate summary
    const summary = {
      total_milestones: milestones.length,
      total_amount_due: milestones.reduce((sum, m) => sum + (m.amount || 0), 0),
      overdue: milestones.filter(m => m.due_date < today).length,
      due_this_week: milestones.filter(m => {
        const dueDate = new Date(m.due_date);
        const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        return dueDate <= weekFromNow;
      }).length,
    };

    return NextResponse.json({
      milestones,
      grouped,
      summary,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch upcoming payments' }, { status: 500 });
  }
}
