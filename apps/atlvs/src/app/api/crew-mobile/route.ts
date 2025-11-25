import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Crew mobile app with offline capability - sync endpoint
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const lastSync = searchParams.get('last_sync');
    const dataTypes = searchParams.get('types')?.split(',') || ['all'];

    const syncData: Record<string, any> = {};

    // Get user's crew assignments and schedules
    if (dataTypes.includes('all') || dataTypes.includes('schedules')) {
      let query = supabase.from('crew_schedules').select(`
        *, project:projects(id, name, venue), shift:shifts(start_time, end_time, role)
      `).eq('crew_member_id', user.id);

      if (lastSync) query = query.gte('updated_at', lastSync);

      const { data } = await query;
      syncData.schedules = data;
    }

    // Get notifications
    if (dataTypes.includes('all') || dataTypes.includes('notifications')) {
      let query = supabase.from('notifications').select('*')
        .eq('user_id', user.id).eq('read', false);

      if (lastSync) query = query.gte('created_at', lastSync);

      const { data } = await query.order('created_at', { ascending: false }).limit(50);
      syncData.notifications = data;
    }

    // Get timesheets
    if (dataTypes.includes('all') || dataTypes.includes('timesheets')) {
      let query = supabase.from('timesheets').select('*')
        .eq('employee_id', user.id);

      if (lastSync) query = query.gte('updated_at', lastSync);

      const { data } = await query.order('date', { ascending: false }).limit(30);
      syncData.timesheets = data;
    }

    // Get documents for offline access
    if (dataTypes.includes('all') || dataTypes.includes('documents')) {
      const { data } = await supabase.from('offline_documents').select('*')
        .eq('user_id', user.id).eq('available_offline', true);
      syncData.documents = data;
    }

    return NextResponse.json({
      sync_data: syncData,
      sync_timestamp: new Date().toISOString(),
      offline_enabled: true
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to sync' }, { status: 500 });
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

    if (action === 'sync_offline_changes') {
      const { changes } = body;
      const results: any[] = [];

      for (const change of changes || []) {
        try {
          if (change.type === 'timesheet') {
            await supabase.from('timesheets').upsert({
              ...change.data,
              employee_id: user.id,
              synced_at: new Date().toISOString()
            });
            results.push({ id: change.id, status: 'synced' });
          } else if (change.type === 'clock_event') {
            await supabase.from('clock_events').insert({
              ...change.data,
              employee_id: user.id,
              offline_created: true
            });
            results.push({ id: change.id, status: 'synced' });
          }
        } catch (e) {
          results.push({ id: change.id, status: 'failed', error: (e as Error).message });
        }
      }

      return NextResponse.json({ results });
    }

    if (action === 'register_device') {
      const { device_id, device_type, push_token } = body;

      await supabase.from('user_devices').upsert({
        user_id: user.id, device_id, device_type, push_token,
        last_active: new Date().toISOString()
      }, { onConflict: 'user_id,device_id' });

      return NextResponse.json({ success: true });
    }

    if (action === 'mark_offline_document') {
      const { document_id, available_offline } = body;

      await supabase.from('offline_documents').upsert({
        user_id: user.id, document_id, available_offline
      }, { onConflict: 'user_id,document_id' });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
