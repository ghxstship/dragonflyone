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
    const department = searchParams.get("department");

    let query = supabase
      .from("punch_list_items")
      .select("*")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false });

    if (projectId) query = query.eq("project_id", projectId);
    if (status) query = query.eq("status", status);
    if (department) query = query.eq("department", department);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ items: data || [] });
  } catch (error) {
    console.error("Error fetching punch list:", error);
    return NextResponse.json({ error: "Failed to fetch punch list" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, location, department, priority, projectId, assignedTo, reportedBy, dueDate } = body;

    const { data, error } = await supabase
      .from("punch_list_items")
      .insert({
        title,
        description,
        location,
        department,
        priority,
        project_id: projectId,
        assigned_to: assignedTo,
        reported_by: reportedBy,
        due_date: dueDate,
        status: "Open",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ item: data });
  } catch (error) {
    console.error("Error creating punch item:", error);
    return NextResponse.json({ error: "Failed to create punch item" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, assignedTo, resolvedBy, verifiedBy, notes } = body;

    const updateData: Record<string, unknown> = {};
    if (status) {
      updateData.status = status;
      if (status === "Resolved") updateData.resolved_at = new Date().toISOString();
      if (status === "Verified") updateData.verified_at = new Date().toISOString();
    }
    if (assignedTo) updateData.assigned_to = assignedTo;
    if (resolvedBy) updateData.resolved_by = resolvedBy;
    if (verifiedBy) updateData.verified_by = verifiedBy;
    if (notes) updateData.notes = notes;

    const { data, error } = await supabase
      .from("punch_list_items")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ item: data });
  } catch (error) {
    console.error("Error updating punch item:", error);
    return NextResponse.json({ error: "Failed to update punch item" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabase.from("punch_list_items").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting punch item:", error);
    return NextResponse.json({ error: "Failed to delete punch item" }, { status: 500 });
  }
}
