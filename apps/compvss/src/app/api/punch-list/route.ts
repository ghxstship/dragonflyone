export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const createPunchItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  department: z.string().optional(),
  priority: z.string().optional(),
  projectId: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),
  reportedBy: z.string().uuid().optional(),
  dueDate: z.string().optional(),
});

const updatePunchItemSchema = z.object({
  id: z.string().uuid(),
  status: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
  resolvedBy: z.string().uuid().optional(),
  verifiedBy: z.string().uuid().optional(),
  notes: z.string().optional(),
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
    logger.error("Error fetching punch list:", error);
    return NextResponse.json({ error: "Failed to fetch punch list" }, { status: 500 });
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
    const validatedData = createPunchItemSchema.parse(body);
    const { title, description, location, department, priority, projectId, assignedTo, reportedBy, dueDate } = validatedData;

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
    logger.error("Error creating punch item:", error);
    return NextResponse.json({ error: "Failed to create punch item" }, { status: 500 });
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
    const validatedData = updatePunchItemSchema.parse(body);
    const { id, status, assignedTo, resolvedBy, verifiedBy, notes } = validatedData;

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
    logger.error("Error updating punch item:", error);
    return NextResponse.json({ error: "Failed to update punch item" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabase.from("punch_list_items").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error deleting punch item:", error);
    return NextResponse.json({ error: "Failed to delete punch item" }, { status: 500 });
  }
}
