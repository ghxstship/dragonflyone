import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/kpi/trend/[code]
 * Get trend data for a specific KPI
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    
    const projectId = searchParams.get('project_id');
    const days = parseInt(searchParams.get('days') || '30');

    // Get current user's organization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: orgData } = await supabase
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

    // Call the database function to get trend data
    type TrendParams = {
      p_organization_id: string;
      p_kpi_code: string;
      p_days: number;
      p_project_id: string | null;
    };

    const rpcParams: TrendParams = {
      p_organization_id: (orgData as { organization_id: string }).organization_id,
      p_kpi_code: params.code,
      p_days: days,
      p_project_id: projectId || null
    };

    const { data, error } = await supabase.rpc('get_kpi_trend', rpcParams as never);

    if (error) throw error;

    const trendData = data as unknown[] | null;
    return NextResponse.json({
      success: true,
      data: trendData || [],
      count: trendData?.length || 0
    });
  } catch (error) {
    console.error('Error fetching KPI trend:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch KPI trend' },
      { status: 500 }
    );
  }
}
