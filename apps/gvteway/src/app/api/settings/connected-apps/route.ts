export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, logger } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const { data: apps, error } = await supabase
      .from('connected_apps')
      .select('id, app_name, app_id, provider, scopes, last_used_at, connected_at')
      .eq('user_id', userId)
      .order('connected_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch connected apps', error);
      return NextResponse.json({ error: 'Failed to fetch connected apps' }, { status: 500 });
    }

    return NextResponse.json({ apps: apps || [] });
  } catch (err) {
    logger.error('Connected apps GET error', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('id');

    if (!appId) {
      return NextResponse.json({ error: 'App ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('connected_apps')
      .delete()
      .eq('id', appId)
      .eq('user_id', userId);

    if (error) {
      logger.error('Failed to disconnect app', error);
      return NextResponse.json({ error: 'Failed to disconnect app' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('Connected apps DELETE error', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
