export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createIssueSchema = z.object({
  event_id: z.string().uuid(),
  department: z.string().optional(),
  description: z.string().min(1),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  assigned_to: z.string().uuid().optional(),
});

const escalateSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('escalate'),
});

const updateIssueSchema = z.object({
  id: z.string().uuid(),
  action: z.string().optional(),
  status: z.string().optional(),
  resolution: z.string().optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
});

const issuePatchActionSchema = z.union([escalateSchema, updateIssueSchema]);

// Technical issue escalation with priority levels
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
    const eventId = searchParams.get('event_id');
    const priority = searchParams.get('priority');

    let query = supabase.from('technical_issues').select(`
      *, reported_by:platform_users!reported_by(first_name, last_name),
      assigned_to:platform_users!assigned_to(first_name, last_name)
    `).eq('event_id', eventId);

    if (priority) query = query.eq('priority', priority);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({
      issues: data,
      by_priority: {
        critical: data?.filter(i => i.priority === 'critical') || [],
        high: data?.filter(i => i.priority === 'high') || [],
        medium: data?.filter(i => i.priority === 'medium') || [],
        low: data?.filter(i => i.priority === 'low') || []
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
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
    const { event_id, department, description, priority, assigned_to } = validatedData;

    const { data, error } = await supabase.from('technical_issues').insert({
      event_id, department, description, priority: priority || 'medium',
      assigned_to, status: 'open', reported_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Notify for critical issues
    if (priority === 'critical' && assigned_to) {
      await supabase.from('notifications').insert({
        user_id: assigned_to, type: 'critical_issue',
        title: 'CRITICAL Technical Issue', message: description,
        priority: 'urgent', reference_id: data.id
      });
    }

    return NextResponse.json({ issue: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
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

    const body = await request.json();
    const validatedData = issuePatchActionSchema.parse(body);
    const { id, action } = validatedData;

    if (action === 'escalate') {
      await supabase.from('technical_issues').update({
        priority: 'critical', escalated: true, escalated_at: new Date().toISOString()
      }).eq('id', id);
      return NextResponse.json({ success: true });
    }

    const { status, resolution, priority } = validatedData as z.infer<typeof updateIssueSchema>;
    await supabase.from('technical_issues').update({
      status, resolution, priority,
      resolved_at: status === 'resolved' ? new Date().toISOString() : null
    }).eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
