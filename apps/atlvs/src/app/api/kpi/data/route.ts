import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/kpi/data
 * Get KPI data points with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    
    const kpiCode = searchParams.get('kpi_code');
    const projectId = searchParams.get('project_id');
    const eventId = searchParams.get('event_id');
    const days = parseInt(searchParams.get('days') || '30');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = supabase
      .from('kpi_data_points')
      .select('*')
      .order('calculated_at', { ascending: false })
      .limit(limit);

    if (kpiCode) {
      query = query.eq('kpi_code', kpiCode);
    }

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    if (days > 0) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query = query.gte('calculated_at', startDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Error fetching KPI data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch KPI data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/kpi/data
 * Record a new KPI data point
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      kpi_code,
      kpi_name,
      value,
      unit,
      project_id,
      event_id,
      period_start,
      period_end,
      metadata
    } = body;

    // Validate required fields
    if (!kpi_code || !kpi_name || value === undefined || !unit) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current user's organization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: orgData } = await (supabase as any)
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!orgData) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Call the database function to record the KPI
    const { data, error } = await (supabase as any).rpc('record_kpi_data_point', {
      p_organization_id: (orgData as any).organization_id,
      p_kpi_code: kpi_code,
      p_kpi_name: kpi_name,
      p_value: value,
      p_unit: unit,
      p_project_id: project_id || null,
      p_event_id: event_id || null,
      p_period_start: period_start || null,
      p_period_end: period_end || null,
      p_metadata: metadata || {}
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { id: data }
    });
  } catch (error) {
    console.error('Error recording KPI data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record KPI data' },
      { status: 500 }
    );
  }
}
