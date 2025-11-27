import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const PostEventReportSchema = z.object({
  project_id: z.string().uuid(),
  report_type: z.enum(['wrap', 'financial', 'crew_performance', 'client_feedback', 'lessons_learned', 'comprehensive']),
  summary: z.string(),
  highlights: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
  metrics: z.record(z.any()).optional(),
  attachments: z.array(z.string()).optional(),
});

// GET /api/post-event-reporting - Get post-event reports
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
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
    const projectId = searchParams.get('project_id');
    const reportId = searchParams.get('report_id');
    const action = searchParams.get('action');

    if (reportId) {
      const { data: report } = await supabase
        .from('post_event_reports')
        .select(`
          *,
          project:compvss_projects(id, name, start_date, end_date),
          created_by_user:platform_users!created_by(first_name, last_name)
        `)
        .eq('id', reportId)
        .single();

      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }

      return NextResponse.json({ report });
    }

    if (action === 'generate_metrics' && projectId) {
      // Auto-generate metrics from project data
      const { data: project } = await supabase
        .from('compvss_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      // Get crew stats
      const { data: crewAssignments } = await supabase
        .from('crew_assignments')
        .select('id, role')
        .eq('project_id', projectId);

      // Get time entries
      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('hours, overtime_hours')
        .eq('project_id', projectId);

      const totalHours = timeEntries?.reduce((sum, t) => sum + (t.hours || 0), 0) || 0;
      const overtimeHours = timeEntries?.reduce((sum, t) => sum + (t.overtime_hours || 0), 0) || 0;

      // Get expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, category')
        .eq('project_id', projectId);

      const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      // Get incidents
      const { data: incidents } = await supabase
        .from('incident_reports')
        .select('severity')
        .eq('project_id', projectId);

      // Get safety checklists
      const { data: checklists } = await supabase
        .from('safety_checklists')
        .select('status')
        .eq('project_id', projectId);

      const completedChecklists = checklists?.filter(c => c.status === 'completed').length || 0;

      return NextResponse.json({
        metrics: {
          crew: {
            total_crew: crewAssignments?.length || 0,
            roles: Array.from(new Set(crewAssignments?.map(c => c.role) || [])),
          },
          labor: {
            total_hours: totalHours,
            overtime_hours: overtimeHours,
            overtime_percentage: totalHours > 0 ? (overtimeHours / totalHours * 100).toFixed(1) : 0,
          },
          financial: {
            budget: project?.budget || 0,
            actual_expenses: totalExpenses,
            variance: (project?.budget || 0) - totalExpenses,
            variance_percentage: project?.budget ? (((project.budget - totalExpenses) / project.budget) * 100).toFixed(1) : 0,
          },
          safety: {
            incidents: incidents?.length || 0,
            critical_incidents: incidents?.filter(i => i.severity === 'critical').length || 0,
            checklists_completed: completedChecklists,
            checklists_total: checklists?.length || 0,
          },
          timeline: {
            planned_start: project?.start_date,
            planned_end: project?.end_date,
            actual_start: project?.actual_start_date,
            actual_end: project?.actual_end_date,
          },
        },
      });
    }

    if (action === 'crew_feedback' && projectId) {
      const { data: feedback } = await supabase
        .from('crew_feedback')
        .select(`
          *,
          crew:platform_users(first_name, last_name)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      // Calculate average ratings
      const ratings = feedback?.filter(f => f.rating) || [];
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, f) => sum + f.rating, 0) / ratings.length 
        : 0;

      return NextResponse.json({
        feedback: feedback || [],
        summary: {
          total_responses: feedback?.length || 0,
          average_rating: avgRating.toFixed(1),
        },
      });
    }

    if (projectId) {
      const { data: reports } = await supabase
        .from('post_event_reports')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      return NextResponse.json({ reports: reports || [] });
    }

    // Get recent reports across all projects
    const { data: recentReports } = await supabase
      .from('post_event_reports')
      .select(`
        *,
        project:compvss_projects(id, name)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({ reports: recentReports || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

// POST /api/post-event-reporting - Create report or submit feedback
export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
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
    const action = body.action || 'create_report';

    if (action === 'create_report') {
      const validated = PostEventReportSchema.parse(body);

      const { data: report, error } = await supabase
        .from('post_event_reports')
        .insert({
          ...validated,
          status: 'draft',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ report }, { status: 201 });
    } else if (action === 'submit_crew_feedback') {
      const { project_id, rating, feedback_text, categories } = body;

      const { data: feedback, error } = await supabase
        .from('crew_feedback')
        .insert({
          project_id,
          user_id: user.id,
          rating,
          feedback_text,
          categories,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ feedback }, { status: 201 });
    } else if (action === 'request_feedback') {
      const { project_id, crew_ids, deadline } = body;

      // Send feedback requests to crew
      for (const crewId of crew_ids) {
        await supabase.from('unified_notifications').insert({
          user_id: crewId,
          title: 'Feedback Request',
          message: 'Please submit your feedback for the recently completed project',
          type: 'action_required',
          priority: 'normal',
          source_platform: 'compvss',
          source_entity_type: 'feedback_request',
          source_entity_id: project_id,
          link: `/projects/${project_id}/feedback`,
          expires_at: deadline,
        });
      }

      return NextResponse.json({
        success: true,
        requests_sent: crew_ids.length,
      });
    } else if (action === 'generate_comprehensive_report') {
      const { project_id } = body;

      // Get all project data
      const { data: project } = await supabase
        .from('compvss_projects')
        .select('*')
        .eq('id', project_id)
        .single();

      // Get metrics
      const { data: crewAssignments } = await supabase
        .from('crew_assignments')
        .select('*')
        .eq('project_id', project_id);

      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('*')
        .eq('project_id', project_id);

      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('project_id', project_id);

      const { data: incidents } = await supabase
        .from('incident_reports')
        .select('*')
        .eq('project_id', project_id);

      const { data: feedback } = await supabase
        .from('crew_feedback')
        .select('*')
        .eq('project_id', project_id);

      // Calculate metrics
      const totalHours = timeEntries?.reduce((sum, t) => sum + (t.hours || 0), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const avgRating = feedback?.length 
        ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length 
        : 0;

      // Create comprehensive report
      const { data: report, error } = await supabase
        .from('post_event_reports')
        .insert({
          project_id,
          report_type: 'comprehensive',
          summary: `Comprehensive post-event report for ${project?.name}`,
          metrics: {
            crew_count: crewAssignments?.length || 0,
            total_labor_hours: totalHours,
            total_expenses: totalExpenses,
            budget: project?.budget || 0,
            budget_variance: (project?.budget || 0) - totalExpenses,
            incident_count: incidents?.length || 0,
            crew_satisfaction: avgRating,
            feedback_responses: feedback?.length || 0,
          },
          status: 'draft',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ report }, { status: 201 });
    } else if (action === 'publish_report') {
      const { report_id } = body;

      const { data: report, error } = await supabase
        .from('post_event_reports')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          published_by: user.id,
        })
        .eq('id', report_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ report });
    } else if (action === 'export_report') {
      const { report_id, format } = body;

      const { data: report } = await supabase
        .from('post_event_reports')
        .select(`
          *,
          project:compvss_projects(*)
        `)
        .eq('id', report_id)
        .single();

      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }

      // In production, generate actual PDF/Excel
      // For now, return the data structure
      return NextResponse.json({
        export_data: report,
        format,
        generated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/post-event-reporting - Update report
export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('report_id');

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: report, error } = await supabase
      .from('post_event_reports')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
