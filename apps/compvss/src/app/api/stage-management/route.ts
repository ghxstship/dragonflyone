import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from '@ghxstship/config';

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    // Fetch performers
    const { data: performers, error: performersError } = await supabase
      .from("event_performers")
      .select("*")
      .eq("event_id", eventId)
      .order("set_time", { ascending: true });

    if (performersError) throw performersError;

    // Fetch stage areas
    const { data: stageAreas, error: areasError } = await supabase
      .from("stage_areas")
      .select("*")
      .eq("event_id", eventId);

    if (areasError) throw areasError;

    // Fetch cues
    const { data: cues, error: cuesError } = await supabase
      .from("show_cues")
      .select("*")
      .eq("event_id", eventId)
      .order("cue_number", { ascending: true });

    if (cuesError) throw cuesError;

    return NextResponse.json({
      performers: performers || [],
      stageAreas: stageAreas || [],
      cues: cues || [],
    });
  } catch (error) {
    console.error("Error fetching stage management data:", error);
    return NextResponse.json(
      { error: "Failed to fetch stage management data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const { type, data } = body;

    let result;

    switch (type) {
      case "performer":
        result = await supabase
          .from("event_performers")
          .insert(data)
          .select()
          .single();
        break;
      case "checkin":
        result = await supabase
          .from("event_performers")
          .update({
            status: "Checked In",
            checked_in_at: new Date().toISOString(),
            dressing_room: data.dressingRoom,
          })
          .eq("id", data.performerId)
          .select()
          .single();
        break;
      case "cue":
        result = await supabase
          .from("show_cues")
          .insert(data)
          .select()
          .single();
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (result.error) throw result.error;

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error("Error in stage management:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const { type, id, updates } = body;

    let result;

    switch (type) {
      case "performer":
        result = await supabase
          .from("event_performers")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        break;
      case "cue":
        result = await supabase
          .from("show_cues")
          .update({
            ...updates,
            executed_at: updates.status === "Complete" ? new Date().toISOString() : null,
          })
          .eq("id", id)
          .select()
          .single();
        break;
      case "area":
        result = await supabase
          .from("stage_areas")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (result.error) throw result.error;

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error("Error updating stage management:", error);
    return NextResponse.json(
      { error: "Failed to update" },
      { status: 500 }
    );
  }
}
