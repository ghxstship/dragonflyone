export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const scheduleSchema = z.object({
  booking_id: z.string().uuid().optional(),
  vendor_profile_id: z.string().uuid(),
  schedule_type: z.enum(['load_in', 'load_out', 'setup', 'breakdown', 'service', 'standby']),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  location: z.string().optional(),
  access_point: z.string().optional(),
  access_instructions: z.string().optional(),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional(),
  crew_count: z.number().int().min(1).default(1),
  equipment_notes: z.string().optional(),
  special_requirements: z.string().optional(),
});

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');
    const vendorId = searchParams.get('vendor_id');
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const scheduleType = searchParams.get('type');

    let query = (supabase.from('vendor_schedules') as ReturnType<typeof supabase.from>)
      .select(`
        *,
        vendor:vendor_profiles(id, name, company_name),
        booking:bookings(id, booking_number, event_name, event_date)
      `)
      .order('start_time', { ascending: true });

    if (bookingId) {
      query = query.eq('booking_id', bookingId);
    }

    if (vendorId) {
      query = query.eq('vendor_profile_id', vendorId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (scheduleType) {
      query = query.eq('schedule_type', scheduleType);
    }

    if (startDate) {
      query = query.gte('start_time', startDate);
    }

    if (endDate) {
      query = query.lte('end_time', endDate);
    }

    const { data: schedules, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
    }

    // Group by date for timeline view
    const groupedByDate: Record<string, typeof schedules> = {};
    for (const schedule of schedules || []) {
      const date = new Date(schedule.start_time).toISOString().split('T')[0];
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(schedule);
    }

    return NextResponse.json({
      schedules: schedules || [],
      grouped: groupedByDate,
      count: schedules?.length || 0,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = scheduleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const scheduleData = validation.data;

    // Validate times
    if (new Date(scheduleData.end_time) <= new Date(scheduleData.start_time)) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    // Check for conflicts
    const { data: conflicts } = await (supabase.from('vendor_schedules') as ReturnType<typeof supabase.from>)
      .select('id, start_time, end_time, schedule_type')
      .eq('vendor_profile_id', scheduleData.vendor_profile_id)
      .not('status', 'in', '("cancelled","no_show")')
      .or(`and(start_time.lt.${scheduleData.end_time},end_time.gt.${scheduleData.start_time})`);

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { 
          error: 'Schedule conflict detected',
          conflicts: conflicts,
        },
        { status: 409 }
      );
    }

    // Get user's organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'No organization found' }, { status: 403 });
    }

    const { data: schedule, error } = await (supabase.from('vendor_schedules') as ReturnType<typeof supabase.from>)
      .insert({
        ...scheduleData,
        organization_id: membership.organization_id,
        status: 'pending',
        created_by: user.id,
      })
      .select(`
        *,
        vendor:vendor_profiles(id, name, company_name)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
    }

    return NextResponse.json({ schedule }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
