import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Drag-and-drop custom dashboard builder
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      dashboards: data,
      available_widgets: getAvailableWidgets()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboards' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, description, layout, widgets, is_shared } = body;

    const { data, error } = await supabase.from('custom_dashboards').insert({
      name, description, layout: layout || [], widgets: widgets || [],
      is_shared: is_shared || false, created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ dashboard: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create dashboard' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, layout, widgets, ...updateData } = body;

    const { error } = await supabase.from('custom_dashboards').update({
      ...updateData, layout, widgets, updated_at: new Date().toISOString()
    }).eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const { error } = await supabase.from('custom_dashboards').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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
