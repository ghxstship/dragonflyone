export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole, logger } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

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
    const category_id = searchParams.get('category_id');
    const include_categories = searchParams.get('include_categories') === 'true';

    if (include_categories) {
      // Return categories with their specialties
      const { data: categories, error: catError } = await supabase
        .from('specialty_categories')
        .select(`
          *,
          specialties(id, name, code, description, experience_levels)
        `)
        .eq('is_active', true)
        .order('sort_order');

      if (catError) throw catError;

      return NextResponse.json({ data: categories });
    }

    // Return just specialties
    let query = supabase
      .from('specialties')
      .select(`
        *,
        category:specialty_categories(id, name, code)
      `)
      .eq('is_active', true);

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    const { data, error } = await query.order('name');

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    logger.error('Error fetching specialties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specialties' },
      { status: 500 }
    );
  }
}
