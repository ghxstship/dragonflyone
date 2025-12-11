import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log } from '@ghxstship/config';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organization_id');
    const category = searchParams.get('category');
    const includeGlobal = searchParams.get('include_global') !== 'false';

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc('get_effective_catalog', {
      p_organization_id: organizationId,
      p_category: category || undefined,
      p_include_global: includeGlobal,
    });

    if (error) {
      log.error('Failed to fetch effective catalog:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count: data?.length || 0 });
  } catch (error) {
    log.error('Unexpected error fetching effective catalog:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
