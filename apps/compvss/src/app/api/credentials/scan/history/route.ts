export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger, withAuth, PlatformRole } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.COMPVSS_TEAM_MEMBER,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
];

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const credentialId = searchParams.get('credential_id');
    const eventId = searchParams.get('event_id');
    const scannerId = searchParams.get('scanner_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('credential_scans')
      .select(`
        id,
        credential_id,
        scanned_at,
        scan_result,
        location,
        scanner_id,
        notes,
        credential:credentials(id, credential_number, holder_name),
        scanner:platform_users(id, email, first_name, last_name)
      `, { count: 'exact' })
      .order('scanned_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (credentialId) {
      query = query.eq('credential_id', credentialId);
    }
    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (scannerId) {
      query = query.eq('scanner_id', scannerId);
    }

    const { data, error, count } = await query;

    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST116') {
        return NextResponse.json({ scans: [], total: 0, limit, offset });
      }
      logger.error('Error fetching scan history:', error);
      return NextResponse.json({ scans: [], total: 0, limit, offset });
    }

    return NextResponse.json({ scans: data || [], total: count, limit, offset });
  } catch (error) {
    logger.error('Error in GET /api/credentials/scan/history:', error instanceof Error ? error : undefined);
    return NextResponse.json({ scans: [], total: 0, limit: 50, offset: 0 });
  }
}
