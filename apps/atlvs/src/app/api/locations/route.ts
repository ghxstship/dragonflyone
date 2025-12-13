export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const LocationSchema = z.object({
  organization_id: z.string().uuid(),
  name: z.string().min(1),
  address: z.string().optional(),
  type: z.enum(['warehouse', 'venue', 'popup', 'virtual', 'storage', 'office']).default('warehouse'),
  is_active: z.boolean().default(true),
  capacity: z.number().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const organizationId = searchParams.get('organization_id');
    const type = searchParams.get('type');
    const isActive = searchParams.get('is_active');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('inventory_locations')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    if (isActive !== null && isActive !== 'all') {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const locations = data || [];
    const summary = {
      total: count || 0,
      active: locations.filter(l => l.is_active).length,
      by_type: {
        warehouse: locations.filter(l => l.type === 'warehouse').length,
        venue: locations.filter(l => l.type === 'venue').length,
        popup: locations.filter(l => l.type === 'popup').length,
        virtual: locations.filter(l => l.type === 'virtual').length,
        storage: locations.filter(l => l.type === 'storage').length,
        office: locations.filter(l => l.type === 'office').length,
      },
    };

    return NextResponse.json({
      locations,
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const validatedData = LocationSchema.parse(body);

    const { data, error } = await supabase
      .from('inventory_locations')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ location: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
  }
}
