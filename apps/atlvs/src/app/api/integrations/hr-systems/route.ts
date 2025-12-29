export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const connectSchema = z.object({
  action: z.literal('connect'),
  provider: z.string(),
  api_key: z.string(),
  subdomain: z.string().optional(),
});

const syncEmployeesSchema = z.object({
  action: z.literal('sync_employees'),
  provider: z.string(),
});

const syncTimeOffSchema = z.object({
  action: z.literal('sync_time_off'),
  provider: z.string(),
});

const approveTimeOffSchema = z.object({
  action: z.literal('approve_time_off'),
  request_id: z.string().uuid(),
  approved_by: z.string().uuid(),
});

const hrSystemsActionSchema = z.discriminatedUnion('action', [
  connectSchema,
  syncEmployeesSchema,
  syncTimeOffSchema,
  approveTimeOffSchema,
]);

/**
 * HR Systems Integration API
 * Integrates with Workday, BambooHR, and other HR platforms
 */
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
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      return NextResponse.json({ connection: data || null });
    }

    if (type === 'employees') {
      const { data, error } = await supabase
        .from('hr_synced_employees')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
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
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
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
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
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
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = hrSystemsActionSchema.parse(body);

    if (validatedData.action === 'connect') {
      const { provider, api_key, subdomain } = validatedData;

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
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      return NextResponse.json({ connection: data }, { status: 201 });
    }

    if (validatedData.action === 'sync_employees') {
      const { provider } = validatedData;

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

    if (validatedData.action === 'sync_time_off') {
      const { provider } = validatedData;

      const syncResult = {
        provider,
        requests_synced: 0,
        synced_at: new Date().toISOString()
      };

      return NextResponse.json({ sync_result: syncResult });
    }

    if (validatedData.action === 'approve_time_off') {
      const { request_id, approved_by } = validatedData;

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
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      return NextResponse.json({ time_off_request: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process HR request' }, { status: 500 });
  }
}
