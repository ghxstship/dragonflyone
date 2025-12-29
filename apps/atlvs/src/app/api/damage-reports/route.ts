export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createDamageReportSchema = z.object({
  assetId: z.string().uuid(),
  description: z.string().min(1),
  location: z.string().optional(),
  severity: z.enum(['Minor', 'Moderate', 'Major', 'Critical']),
  projectId: z.string().uuid().optional(),
  reportedBy: z.string().uuid().optional(),
  estimatedCost: z.number().optional(),
  photos: z.array(z.string()).optional(),
});

const updateDamageReportSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['Reported', 'Under Review', 'In Repair', 'Resolved']).optional(),
  repairVendor: z.string().optional(),
  actualCost: z.number().optional(),
  insuranceClaim: z.boolean().optional(),
  notes: z.string().optional(),
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
    const assetId = searchParams.get("assetId");
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");

    let query = supabase
      .from("damage_reports")
      .select(`
        *,
        asset:assets(id, name, category)
      `)
      .order("reported_date", { ascending: false });

    if (assetId) query = query.eq("asset_id", assetId);
    if (status) query = query.eq("status", status);
    if (severity) query = query.eq("severity", severity);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ reports: data || [] });
  } catch (error) {
    logger.error("Error fetching damage reports:", error);
    return NextResponse.json({ error: "Failed to fetch damage reports" }, { status: 500 });
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
    const validatedData = createDamageReportSchema.parse(body);
    const { assetId, description, location, severity, projectId, reportedBy, estimatedCost, photos } = validatedData;

    const { data, error } = await supabase
      .from("damage_reports")
      .insert({
        asset_id: assetId,
        description,
        location,
        severity,
        project_id: projectId,
        reported_by: reportedBy,
        estimated_cost: estimatedCost,
        photos,
        status: "Reported",
        reported_date: new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    if (error) throw error;

    // Update asset status if critical
    if (severity === "Critical") {
      await supabase
        .from("assets")
        .update({ status: "Out of Service" })
        .eq("id", assetId);
    }

    return NextResponse.json({ report: data });
  } catch (error) {
    logger.error("Error creating damage report:", error);
    return NextResponse.json({ error: "Failed to create damage report" }, { status: 500 });
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
    const validatedData = updateDamageReportSchema.parse(body);
    const { id, status, repairVendor, actualCost, insuranceClaim, notes } = validatedData;

    const updateData: Record<string, unknown> = {};
    if (status) {
      updateData.status = status;
      if (status === "Resolved") updateData.resolved_date = new Date().toISOString().split("T")[0];
    }
    if (repairVendor) updateData.repair_vendor = repairVendor;
    if (actualCost !== undefined) updateData.actual_cost = actualCost;
    if (insuranceClaim !== undefined) updateData.insurance_claim = insuranceClaim;
    if (notes) updateData.notes = notes;

    const { data, error } = await supabase
      .from("damage_reports")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // If resolved, update asset status back to available
    if (status === "Resolved" && data.asset_id) {
      await supabase
        .from("assets")
        .update({ status: "Available" })
        .eq("id", data.asset_id);
    }

    return NextResponse.json({ report: data });
  } catch (error) {
    logger.error("Error updating damage report:", error);
    return NextResponse.json({ error: "Failed to update damage report" }, { status: 500 });
  }
}
