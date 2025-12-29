export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const widgetSchema = z.object({
  id: z.string(),
  type: z.string(),
  config: z.record(z.unknown()).optional(),
});

const createDashboardSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  layout: z.array(z.record(z.unknown())).optional(),
  widgets: z.array(widgetSchema).optional(),
  is_shared: z.boolean().optional(),
});

const updateDashboardSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  layout: z.array(z.record(z.unknown())).optional(),
  widgets: z.array(widgetSchema).optional(),
  is_shared: z.boolean().optional(),
});

// Drag-and-drop custom dashboard builder
const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const dashboardId = searchParams.get('id');

    if (dashboardId) {
      const { data } = await supabase.from('custom_dashboards').select('*').eq('id', dashboardId).single();
      return NextResponse.json({ dashboard: data });
    }

    const { data, error } = await supabase.from('custom_dashboards').select('*')
      .or(`created_by.eq.${user.id},is_shared.eq.true`)
      .order('updated_at', { ascending: false });

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({
      dashboards: data,
      available_widgets: getAvailableWidgets()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboards' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createDashboardSchema.parse(body);
    const { name, description, layout, widgets, is_shared } = validatedData;

    const { data, error } = await supabase.from('custom_dashboards').insert({
      name, description, layout: layout || [], widgets: widgets || [],
      is_shared: is_shared || false, created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ dashboard: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create dashboard' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateDashboardSchema.parse(body);
    const { id, layout, widgets, ...updateData } = validatedData;

    const { error } = await supabase.from('custom_dashboards').update({
      ...updateData, layout, widgets, updated_at: new Date().toISOString()
    }).eq('id', id);

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const { error } = await supabase.from('custom_dashboards').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

function getAvailableWidgets() {
  return [
    { id: 'revenue_chart', name: 'Revenue Chart', type: 'chart', sizes: ['small', 'medium', 'large'] },
    { id: 'project_status', name: 'Project Status', type: 'status', sizes: ['small', 'medium'] },
    { id: 'kpi_card', name: 'KPI Card', type: 'metric', sizes: ['small'] },
    { id: 'pipeline_funnel', name: 'Pipeline Funnel', type: 'chart', sizes: ['medium', 'large'] },
    { id: 'recent_activity', name: 'Recent Activity', type: 'list', sizes: ['medium', 'large'] },
    { id: 'task_list', name: 'Task List', type: 'list', sizes: ['small', 'medium'] },
    { id: 'calendar_widget', name: 'Calendar', type: 'calendar', sizes: ['medium', 'large'] },
    { id: 'budget_gauge', name: 'Budget Gauge', type: 'gauge', sizes: ['small', 'medium'] },
    { id: 'team_availability', name: 'Team Availability', type: 'grid', sizes: ['medium', 'large'] },
    { id: 'alerts_widget', name: 'Alerts & Notifications', type: 'list', sizes: ['small', 'medium'] }
  ];
}
