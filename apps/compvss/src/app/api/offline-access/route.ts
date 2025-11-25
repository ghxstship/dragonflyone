import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Mobile-optimized access with offline capability
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const lastSync = searchParams.get('last_sync');

    // Get offline-enabled content for user
    const { data: offlineContent } = await supabase.from('offline_content').select(`
      *, content:knowledge_documents(id, title, content, category)
    `).eq('user_id', user.id).eq('enabled', true);

    // Get pending sync items
    const { data: pendingSync } = await supabase.from('offline_sync_queue').select('*')
      .eq('user_id', user.id).eq('synced', false);

    // Get user's offline preferences
    const { data: preferences } = await supabase.from('offline_preferences').select('*')
      .eq('user_id', user.id).single();

    return NextResponse.json({
      offline_content: offlineContent,
      pending_sync: pendingSync,
      preferences,
      last_sync: lastSync,
      server_time: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'enable_offline') {
      const { content_id, content_type } = body;

      const { data, error } = await supabase.from('offline_content').upsert({
        user_id: user.id, content_id, content_type, enabled: true,
        cached_at: new Date().toISOString()
      }, { onConflict: 'user_id,content_id' }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ offline_content: data });
    }

    if (action === 'disable_offline') {
      const { content_id } = body;

      await supabase.from('offline_content').update({ enabled: false })
        .eq('user_id', user.id).eq('content_id', content_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'sync_changes') {
      const { changes } = body;
      const results: any[] = [];

      for (const change of changes || []) {
        try {
          // Process each offline change
          if (change.table && change.data) {
            if (change.operation === 'insert') {
              await supabase.from(change.table).insert(change.data);
            } else if (change.operation === 'update') {
              await supabase.from(change.table).update(change.data).eq('id', change.id);
            }
          }

          // Mark as synced
          await supabase.from('offline_sync_queue').update({
            synced: true, synced_at: new Date().toISOString()
          }).eq('id', change.queue_id);

          results.push({ queue_id: change.queue_id, status: 'synced' });
        } catch (e) {
          results.push({ queue_id: change.queue_id, status: 'failed', error: (e as Error).message });
        }
      }

      return NextResponse.json({ results });
    }

    if (action === 'update_preferences') {
      const { auto_sync, sync_on_wifi_only, max_offline_storage_mb } = body;

      await supabase.from('offline_preferences').upsert({
        user_id: user.id, auto_sync, sync_on_wifi_only, max_offline_storage_mb
      }, { onConflict: 'user_id' });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
