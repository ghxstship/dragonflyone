export const dynamic = 'force-dynamic';

import { logger } from '@ghxstship/config';
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { GeneratedBlueprint } from "../../../generator/types";

export const runtime = "edge";

// =============================================================================
// EXPORT TO ATLVS API
// Creates a production record from a generated blueprint
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required", redirectTo: "/auth/login" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    
    // Create Supabase client with user's token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication", redirectTo: "/auth/login" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { blueprint, organizationId } = body as { 
      blueprint: GeneratedBlueprint; 
      organizationId?: string;
    };

    if (!blueprint) {
      return NextResponse.json(
        { error: "Blueprint is required" },
        { status: 400 }
      );
    }

    // Get user's organization if not provided
    let orgId = organizationId;
    if (!orgId) {
      const { data: userOrgs } = await supabase
        .from("user_roles")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();
      
      orgId = userOrgs?.organization_id;
    }

    if (!orgId) {
      // Create a personal organization for the user
      const { data: newOrg, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: `${user.email?.split("@")[0]}'s Productions`,
          created_by: user.id,
        })
        .select()
        .single();

      if (orgError) {
        logger.error("Failed to create organization:", orgError);
        return NextResponse.json(
          { error: "Failed to create organization" },
          { status: 500 }
        );
      }

      orgId = newOrg.id;

      // Add user to organization
      await supabase.from("user_roles").insert({
        user_id: user.id,
        organization_id: orgId,
        role: "admin",
      });
    }

    // Create the production record
    const { data: production, error: productionError } = await supabase
      .from("productions")
      .insert({
        organization_id: orgId,
        title: blueprint.concept.name,
        slug: blueprint.concept.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        tagline: blueprint.concept.tagline,
        description: blueprint.concept.narrative,
        elevator_pitch: blueprint.concept.targetTransformation,
        status: "draft",
        color_palette: blueprint.concept.visualIdentity.colorPalette,
        sensory_design: blueprint.sensoryDesign,
        xyz_foundation: blueprint.spatialTemporal,
        url_irl_journey: blueprint.guestJourney,
        metadata: {
          generatedAt: blueprint.generatedAt,
          creativeSeed: blueprint.creativeSeed,
          executionTiers: blueprint.executionTiers,
          documents: blueprint.documents,
        },
        created_by: user.id,
      })
      .select()
      .single();

    if (productionError) {
      logger.error("Failed to create production:", productionError);
      return NextResponse.json(
        { error: "Failed to create production" },
        { status: 500 }
      );
    }

    // Create zones from blueprint
    const zonesToInsert = blueprint.spatialTemporal.zones.map((zone) => ({
      production_id: production.id,
      organization_id: orgId,
      name: zone.name,
      code: zone.code,
      zone_type: zone.type,
      description: zone.description,
      capacity: zone.capacity,
      access_level: zone.accessLevel,
    }));

    if (zonesToInsert.length > 0) {
      await supabase.from("zones").insert(zonesToInsert);
    }

    // Create credential types from blueprint
    const credentialTypesToInsert = blueprint.documents.credentialTypes.map((cred) => ({
      production_id: production.id,
      organization_id: orgId,
      name: cred.name,
      code: cred.code,
      access_level: cred.accessLevel,
      color: cred.color,
      is_active: true,
    }));

    if (credentialTypesToInsert.length > 0) {
      await supabase.from("credential_types").insert(credentialTypesToInsert);
    }

    // Create schedule phases
    const schedulePhasesToInsert = blueprint.documents.schedulePhases.map((phase, index) => ({
      production_id: production.id,
      organization_id: orgId,
      name: phase.name,
      code: phase.code,
      description: phase.description,
      sort_order: index + 1,
      metadata: { duration: phase.duration },
    }));

    if (schedulePhasesToInsert.length > 0) {
      await supabase.from("schedule_phases").insert(schedulePhasesToInsert);
    }

    return NextResponse.json({
      success: true,
      productionId: production.id,
      redirectUrl: `/projects/${production.id}`,
    });
  } catch (error) {
    logger.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export blueprint" },
      { status: 500 }
    );
  }
}
