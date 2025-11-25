import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
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
    console.error("Error fetching deliveries:", error);
    return NextResponse.json({ error: "Failed to fetch deliveries" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorId, description, projectId, scheduledDate, scheduledTime, accessPoint, items, trackingNumber, carrier } = body;

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
    console.error("Error creating delivery:", error);
    return NextResponse.json({ error: "Failed to create delivery" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, actualArrival, receivedBy, signature, receivedItems } = body;

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
    console.error("Error updating delivery:", error);
    return NextResponse.json({ error: "Failed to update delivery" }, { status: 500 });
  }
}
