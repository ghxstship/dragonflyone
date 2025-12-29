export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from 'zod';

const trackEventSchema = z.object({
  eventType: z.string().min(1),
  eventData: z.record(z.unknown()).optional(),
  blueprintId: z.string().optional(),
  creativeSeed: z.string().optional(),
  sessionId: z.string().optional(),
  pageUrl: z.string().optional(),
  referrer: z.string().optional(),
  durationMs: z.number().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});

export const runtime = "edge";

// =============================================================================
// GENERATOR ANALYTICS API
// Tracks events from the experience generator
// =============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    const body = await request.json();
    const validatedData = trackEventSchema.parse(body);
    const {
      eventType,
      eventData,
      blueprintId,
      creativeSeed,
      sessionId,
      pageUrl,
      referrer,
      durationMs,
      utm_source,
      utm_medium,
      utm_campaign,
    } = validatedData;

    // Get device info from user agent
    const userAgent = request.headers.get("user-agent") || "";
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("x-real-ip") || "";

    // Detect device type
    let deviceType = "desktop";
    if (/mobile/i.test(userAgent)) {
      deviceType = "mobile";
    } else if (/tablet|ipad/i.test(userAgent)) {
      deviceType = "tablet";
    }

    // Detect browser
    let browser = "unknown";
    if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) {
      browser = "chrome";
    } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
      browser = "safari";
    } else if (/firefox/i.test(userAgent)) {
      browser = "firefox";
    } else if (/edge/i.test(userAgent)) {
      browser = "edge";
    }

    // Detect OS
    let os = "unknown";
    if (/windows/i.test(userAgent)) {
      os = "windows";
    } else if (/mac/i.test(userAgent)) {
      os = "macos";
    } else if (/linux/i.test(userAgent)) {
      os = "linux";
    } else if (/android/i.test(userAgent)) {
      os = "android";
    } else if (/ios|iphone|ipad/i.test(userAgent)) {
      os = "ios";
    }

    // Insert analytics event
    const { error } = await supabase.from("generator_analytics").insert({
      event_type: eventType,
      event_data: eventData || {},
      blueprint_id: blueprintId || null,
      creative_seed: creativeSeed || null,
      session_id: sessionId || null,
      page_url: pageUrl || null,
      referrer: referrer || null,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      ip_address: ip || null,
      user_agent: userAgent,
      device_type: deviceType,
      browser,
      os,
      duration_ms: durationMs || null,
    });

    if (error) {
      // Log but don't fail - analytics shouldn't block user actions
      logger.error("Failed to track analytics:", error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Analytics error:", error);
    // Always return success - don't block user actions for analytics
    return NextResponse.json({ success: true });
  }
}

// GET endpoint for retrieving analytics summary (admin only)
export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get("end") || new Date().toISOString();

    // Get summary by event type
    const { data: eventSummary, error: summaryError } = await supabase
      .rpc("get_generator_analytics_summary", {
        p_start_date: startDate,
        p_end_date: endDate,
      });

    if (summaryError) {
      logger.error("Failed to get analytics summary:", summaryError);
      return NextResponse.json(
        { error: "Failed to retrieve analytics" },
        { status: 500 }
      );
    }

    // Get daily counts
    const { data: dailyCounts } = await supabase
      .from("generator_analytics")
      .select("event_type, created_at")
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .order("created_at", { ascending: true });

    // Aggregate daily counts
    const dailyData: Record<string, Record<string, number>> = {};
    dailyCounts?.forEach((event) => {
      const date = new Date(event.created_at).toISOString().split("T")[0];
      if (!dailyData[date]) {
        dailyData[date] = {};
      }
      dailyData[date][event.event_type] = (dailyData[date][event.event_type] || 0) + 1;
    });

    return NextResponse.json({
      summary: eventSummary,
      daily: dailyData,
      period: { start: startDate, end: endDate },
    });
  } catch (error) {
    logger.error("Analytics GET error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve analytics" },
      { status: 500 }
    );
  }
}
