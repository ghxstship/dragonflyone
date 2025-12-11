export const dynamic = 'force-dynamic';

import { logger } from '@ghxstship/config';
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { GeneratedBlueprint } from "../../../generator/types";

export const runtime = "edge";

// =============================================================================
// SHARE BLUEPRINT API
// Stores a blueprint for sharing and returns a share URL
// =============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blueprint } = body as { blueprint: GeneratedBlueprint };

    if (!blueprint) {
      return NextResponse.json(
        { error: "Blueprint is required" },
        { status: 400 }
      );
    }

    // Generate a short share ID
    const shareId = crypto.randomUUID().split("-")[0];

    // Store the blueprint in the database
    const { error } = await supabase
      .from("shared_blueprints")
      .insert({
        id: shareId,
        blueprint_id: blueprint.id,
        creative_seed: blueprint.creativeSeed,
        blueprint_data: blueprint,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });

    if (error) {
      // If table doesn't exist, just return the blueprint ID as share ID
      logger.error("Failed to store shared blueprint:", error);
      return NextResponse.json({
        shareId: blueprint.id,
        shareUrl: `${process.env.NEXT_PUBLIC_ATLVS_URL || ""}/generator/share/${blueprint.id}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_ATLVS_URL || request.nextUrl.origin;

    return NextResponse.json({
      shareId,
      shareUrl: `${baseUrl}/generator/share/${shareId}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    logger.error("Share error:", error);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("id");

    if (!shareId) {
      return NextResponse.json(
        { error: "Share ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("shared_blueprints")
      .select("*")
      .eq("id", shareId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Blueprint not found or expired" },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Share link has expired" },
        { status: 410 }
      );
    }

    return NextResponse.json({
      blueprint: data.blueprint_data,
    });
  } catch (error) {
    logger.error("Get shared blueprint error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve blueprint" },
      { status: 500 }
    );
  }
}
