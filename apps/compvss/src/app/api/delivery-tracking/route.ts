export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createDeliverySchema = z.object({
  project_id: z.string().uuid(),
  vendor_id: z.string().uuid().optional(),
  po_number: z.string().optional(),
  items: z.array(z.record(z.unknown())).optional(),
  expected_date: z.string().optional(),
  delivery_location: z.string().optional(),
  notes: z.string().optional(),
});

const receiveDeliverySchema = z.object({
  id: z.string().uuid(),
  action: z.literal('receive'),
  signature_data: z.string().optional(),
  received_items: z.array(z.record(z.unknown())).optional(),
  condition_notes: z.string().optional(),
  photo_urls: z.array(z.string()).optional(),
});

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('update_status'),
  status: z.string(),
  tracking_number: z.string().optional(),
});

const deliveryPatchSchema = z.union([receiveDeliverySchema, updateStatusSchema]);

// Delivery tracking and receiving with signature capture
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

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const status = searchParams.get('status');

    let query = supabase.from('deliveries').select(`
      *, vendor:vendors(id, name), received_by:platform_users(id, first_name, last_name)
    `);

    if (projectId) query = query.eq('project_id', projectId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('expected_date', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({
      deliveries: data,
      pending: data?.filter(d => d.status === 'pending') || [],
      in_transit: data?.filter(d => d.status === 'in_transit') || [],
      received: data?.filter(d => d.status === 'received') || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 });
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

    const userId = authResult.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createDeliverySchema.parse(body);
    const { project_id, vendor_id, po_number, items, expected_date, delivery_location, notes } = validatedData;

    const { data, error } = await supabase.from('deliveries').insert({
      project_id, vendor_id, po_number, items: items || [], expected_date,
      delivery_location, notes, status: 'pending', created_by: userId
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ delivery: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create delivery' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = authResult.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = deliveryPatchSchema.parse(body);
    const { id, action } = validatedData;

    if (action === 'receive') {
      const { signature_data, received_items, condition_notes, photo_urls } = validatedData as z.infer<typeof receiveDeliverySchema>;
      await supabase.from('deliveries').update({
        status: 'received', received_by: userId, received_at: new Date().toISOString(),
        signature_data, received_items: received_items || [], condition_notes,
        photo_urls: photo_urls || []
      }).eq('id', id);

      return NextResponse.json({ success: true, message: 'Delivery received' });
    }

    if (action === 'update_status') {
      const { status, tracking_number } = validatedData as z.infer<typeof updateStatusSchema>;
      await supabase.from('deliveries').update({
        status, tracking_number
      }).eq('id', id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
