import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log, withAuth, PlatformRole } from '@ghxstship/config';

export const dynamic = 'force-dynamic';

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

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const organizationId = searchParams.get('organization_id');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');

    if (!userId || !organizationId || !category) {
      return NextResponse.json(
        { error: 'user_id, organization_id, and category are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc('can_request_category', {
      p_user_id: userId,
      p_organization_id: organizationId,
      p_category: category,
      p_subcategory: subcategory || undefined,
    });

    if (error) {
      log.error('Failed to check category permission:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ canRequest: data });
  } catch (error) {
    log.error('Unexpected error checking category permission:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
