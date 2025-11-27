import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
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
    console.error("Error fetching damage reports:", error);
    return NextResponse.json({ error: "Failed to fetch damage reports" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { assetId, description, location, severity, projectId, reportedBy, estimatedCost, photos } = body;

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
    console.error("Error creating damage report:", error);
    return NextResponse.json({ error: "Failed to create damage report" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { id, status, repairVendor, actualCost, insuranceClaim, notes } = body;

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
    console.error("Error updating damage report:", error);
    return NextResponse.json({ error: "Failed to update damage report" }, { status: 500 });
  }
}
