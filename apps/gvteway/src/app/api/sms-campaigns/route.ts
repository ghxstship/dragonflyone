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
      .from("sms_campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (eventId) query = query.eq("event_id", eventId);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ campaigns: data || [] });
  } catch (error) {
    console.error("Error fetching SMS campaigns:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, message, eventId, audienceSegmentId, scheduledDate } = body;

    // Get audience size
    const { data: segment } = await supabase
      .from("audience_segments")
      .select("subscriber_count")
      .eq("id", audienceSegmentId)
      .single();

    const { data, error } = await supabase
      .from("sms_campaigns")
      .insert({
        name,
        message,
        event_id: eventId,
        audience_segment_id: audienceSegmentId,
        audience_size: segment?.subscriber_count || 0,
        scheduled_date: scheduledDate,
        status: scheduledDate ? "Scheduled" : "Draft",
        sent_count: 0,
        delivered_count: 0,
        click_count: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ campaign: data });
  } catch (error) {
    console.error("Error creating SMS campaign:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, sentCount, deliveredCount, clickCount } = body;

    const updateData: Record<string, unknown> = {};
    if (status) {
      updateData.status = status;
      if (status === "Completed") updateData.completed_at = new Date().toISOString();
    }
    if (sentCount !== undefined) updateData.sent_count = sentCount;
    if (deliveredCount !== undefined) updateData.delivered_count = deliveredCount;
    if (clickCount !== undefined) updateData.click_count = clickCount;

    const { data, error } = await supabase
      .from("sms_campaigns")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ campaign: data });
  } catch (error) {
    console.error("Error updating SMS campaign:", error);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabase.from("sms_campaigns").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting SMS campaign:", error);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}
