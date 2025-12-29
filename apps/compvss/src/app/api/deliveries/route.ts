export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const createDeliverySchema = z.object({
  vendorId: z.string().uuid().optional(),
  description: z.string().optional(),
  projectId: z.string().uuid().optional(),
  scheduledDate: z.string(),
  scheduledTime: z.string().optional(),
  accessPoint: z.string().optional(),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
  })).optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
});

const updateDeliverySchema = z.object({
  id: z.string().uuid(),
  status: z.string().optional(),
  actualArrival: z.string().optional(),
  receivedBy: z.string().uuid().optional(),
  signature: z.string().optional(),
  receivedItems: z.array(z.object({
    id: z.string().uuid(),
    received: z.number(),
  })).optional(),
});

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
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");
    const date = searchParams.get("date");

    let query = supabase
      .from("deliveries")
      .select(`
        *,
        vendor:vendors(id, name),
        items:delivery_items(*)
      `)
      .order("scheduled_date", { ascending: true })
      .order("scheduled_time", { ascending: true });

    if (projectId) query = query.eq("project_id", projectId);
    if (status) query = query.eq("status", status);
    if (date) query = query.eq("scheduled_date", date);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ deliveries: data || [] });
  } catch (error) {
    logger.error("Error fetching deliveries:", error);
    return NextResponse.json({ error: "Failed to fetch deliveries" }, { status: 500 });
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

    const body = await request.json();
    const validatedData = createDeliverySchema.parse(body);
    const { vendorId, description, projectId, scheduledDate, scheduledTime, accessPoint, items, trackingNumber, carrier } = validatedData;

    const { data: delivery, error: deliveryError } = await supabase
      .from("deliveries")
      .insert({
        vendor_id: vendorId,
        description,
        project_id: projectId,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        access_point: accessPoint,
        tracking_number: trackingNumber,
        carrier,
        status: "Scheduled",
      })
      .select()
      .single();

    if (deliveryError) throw deliveryError;

    if (items && items.length > 0) {
      const deliveryItems = items.map((item: { name: string; quantity: number }) => ({
        delivery_id: delivery.id,
        name: item.name,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase.from("delivery_items").insert(deliveryItems);
      if (itemsError) throw itemsError;
    }

    return NextResponse.json({ delivery });
  } catch (error) {
    logger.error("Error creating delivery:", error);
    return NextResponse.json({ error: "Failed to create delivery" }, { status: 500 });
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

    const body = await request.json();
    const validatedData = updateDeliverySchema.parse(body);
    const { id, status, actualArrival, receivedBy, signature, receivedItems } = validatedData;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (actualArrival) updateData.actual_arrival = actualArrival;
    if (receivedBy) updateData.received_by = receivedBy;
    if (signature) updateData.signature_url = signature;

    const { data, error } = await supabase
      .from("deliveries")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (receivedItems && receivedItems.length > 0) {
      for (const item of receivedItems) {
        await supabase
          .from("delivery_items")
          .update({ received_quantity: item.received })
          .eq("id", item.id);
      }
    }

    return NextResponse.json({ delivery: data });
  } catch (error) {
    logger.error("Error updating delivery:", error);
    return NextResponse.json({ error: "Failed to update delivery" }, { status: 500 });
  }
}
