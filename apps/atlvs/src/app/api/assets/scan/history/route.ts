export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const asset_id = searchParams.get('asset_id');
    const action = searchParams.get('action');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');

    let query = supabase
      .from('asset_scans')
      .select(`
        id,
        barcode,
        action,
        location,
        notes,
        created_at,
        scanned_by,
        asset:assets(id, name, category, status)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (asset_id) {
      query = query.eq('asset_id', asset_id);
    }
    if (action) {
      query = query.eq('action', action);
    }
    if (date_from) {
      query = query.gte('created_at', date_from);
    }
    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to match expected format
    const transformedData = (data || []).map((scan) => ({
      id: scan.id,
      barcode: scan.barcode,
      asset_name: scan.asset?.name || 'Unknown Asset',
      action: scan.action,
      scanned_by: scan.scanned_by || 'System',
      timestamp: scan.created_at,
      location: scan.location || 'Unknown',
    }));

    return NextResponse.json({ data: transformedData });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
