export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
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
    const locale = searchParams.get('locale') || 'en-US';
    const namespace = searchParams.get('namespace');
    const keys = searchParams.get('keys')?.split(',').filter(Boolean);

    let query = supabase
      .from('translations')
      .select(`
        id, value, is_approved, is_machine_translated,
        key:translation_keys(key, namespace, description)
      `)
      .eq('locale_code', locale);

    if (namespace) {
      query = query.eq('translation_keys.namespace', namespace);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform to key-value format
    const translations: Record<string, string> = {};
    (data || []).forEach((t: Record<string, unknown>) => {
      const keyData = t.key as { key: string } | null;
      if (keyData?.key) {
        // Filter by specific keys if provided
        if (!keys || keys.includes(keyData.key)) {
          translations[keyData.key] = t.value as string;
        }
      }
    });

    return NextResponse.json({
      locale,
      namespace,
      translations,
    });
  } catch (error) {
    logger.error('Error fetching translations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}
