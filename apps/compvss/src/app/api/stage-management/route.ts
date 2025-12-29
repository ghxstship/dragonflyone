export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const postSchema = z.object({
  type: z.enum(['performer', 'checkin', 'cue']),
  data: z.record(z.unknown()),
});

const patchSchema = z.object({
  type: z.enum(['performer', 'cue', 'area']),
  id: z.string().uuid(),
  updates: z.record(z.unknown()),
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
    logger.error("Error fetching stage management data:", error);
    return NextResponse.json(
      { error: "Failed to fetch stage management data" },
      { status: 500 }
    );
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
    const validatedData = postSchema.parse(body);
    const { type, data } = validatedData;

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
    logger.error("Error in stage management:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
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
    const validatedData = patchSchema.parse(body);
    const { type, id, updates } = validatedData;

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
    logger.error("Error updating stage management:", error);
    return NextResponse.json(
      { error: "Failed to update" },
      { status: 500 }
    );
  }
}
