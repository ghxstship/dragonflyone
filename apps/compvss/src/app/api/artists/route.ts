import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from '@ghxstship/config';

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const genre = searchParams.get("genre");
    const search = searchParams.get("search");

    let query = supabase
      .from("artists")
      .select("*")
      .order("name", { ascending: true });

    if (type) query = query.eq("type", type);
    if (genre) query = query.ilike("genre", `%${genre}%`);
    if (search) query = query.or(`name.ilike.%${search}%,genre.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ artists: data || [] });
  } catch (error) {
    console.error("Error fetching artists:", error);
    return NextResponse.json({ error: "Failed to fetch artists" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const { name, genre, type, manager, managerEmail, managerPhone, agent, notes } = body;

    const { data, error } = await supabase
      .from("artists")
      .insert({
        name,
        genre,
        type,
        manager_name: manager,
        manager_email: managerEmail,
        manager_phone: managerPhone,
        agent,
        notes,
        technical_rider: false,
        hospitality_rider: false,
        input_list: false,
        stage_plot: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ artist: data });
  } catch (error) {
    console.error("Error creating artist:", error);
    return NextResponse.json({ error: "Failed to create artist" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const updateData: Record<string, unknown> = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.genre) updateData.genre = updates.genre;
    if (updates.type) updateData.type = updates.type;
    if (updates.manager) updateData.manager_name = updates.manager;
    if (updates.managerEmail) updateData.manager_email = updates.managerEmail;
    if (updates.managerPhone) updateData.manager_phone = updates.managerPhone;
    if (updates.agent) updateData.agent = updates.agent;
    if (updates.technicalRider !== undefined) updateData.technical_rider = updates.technicalRider;
    if (updates.hospitalityRider !== undefined) updateData.hospitality_rider = updates.hospitalityRider;
    if (updates.inputList !== undefined) updateData.input_list = updates.inputList;
    if (updates.stagePlot !== undefined) updateData.stage_plot = updates.stagePlot;
    if (updates.notes) updateData.notes = updates.notes;

    const { data, error } = await supabase
      .from("artists")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ artist: data });
  } catch (error) {
    console.error("Error updating artist:", error);
    return NextResponse.json({ error: "Failed to update artist" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabase.from("artists").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting artist:", error);
    return NextResponse.json({ error: "Failed to delete artist" }, { status: 500 });
  }
}
