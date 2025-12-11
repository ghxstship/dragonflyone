export const dynamic = 'force-dynamic';

import { logger } from '@ghxstship/config';
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

// =============================================================================
// CAPTURE LEAD API
// Captures email and lead info before PDF download
// =============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      name,
      company,
      role,
      marketingConsent,
      newsletterConsent,
      blueprintId,
      creativeSeed,
    } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Get UTM parameters from referrer or headers
    const referer = request.headers.get("referer") || "";
    const userAgent = request.headers.get("user-agent") || "";
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("x-real-ip") || "";

    // Parse UTM parameters from URL if present
    let utmSource, utmMedium, utmCampaign, utmContent, utmTerm;
    try {
      const url = new URL(referer);
      utmSource = url.searchParams.get("utm_source");
      utmMedium = url.searchParams.get("utm_medium");
      utmCampaign = url.searchParams.get("utm_campaign");
      utmContent = url.searchParams.get("utm_content");
      utmTerm = url.searchParams.get("utm_term");
    } catch {
      // Ignore URL parsing errors
    }

    // Detect device type from user agent
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

    // Insert lead into database
    const { data, error } = await supabase
      .from("generator_leads")
      .insert({
        email,
        name: name || null,
        company: company || null,
        role: role || null,
        blueprint_id: blueprintId,
        creative_seed: creativeSeed,
        marketing_consent: marketingConsent || false,
        newsletter_consent: newsletterConsent || false,
        source: "generator",
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
        utm_term: utmTerm,
        referrer: referer,
        ip_address: ip || null,
        user_agent: userAgent,
        device_type: deviceType,
        browser,
        os,
        status: "new",
      })
      .select()
      .single();

    if (error) {
      logger.error("Failed to capture lead:", error);
      // Don't fail the request if DB insert fails - still allow PDF download
      return NextResponse.json({ success: true, leadId: null });
    }

    // Track analytics event
    await supabase.from("generator_analytics").insert({
      event_type: "lead_captured",
      event_data: {
        email_domain: email.split("@")[1],
        has_name: !!name,
        has_company: !!company,
        marketing_consent: marketingConsent,
      },
      blueprint_id: blueprintId,
      creative_seed: creativeSeed,
      ip_address: ip || null,
      user_agent: userAgent,
      device_type: deviceType,
      browser,
      os,
    });

    return NextResponse.json({
      success: true,
      leadId: data?.id,
    });
  } catch (error) {
    logger.error("Lead capture error:", error);
    // Don't block PDF download on error
    return NextResponse.json({ success: true, leadId: null });
  }
}
