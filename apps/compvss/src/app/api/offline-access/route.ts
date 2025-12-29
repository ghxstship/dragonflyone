export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const enableOfflineSchema = z.object({
  action: z.literal('enable_offline'),
  content_id: z.string().uuid(),
  content_type: z.string(),
});

const disableOfflineSchema = z.object({
  action: z.literal('disable_offline'),
  content_id: z.string().uuid(),
});

const syncChangesSchema = z.object({
  action: z.literal('sync_changes'),
  changes: z.array(z.object({
    queue_id: z.string().uuid().optional(),
    table: z.string().optional(),
    operation: z.enum(['insert', 'update']).optional(),
    id: z.string().optional(),
    data: z.record(z.unknown()).optional(),
  })).optional(),
});

const updatePreferencesSchema = z.object({
  action: z.literal('update_preferences'),
  auto_sync: z.boolean().optional(),
  sync_on_wifi_only: z.boolean().optional(),
  max_offline_storage_mb: z.number().optional(),
});

const offlineActionSchema = z.union([enableOfflineSchema, disableOfflineSchema, syncChangesSchema, updatePreferencesSchema]);

// Mobile-optimized access with offline capability
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
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = offlineActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'enable_offline') {
      const { content_id, content_type } = validatedData as z.infer<typeof enableOfflineSchema>;

      const { data, error } = await supabase.from('offline_content').upsert({
        user_id: user.id, content_id, content_type, enabled: true,
        cached_at: new Date().toISOString()
      }, { onConflict: 'user_id,content_id' }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ offline_content: data });
    }

    if (action === 'disable_offline') {
      const { content_id } = validatedData as z.infer<typeof disableOfflineSchema>;

      await supabase.from('offline_content').update({ enabled: false })
        .eq('user_id', user.id).eq('content_id', content_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'sync_changes') {
      const { changes } = validatedData as z.infer<typeof syncChangesSchema>;
      const results: unknown[] = [];

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
      const { auto_sync, sync_on_wifi_only, max_offline_storage_mb } = validatedData as z.infer<typeof updatePreferencesSchema>;

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
