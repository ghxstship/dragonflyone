export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { GeneratedBlueprint } from "../../../generator/types";
import { z } from 'zod';

const exportBlueprintSchema = z.object({
  blueprint: z.object({
    id: z.string(),
    creativeSeed: z.string(),
    generatedAt: z.string(),
    concept: z.object({
      name: z.string(),
      tagline: z.string(),
      narrative: z.string(),
      targetTransformation: z.string(),
      visualIdentity: z.object({
        colorPalette: z.array(z.string()),
      }).passthrough(),
    }).passthrough(),
    sensoryDesign: z.record(z.unknown()),
    spatialTemporal: z.object({
      zones: z.array(z.object({
        name: z.string(),
        code: z.string(),
        type: z.string(),
        description: z.string(),
        capacity: z.number(),
        accessLevel: z.number(),
      })),
    }).passthrough(),
    guestJourney: z.record(z.unknown()),
    documents: z.object({
      credentialTypes: z.array(z.object({
        name: z.string(),
        code: z.string(),
        accessLevel: z.number(),
        color: z.string(),
      })),
      schedulePhases: z.array(z.object({
        name: z.string(),
        code: z.string(),
        description: z.string(),
        duration: z.string(),
      })),
    }).passthrough(),
    executionTiers: z.record(z.unknown()),
  }),
  organizationId: z.string().uuid().optional(),
});

export const runtime = "edge";

// =============================================================================
// EXPORT TO ATLVS API
// Creates a production record from a generated blueprint
// =============================================================================

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
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
    const validatedData = exportBlueprintSchema.parse(body);
    const blueprint = validatedData.blueprint as unknown as GeneratedBlueprint;
    const organizationId = validatedData.organizationId;

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
