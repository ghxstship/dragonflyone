export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createIssueSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  priority: z.string().optional(),
  category: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
});

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('update_status'),
  status: z.string(),
  resolution: z.string().optional(),
  comment: z.string().optional(),
});

const addCommentSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('add_comment'),
  comment: z.string(),
});

const escalateSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('escalate'),
});

const issueActionSchema = z.union([updateStatusSchema, addCommentSchema, escalateSchema]);

// Issue tracking and resolution with SLA management
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    let query = supabase.from('project_issues').select(`
      *, assigned_to:platform_users(id, first_name, last_name),
      reported_by:platform_users!reported_by(id, first_name, last_name)
    `);

    if (projectId) query = query.eq('project_id', projectId);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Check SLA breaches
    const issuesWithSLA = data?.map(issue => {
      const slaHours = getSLAHours(issue.priority);
      const createdAt = new Date(issue.created_at);
      const deadline = new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000);
      const isBreached = issue.status !== 'resolved' && new Date() > deadline;
      const hoursRemaining = Math.max(0, (deadline.getTime() - Date.now()) / (1000 * 60 * 60));

      return {
        ...issue,
        sla_deadline: deadline.toISOString(),
        sla_breached: isBreached,
        hours_remaining: Math.round(hoursRemaining * 10) / 10
      };
    });

    return NextResponse.json({
      issues: issuesWithSLA,
      summary: {
        total: data?.length || 0,
        open: data?.filter(i => i.status === 'open').length || 0,
        in_progress: data?.filter(i => i.status === 'in_progress').length || 0,
        resolved: data?.filter(i => i.status === 'resolved').length || 0,
        sla_breached: issuesWithSLA?.filter(i => i.sla_breached).length || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createIssueSchema.parse(body);
    const { project_id, title, description, priority, category, assigned_to } = validatedData;

    const { data, error } = await supabase.from('project_issues').insert({
      project_id, title, description, priority: priority || 'medium',
      category, assigned_to, status: 'open', reported_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Notify assigned user
    if (assigned_to) {
      await supabase.from('notifications').insert({
        user_id: assigned_to,
        type: 'issue_assigned',
        title: 'New Issue Assigned',
        message: `Issue: ${title}`,
        reference_id: data.id
      });
    }

    return NextResponse.json({ issue: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = issueActionSchema.parse(body);
    const { id, action } = validatedData;

    if (action === 'update_status') {
      const { status, resolution } = validatedData as z.infer<typeof updateStatusSchema>;
      interface IssueUpdate { status: string; resolved_at?: string; resolved_by?: string; resolution?: string }
      const updateData: IssueUpdate = { status };
      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = user.id;
        updateData.resolution = resolution;
      }
      await supabase.from('project_issues').update(updateData).eq('id', id);
      return NextResponse.json({ success: true });
    }

    if (action === 'add_comment') {
      const { comment } = validatedData as z.infer<typeof addCommentSchema>;
      await supabase.from('issue_comments').insert({
        issue_id: id, user_id: user.id, comment
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'escalate') {
      await supabase.from('project_issues').update({
        priority: 'critical', escalated: true, escalated_at: new Date().toISOString()
      }).eq('id', id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

function getSLAHours(priority: string): number {
  const slaMap: Record<string, number> = {
    critical: 4,
    high: 8,
    medium: 24,
    low: 72
  };
  return slaMap[priority] || 24;
}
