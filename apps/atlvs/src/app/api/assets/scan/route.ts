import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get('barcode');

    if (!barcode) {
      return NextResponse.json({ error: 'Barcode required' }, { status: 400 });
    }

    // Find asset by barcode
    const { data: asset, error } = await supabase
      .from('assets')
      .select('*')
      .eq('barcode', barcode)
      .single();

    if (error || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json({
      asset: {
        id: asset.id,
        barcode: asset.barcode,
        name: asset.name,
        category: asset.category,
        status: asset.status,
        location: asset.location,
        last_scan: asset.last_scan,
        condition: asset.condition,
        serial_number: asset.serial_number,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { barcode, action, location, notes } = body;

    if (!barcode || !action) {
      return NextResponse.json(
        { error: 'Barcode and action are required' },
        { status: 400 }
      );
    }

    // Find asset
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('id, status')
      .eq('barcode', barcode)
      .single();

    if (assetError || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Record scan
    const { data: scan, error: scanError } = await supabase
      .from('asset_scans')
      .insert({
        asset_id: asset.id,
        barcode,
        action,
        scanned_by: user.id,
        location,
        notes,
      })
      .select()
      .single();

    if (scanError) {
      return NextResponse.json({ error: scanError.message }, { status: 500 });
    }

    // Update asset status based on action
    const statusUpdates: Record<string, string> = {
      check_in: 'available',
      check_out: 'checked_out',
    };

    const updates: Record<string, any> = {
      last_scan: new Date().toISOString(),
    };

    if (statusUpdates[action]) {
      updates.status = statusUpdates[action];
    }

    if (location) {
      updates.location = location;
    }

    await supabase
      .from('assets')
      .update(updates)
      .eq('id', asset.id);

    return NextResponse.json({ scan }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
