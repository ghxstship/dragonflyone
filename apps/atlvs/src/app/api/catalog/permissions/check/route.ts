import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log } from '@ghxstship/config';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  
  try {
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
