import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

/**
 * HR Systems Integration API
 * Integrates with Workday, BambooHR, and other HR platforms
 */
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const provider = searchParams.get('provider');

    if (type === 'providers') {
      const providers = [
        { id: 'workday', name: 'Workday', features: ['employees', 'time_off', 'benefits', 'compensation'] },
        { id: 'bamboohr', name: 'BambooHR', features: ['employees', 'time_off', 'onboarding', 'performance'] },
        { id: 'adp_workforce', name: 'ADP Workforce Now', features: ['employees', 'payroll', 'benefits'] },
        { id: 'namely', name: 'Namely', features: ['employees', 'time_off', 'performance'] },
        { id: 'rippling', name: 'Rippling', features: ['employees', 'payroll', 'benefits', 'devices'] }
      ];
      return NextResponse.json({ providers });
    }

    if (type === 'connection') {
      const { data, error } = await supabase
        .from('hr_connections')
        .select('*')
        .eq('provider', provider || '')
        .single();

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ connection: data || null });
    }

    if (type === 'employees') {
      const { data, error } = await supabase
        .from('hr_synced_employees')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ employees: data });
    }

    if (type === 'time_off') {
      const { data, error } = await supabase
        .from('hr_time_off_requests')
        .select(`
          *,
          employee:hr_synced_employees(id, full_name, email)
        `)
        .order('start_date', { ascending: false })
        .limit(50);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ time_off_requests: data });
    }

    if (type === 'sync_status') {
      const { data, error } = await supabase
        .from('hr_sync_logs')
        .select('*')
        .order('synced_at', { ascending: false })
        .limit(10);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ sync_logs: data });
    }

    // Default summary
    const [employeeCount, pendingTimeOff] = await Promise.all([
      supabase.from('hr_synced_employees').select('id', { count: 'exact', head: true }),
      supabase.from('hr_time_off_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    return NextResponse.json({
      summary: {
        total_employees: employeeCount.count || 0,
        pending_time_off: pendingTimeOff.count || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch HR data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'connect') {
      const { provider, api_key, subdomain } = body;

      const { data, error } = await supabase
        .from('hr_connections')
        .upsert({
          provider,
          api_key_encrypted: api_key,
          subdomain,
          status: 'connected',
          connected_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ connection: data }, { status: 201 });
    }

    if (action === 'sync_employees') {
      const { provider } = body;

      // In production, would call provider API
      const syncResult = {
        provider,
        employees_synced: 0,
        employees_added: 0,
        employees_updated: 0,
        synced_at: new Date().toISOString()
      };

      await supabase.from('hr_sync_logs').insert(syncResult);

      return NextResponse.json({ sync_result: syncResult });
    }

    if (action === 'sync_time_off') {
      const { provider } = body;

      const syncResult = {
        provider,
        requests_synced: 0,
        synced_at: new Date().toISOString()
      };

      return NextResponse.json({ sync_result: syncResult });
    }

    if (action === 'approve_time_off') {
      const { request_id, approved_by } = body;

      const { data, error } = await supabase
        .from('hr_time_off_requests')
        .update({
          status: 'approved',
          approved_by,
          approved_at: new Date().toISOString()
        })
        .eq('id', request_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ time_off_request: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process HR request' }, { status: 500 });
  }
}
