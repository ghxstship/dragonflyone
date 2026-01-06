import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { log } from "@ghxstship/config";

export const runtime = "edge";

// =============================================================================
// MEMBERSHIP APPLICATION API
// POST /api/membership/apply - Submit a membership application
// =============================================================================

// Validation schema for membership application
const membershipApplicationSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  city: z.string().min(1, "City is required").max(100),
  country: z.string().min(1, "Country is required").max(100),
  interests: z.array(z.string()).min(1, "At least one interest is required"),
  selectedTier: z.string().min(1, "Please select a membership tier"),
  referralCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid or missing request body' },
        { status: 400 }
      );
    }
    const validationResult = membershipApplicationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const application = validationResult.data;

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      log.error('Missing Supabase configuration', undefined, { endpoint: '/api/membership/apply', method: 'POST' });
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if email already has a pending application
    const { data: existingApplication } = await supabase
      .from("membership_applications")
      .select("id, status")
      .eq("email", application.email)
      .in("status", ["pending", "approved"])
      .single();

    if (existingApplication) {
      if (existingApplication.status === "approved") {
        return NextResponse.json(
          { error: "This email is already associated with an active membership" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "You already have a pending application" },
        { status: 409 }
      );
    }

    // Insert the application
    const { data: newApplication, error: insertError } = await supabase
      .from("membership_applications")
      .insert({
        first_name: application.firstName,
        last_name: application.lastName,
        email: application.email,
        phone: application.phone || null,
        city: application.city,
        country: application.country,
        interests: application.interests,
        selected_tier: application.selectedTier,
        referral_code: application.referralCode || null,
        status: "pending",
        submitted_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError) {
      log.error('Failed to insert application', insertError, { endpoint: '/api/membership/apply', method: 'POST', email: application.email });
      return NextResponse.json(
        { error: "Failed to submit application" },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        applicationId: newApplication.id,
        message: "Application submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    log.error('Membership application error', error, { endpoint: '/api/membership/apply', method: 'POST' });
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// GET endpoint to check application status by email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: application, error } = await supabase
      .from("membership_applications")
      .select("id, status, selected_tier, submitted_at")
      .eq("email", email)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !application) {
      return NextResponse.json(
        { error: "No application found for this email" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      applicationId: application.id,
      status: application.status,
      tier: application.selected_tier,
      submittedAt: application.submitted_at,
    });
  } catch (error) {
    log.error('Application status check error', error, { endpoint: '/api/membership/apply', method: 'GET' });
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
