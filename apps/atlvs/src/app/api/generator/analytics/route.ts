export const dynamic = 'force-dynamic';

import { Logger } from '@ghxstship/config';
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

// =============================================================================
// GENERATOR ANALYTICS API
// Tracks events from the experience generator
// =============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    } = body;

    if (!eventType) {
      return NextResponse.json(
        { error: "Event type is required" },
        { status: 400 }
      );
    }

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
      Logger.error("Failed to track analytics:", error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    Logger.error("Analytics error:", error);
    // Always return success - don't block user actions for analytics
    return NextResponse.json({ success: true });
  }
}

// GET endpoint for retrieving analytics summary (admin only)
export async function GET(request: NextRequest) {
  try {
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
      Logger.error("Failed to get analytics summary:", summaryError);
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
    Logger.error("Analytics GET error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve analytics" },
      { status: 500 }
    );
  }
}
