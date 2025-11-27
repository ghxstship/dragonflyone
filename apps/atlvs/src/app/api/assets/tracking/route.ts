import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const trackingType = searchParams.get("trackingType");

    let query = supabase
      .from("asset_locations")
      .select(`
        *,
        asset:assets(id, name, category, status, value)
      `)
      .order("last_seen", { ascending: false });

    if (status && status !== "All") {
      query = query.eq("status", status);
    }

    if (trackingType && trackingType !== "All") {
      query = query.eq("tracking_type", trackingType);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ locations: data || [] });
  } catch (error) {
    console.error("Error fetching asset locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset locations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { assetId, location, trackingType, coordinates, zone } = body;

    const { data, error } = await supabase
      .from("asset_locations")
      .insert({
        asset_id: assetId,
        current_location: location,
        tracking_type: trackingType,
        coordinates,
        zone,
        status: "Active",
        last_seen: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ location: data });
  } catch (error) {
    console.error("Error creating asset location:", error);
    return NextResponse.json(
      { error: "Failed to create asset location" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { id, location, coordinates, zone, status } = body;

    const updateData: Record<string, unknown> = {
      last_seen: new Date().toISOString(),
    };

    if (location) updateData.current_location = location;
    if (coordinates) updateData.coordinates = coordinates;
    if (zone) updateData.zone = zone;
    if (status) updateData.status = status;

    const { data, error } = await supabase
      .from("asset_locations")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ location: data });
  } catch (error) {
    console.error("Error updating asset location:", error);
    return NextResponse.json(
      { error: "Failed to update asset location" },
      { status: 500 }
    );
  }
}
