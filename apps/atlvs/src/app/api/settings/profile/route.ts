import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const updateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  bio: z.string().max(1000).optional(),
  avatar_url: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("platform_users")
      .select("id, full_name, email, phone, bio, avatar_url, created_at, updated_at")
      .eq("auth_user_id", user.id)
      .single();

    if (error) {
      return NextResponse.json({
        profile: {
          id: user.id,
          name: user.user_metadata?.full_name || "",
          email: user.email || "",
          phone: user.phone || "",
          bio: "",
          avatar_url: user.user_metadata?.avatar_url || "",
        },
      });
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        name: profile.full_name || "",
        email: profile.email || user.email || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 422 }
      );
    }

    const { name, email, phone, bio, avatar_url } = validation.data;

    const { data: existingProfile } = await supabase
      .from("platform_users")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (existingProfile) {
      const { error: updateError } = await supabase
        .from("platform_users")
        .update({
          full_name: name,
          email,
          phone,
          bio,
          avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingProfile.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    if (name) {
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: { full_name: name },
      });
    }

    return NextResponse.json({
      success: true,
      profile: { name, email, phone, bio, avatar_url },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
