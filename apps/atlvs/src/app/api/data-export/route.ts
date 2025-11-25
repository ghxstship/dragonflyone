import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const exportSchema = z.object({
  export_type: z.string().min(1),
  parameters: z.record(z.any()).optional(),
  format: z.enum(['csv', 'excel', 'json', 'pdf']),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const exportId = searchParams.get('export_id');
    const userId = searchParams.get('user_id');

    if (type === 'status' && exportId) {
      const { data: exportData, error } = await supabase
        .from('data_exports')
        .select('*')
        .eq('id', exportId)
        .single();

      if (error) throw error;
      return NextResponse.json({ export: exportData });
    }

    let query = supabase
      .from('data_exports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (userId) query = query.eq('requested_by', userId);

    const { data: exports, error } = await query;
    if (error) throw error;

    return NextResponse.json({ exports });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = exportSchema.parse(body);
    const requestedBy = body.requested_by;

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
    let data: any[] = [];
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
        .from('invoices')
        .select('*')
        .gte('created_at', params.start_date || '2000-01-01')
        .lte('created_at', params.end_date || new Date().toISOString())
        .limit(params.limit || 10000);
      data = invoices || [];
      rowCount = data.length;
    } else if (exportType === 'purchase_orders') {
      const { data: pos } = await supabase
        .from('purchase_orders')
        .select('*')
        .gte('created_at', params.start_date || '2000-01-01')
        .lte('created_at', params.end_date || new Date().toISOString())
        .limit(params.limit || 10000);
      data = pos || [];
      rowCount = data.length;
    } else if (exportType === 'timesheets') {
      const { data: timesheets } = await supabase
        .from('timesheets')
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
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
