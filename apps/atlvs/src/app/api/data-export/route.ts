export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const exportSchema = z.object({
  export_type: z.string().min(1),
  parameters: z.record(z.any()).optional(),
  format: z.enum(['csv', 'excel', 'json', 'pdf']),
});

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required for data export' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const exportId = searchParams.get('export_id');
    const userId = searchParams.get('user_id');

    if (type === 'status' && exportId) {
      const { data: exportData, error } = await supabase
        .from('data_exports')
        .select('id, export_type, format, status, file_url, file_size, row_count, expires_at, created_at')
        .eq('id', exportId)
        .single();

      if (error) throw error;
      return NextResponse.json({ export: exportData });
    }

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('data_exports')
      .select('id, export_type, format, status, file_url, file_size, row_count, expires_at, created_at', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (userId) query = query.eq('requested_by', userId);

    const { data: exports, error, count } = await query.range(offset, offset + limit - 1);
    if (error) throw error;

    const totalCount = count || (exports?.length ?? 0);
    const pagination = {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: offset + (exports?.length ?? 0) < totalCount,
    };

    return NextResponse.json({ exports, pagination });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required for data export' }, { status: 403 });
    }

    const body = await request.json();
    const validated = exportSchema.parse(body);
    const requestedBy = authResult.user?.id;

    // Create export record
    const { data: exportRecord, error } = await supabase
      .from('data_exports')
      .insert({
        ...validated,
        status: 'pending',
        requested_by: requestedBy,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Process export based on type
    const exportType = validated.export_type;
    const params = validated.parameters || {};
    let data: unknown[] = [];
    let rowCount = 0;

    if (exportType === 'contacts') {
      const { data: contacts } = await supabase
        .from('contacts')
        .select('*')
        .limit(params.limit || 10000);
      data = contacts || [];
      rowCount = data.length;
    } else if (exportType === 'invoices') {
      const { data: invoices } = await supabase
        .from('docs_profile_invoice')
        .select('*')
        .gte('created_at', params.start_date || '2000-01-01')
        .lte('created_at', params.end_date || new Date().toISOString())
        .limit(params.limit || 10000);
      data = invoices || [];
      rowCount = data.length;
    } else if (exportType === 'purchase_orders') {
      const { data: pos } = await supabase
        .from('finance_purchase_orders')
        .select('*')
        .gte('created_at', params.start_date || '2000-01-01')
        .lte('created_at', params.end_date || new Date().toISOString())
        .limit(params.limit || 10000);
      data = pos || [];
      rowCount = data.length;
    } else if (exportType === 'timesheets') {
      const { data: timesheets } = await supabase
        .from('workforce_time_entries')
        .select('*')
        .gte('date', params.start_date || '2000-01-01')
        .lte('date', params.end_date || new Date().toISOString())
        .limit(params.limit || 10000);
      data = timesheets || [];
      rowCount = data.length;
    }

    // Generate export content
    let content = '';
    if (validated.format === 'json') {
      content = JSON.stringify(data, null, 2);
    } else if (validated.format === 'csv' && data.length > 0) {
      const headers = Object.keys(data[0]);
      const rows = data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
      content = [headers.join(','), ...rows].join('\n');
    }

    // Update export record
    await supabase
      .from('data_exports')
      .update({
        status: 'completed',
        row_count: rowCount,
        file_size: content.length,
        completed_at: new Date().toISOString(),
      })
      .eq('id', exportRecord.id);

    return NextResponse.json({
      export: exportRecord,
      row_count: rowCount,
      preview: data.slice(0, 5),
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
