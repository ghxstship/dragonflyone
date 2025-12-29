export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createTrackingSchema = z.object({
  assetId: z.string().uuid(),
  location: z.string(),
  trackingType: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  zone: z.string().optional(),
});

const updateTrackingSchema = z.object({
  id: z.string().uuid(),
  location: z.string().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  zone: z.string().optional(),
  status: z.string().optional(),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
    logger.error("Error fetching asset locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset locations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createTrackingSchema.parse(body);
    const { assetId, location, trackingType, coordinates, zone } = validatedData;

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
    logger.error("Error creating asset location:", error);
    return NextResponse.json(
      { error: "Failed to create asset location" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateTrackingSchema.parse(body);
    const { id, location, coordinates, zone, status } = validatedData;

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
    logger.error("Error updating asset location:", error);
    return NextResponse.json(
      { error: "Failed to update asset location" },
      { status: 500 }
    );
  }
}
