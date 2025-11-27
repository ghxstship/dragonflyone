import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("event_landing_pages")
      .select("*")
      .eq("event_id", eventId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return NextResponse.json({ landingPage: data || null });
  } catch (error) {
    console.error("Error fetching landing page:", error);
    return NextResponse.json(
      { error: "Failed to fetch landing page" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const {
      eventId,
      template,
      primaryColor,
      secondaryColor,
      fontFamily,
      sections,
      seoTitle,
      seoDescription,
      ogImage,
      customCss,
    } = body;

    const { data, error } = await supabase
      .from("event_landing_pages")
      .insert({
        event_id: eventId,
        template,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        font_family: fontFamily,
        sections,
        seo_title: seoTitle,
        seo_description: seoDescription,
        og_image: ogImage,
        custom_css: customCss,
        published: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ landingPage: data });
  } catch (error) {
    console.error("Error creating landing page:", error);
    return NextResponse.json(
      { error: "Failed to create landing page" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, ...updates } = body;

    const updateData: Record<string, unknown> = {};
    
    if (updates.template) updateData.template = updates.template;
    if (updates.primaryColor) updateData.primary_color = updates.primaryColor;
    if (updates.secondaryColor) updateData.secondary_color = updates.secondaryColor;
    if (updates.fontFamily) updateData.font_family = updates.fontFamily;
    if (updates.sections) updateData.sections = updates.sections;
    if (updates.seoTitle) updateData.seo_title = updates.seoTitle;
    if (updates.seoDescription) updateData.seo_description = updates.seoDescription;
    if (updates.ogImage !== undefined) updateData.og_image = updates.ogImage;
    if (updates.customCss !== undefined) updateData.custom_css = updates.customCss;
    if (updates.published !== undefined) {
      updateData.published = updates.published;
      if (updates.published) {
        updateData.published_at = new Date().toISOString();
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("event_landing_pages")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ landingPage: data });
  } catch (error) {
    console.error("Error updating landing page:", error);
    return NextResponse.json(
      { error: "Failed to update landing page" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("event_landing_pages")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting landing page:", error);
    return NextResponse.json(
      { error: "Failed to delete landing page" },
      { status: 500 }
    );
  }
}
