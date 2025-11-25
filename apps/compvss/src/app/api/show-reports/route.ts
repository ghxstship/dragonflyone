import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const showReportSchema = z.object({
  event_id: z.string().uuid(),
  run_of_show_id: z.string().uuid().optional(),
  report_type: z.enum(['pre_show', 'post_show', 'daily']).default('post_show'),
  doors_time: z.string().optional(),
  show_start_time: z.string().optional(),
  show_end_time: z.string().optional(),
  attendance: z.number().int().nonnegative().optional(),
  capacity: z.number().int().positive().optional(),
  weather_conditions: z.string().optional(),
  technical_issues: z.string().optional(),
  highlights: z.string().optional(),
  challenges: z.string().optional(),
  recommendations: z.string().optional(),
  crew_feedback: z.string().optional(),
  client_feedback: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

// GET /api/show-reports - List show reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const status = searchParams.get('status');
    const reportType = searchParams.get('report_type');

    let query = supabase
      .from('show_reports')
      .select(`
        *,
        event:events(id, name, start_date, venue_id),
        run_of_show:run_of_shows(id, name, date),
        created_by_user:platform_users!created_by(id, full_name),
        approved_by_user:platform_users!approved_by(id, full_name)
      `)
      .order('created_at', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (reportType) {
      query = query.eq('report_type', reportType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching show reports:', error);
      return NextResponse.json(
        { error: 'Failed to fetch show reports', details: error.message },
        { status: 500 }
      );
    }

    interface ReportRecord {
      id: string;
      status: string;
      report_type: string;
      attendance: number;
      capacity: number;
      [key: string]: unknown;
    }
    const reports = (data || []) as unknown as ReportRecord[];

    const summary = {
      total: reports.length,
      by_status: {
        draft: reports.filter(r => r.status === 'draft').length,
        submitted: reports.filter(r => r.status === 'submitted').length,
        approved: reports.filter(r => r.status === 'approved').length,
      },
      by_type: {
        pre_show: reports.filter(r => r.report_type === 'pre_show').length,
        post_show: reports.filter(r => r.report_type === 'post_show').length,
        daily: reports.filter(r => r.report_type === 'daily').length,
      },
      average_attendance_rate: reports.length > 0
        ? reports.reduce((sum, r) => {
            if (r.attendance && r.capacity) {
              return sum + (r.attendance / r.capacity) * 100;
            }
            return sum;
          }, 0) / reports.filter(r => r.attendance && r.capacity).length
        : 0,
    };

    return NextResponse.json({ reports: data, summary });
  } catch (error) {
    console.error('Error in GET /api/show-reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/show-reports - Create show report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = showReportSchema.parse(body);

    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    // Calculate attendance percentage if both values provided
    let attendancePercentage = null;
    if (validated.attendance && validated.capacity) {
      attendancePercentage = (validated.attendance / validated.capacity) * 100;
    }

    const { data: report, error } = await supabase
      .from('show_reports')
      .insert({
        ...validated,
        attendance_percentage: attendancePercentage,
        created_by: userId,
        status: 'draft',
      })
      .select(`
        *,
        event:events(id, name),
        created_by_user:platform_users!created_by(id, full_name)
      `)
      .single();

    if (error) {
      console.error('Error creating show report:', error);
      return NextResponse.json(
        { error: 'Failed to create show report', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in POST /api/show-reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/show-reports - Update or submit report
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { report_id, action, updates } = body;
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    if (!report_id) {
      return NextResponse.json({ error: 'report_id is required' }, { status: 400 });
    }

    let updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (action === 'submit') {
      updateData.status = 'submitted';
    } else if (action === 'approve') {
      updateData.status = 'approved';
      updateData.approved_by = userId;
      updateData.approved_at = new Date().toISOString();
    } else if (action === 'reject') {
      updateData.status = 'draft';
    } else if (updates) {
      // Regular update
      const validated = showReportSchema.partial().parse(updates);
      updateData = { ...updateData, ...validated };

      // Recalculate attendance percentage if needed
      if (validated.attendance !== undefined || validated.capacity !== undefined) {
        const { data: current } = await supabase
          .from('show_reports')
          .select('attendance, capacity')
          .eq('id', report_id)
          .single();

        const attendance = validated.attendance ?? current?.attendance;
        const capacity = validated.capacity ?? current?.capacity;

        if (attendance && capacity) {
          updateData.attendance_percentage = (attendance / capacity) * 100;
        }
      }
    }

    const { data, error } = await supabase
      .from('show_reports')
      .update(updateData)
      .eq('id', report_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update show report', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, report: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in PATCH /api/show-reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
