import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const appearanceSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  fontSize: z.enum(["small", "medium", "large"]).optional(),
  compactMode: z.boolean().optional(),
  reducedMotion: z.boolean().optional(),
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

    const { data: preferences } = await supabase
      .from("user_preferences")
      .select("preferences")
      .eq("user_id", user.id)
      .single();

    const defaultSettings = {
      theme: "system",
      fontSize: "medium",
      compactMode: false,
      reducedMotion: false,
    };

    if (!preferences?.preferences) {
      return NextResponse.json({ settings: defaultSettings });
    }

    const appearance = preferences.preferences as Record<string, unknown>;
    return NextResponse.json({
      settings: {
        theme: appearance.theme || defaultSettings.theme,
        fontSize: appearance.fontSize || defaultSettings.fontSize,
        compactMode: appearance.compactMode ?? defaultSettings.compactMode,
        reducedMotion: appearance.reducedMotion ?? defaultSettings.reducedMotion,
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
    const validation = appearanceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 422 }
      );
    }

    const { data: existing } = await supabase
      .from("user_preferences")
      .select("id, preferences")
      .eq("user_id", user.id)
      .single();

    const currentPrefs = (existing?.preferences as Record<string, unknown>) || {};
    const updatedPrefs = { ...currentPrefs, ...validation.data };

    if (existing) {
      const { error: updateError } = await supabase
        .from("user_preferences")
        .update({
          preferences: updatedPrefs,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    } else {
      const { error: insertError } = await supabase
        .from("user_preferences")
        .insert({
          user_id: user.id,
          preferences: updatedPrefs,
        });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      settings: validation.data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
