import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status");

    let query = supabase
      .from("early_bird_campaigns")
      .select(`
        *,
        event:events(id, name)
      `)
      .order("start_date", { ascending: false });

    if (eventId) query = query.eq("event_id", eventId);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ campaigns: data || [] });
  } catch (error) {
    console.error("Error fetching early bird campaigns:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, eventId, discountType, discountValue, startDate, endDate, ticketLimit } = body;

    const now = new Date();
    const start = new Date(startDate);
    const status = start > now ? "Scheduled" : "Active";

    const { data, error } = await supabase
      .from("early_bird_campaigns")
      .insert({
        name,
        event_id: eventId,
        discount_type: discountType,
        discount_value: discountValue,
        start_date: startDate,
        end_date: endDate,
        ticket_limit: ticketLimit,
        tickets_sold: 0,
        revenue: 0,
        status,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ campaign: data });
  } catch (error) {
    console.error("Error creating early bird campaign:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, ticketsSold, revenue } = body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (ticketsSold !== undefined) updateData.tickets_sold = ticketsSold;
    if (revenue !== undefined) updateData.revenue = revenue;

    const { data, error } = await supabase
      .from("early_bird_campaigns")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ campaign: data });
  } catch (error) {
    console.error("Error updating early bird campaign:", error);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabase.from("early_bird_campaigns").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting early bird campaign:", error);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}
