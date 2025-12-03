import { NextRequest, NextResponse } from "next/server";
import type { GeneratedBlueprint } from "../../../generator/types";

export const runtime = "edge";

// =============================================================================
// EXPERIENCE GENERATOR API
// Generates a complete experience blueprint from a creative seed
// =============================================================================

// Mock data generator for MVP - will be replaced with actual AI call
function generateMockBlueprint(creativeSeed: string): GeneratedBlueprint {
  const seed = creativeSeed.toUpperCase();
  const id = crypto.randomUUID();
  
  return {
    id,
    creativeSeed: seed,
    generatedAt: new Date().toISOString(),
    
    concept: {
      name: `${seed}: THE BECOMING`,
      tagline: `Where ${seed.toLowerCase()} is not witnessed, but lived`,
      narrative: `${seed} is an immersive experience that transforms the ordinary into the extraordinary. Guests enter a world where the boundaries between observer and participant dissolve, creating a deeply personal journey of discovery and transformation. Through carefully orchestrated sensory activations and interactive moments, each visitor becomes an integral part of the unfolding narrative, emerging with a new perspective on ${seed.toLowerCase()} and their own potential for change.`,
      targetTransformation: `Guests arrive as observers and leave as participants in their own ${seed.toLowerCase()}, carrying the experience as a permanent shift in perspective. They will have confronted their assumptions, embraced uncertainty, and discovered new dimensions of themselves through the lens of ${seed.toLowerCase()}.`,
      visualIdentity: {
        colorPalette: ["#1A1A2E", "#FF006E", "#00F5D4", "#FEE440", "#9B5DE5"],
        typography: "Bold geometric sans-serif with hand-drawn accent elements",
        moodKeywords: ["Transformative", "Immersive", "Bold", "Mysterious", "Empowering"],
      },
    },
    
    sensoryDesign: {
      sight: {
        primary: "Dynamic projection mapping that responds to guest movement and emotion",
        secondary: [
          "Bioluminescent pathway lighting",
          "Mirror installations creating infinite reflections",
          "Color-shifting LED environments",
        ],
        technicalRequirements: ["8K projectors", "Motion tracking cameras", "DMX lighting control"],
        accessibility: "Audio descriptions available, high-contrast pathways for low vision",
      },
      sound: {
        primary: "Spatial audio soundscape that evolves based on collective guest energy",
        secondary: [
          "Binaural beats for altered states",
          "Live musicians responding to crowd dynamics",
          "Whispered narratives through directional speakers",
        ],
        technicalRequirements: ["32-channel spatial audio", "Subwoofers for haptic bass", "Wireless headphones"],
        accessibility: "Visual sound indicators, vibration-based audio translation",
      },
      touch: {
        primary: "Temperature-controlled environments shifting from cool to warm",
        secondary: [
          "Textured walls inviting exploration",
          "Haptic feedback wearables",
          "Water mist curtains at thresholds",
        ],
        technicalRequirements: ["HVAC zoning", "Haptic vests", "Misting systems"],
        accessibility: "Tactile maps, guided touch tours available",
      },
      taste: {
        primary: "Signature elixirs that evolve in flavor as guests progress",
        secondary: [
          "Edible installations",
          "Flavor-paired moments with narrative beats",
          "Molecular gastronomy surprises",
        ],
        technicalRequirements: ["Mobile bar stations", "Temperature-controlled storage", "Allergen protocols"],
        accessibility: "Full allergen menu, dietary accommodations for all restrictions",
      },
      smell: {
        primary: "Zone-specific scent signatures that trigger memory and emotion",
        secondary: [
          "Personal scent tokens as takeaways",
          "Scent-triggered narrative reveals",
          "Aromatherapy integration for calm zones",
        ],
        technicalRequirements: ["HVAC scent diffusion", "Scent cartridge system", "Air purification"],
        accessibility: "Scent-free zones available, advance notice of scent elements",
      },
    },
    
    spatialTemporal: {
      x: {
        level: 3,
        description: "Regional (100-1,000 guests)",
        rationale: "Optimal scale for intimate transformation while achieving economic viability",
      },
      y: {
        level: 2,
        description: "Venue (Single building)",
        rationale: "Contained environment allows full sensory control and narrative immersion",
      },
      z: {
        level: 2,
        description: "Session (1-4 hours)",
        rationale: "Sufficient time for deep engagement without fatigue, enabling multiple sessions daily",
      },
      zones: [
        { name: "The Threshold", code: "THR", type: "public", description: "Entry and orientation", capacity: 50, accessLevel: 1 },
        { name: "The Descent", code: "DSC", type: "public", description: "Initial immersion", capacity: 100, accessLevel: 1 },
        { name: "The Core", code: "COR", type: "public", description: "Peak experience zone", capacity: 80, accessLevel: 1 },
        { name: "The Reflection", code: "REF", type: "public", description: "Integration space", capacity: 60, accessLevel: 1 },
        { name: "The Return", code: "RET", type: "public", description: "Exit and retail", capacity: 40, accessLevel: 1 },
        { name: "VIP Sanctum", code: "VIP", type: "vip", description: "Premium experience", capacity: 20, accessLevel: 2 },
        { name: "Production Hub", code: "PROD", type: "production", description: "Technical operations", capacity: 15, accessLevel: 4 },
        { name: "Green Room", code: "GRN", type: "backstage", description: "Performer prep", capacity: 10, accessLevel: 3 },
      ],
    },
    
    guestJourney: {
      phase1_digital_pre: {
        name: "Digital Pre-Event",
        touchpoints: [
          "Discovery through social media teasers",
          "Website with interactive preview",
          "Ticket purchase with time slot selection",
          "Pre-event emails with preparation rituals",
        ],
        emotionalState: "Curiosity building to anticipation",
        actions: ["Explore", "Purchase", "Prepare", "Share excitement"],
        technology: ["Website", "Email automation", "Social media", "Mobile app"],
      },
      phase2_threshold_in: {
        name: "Hybrid Threshold In",
        touchpoints: [
          "Arrival at venue with wayfinding",
          "Check-in and wearable distribution",
          "Orientation briefing",
          "Transition ritual into experience",
        ],
        emotionalState: "Anticipation shifting to immersion",
        actions: ["Arrive", "Check-in", "Prepare mentally", "Cross threshold"],
        technology: ["QR check-in", "RFID wearables", "Digital signage", "Audio guides"],
      },
      phase3_physical: {
        name: "Physical Event",
        touchpoints: [
          "Zone-by-zone progression",
          "Interactive installations",
          "Performer encounters",
          "Peak moment experience",
          "Sensory activations",
        ],
        emotionalState: "Wonder, challenge, breakthrough, euphoria",
        actions: ["Explore", "Interact", "Transform", "Connect"],
        technology: ["Motion tracking", "Spatial audio", "Haptic feedback", "Real-time lighting"],
      },
      phase4_threshold_out: {
        name: "Hybrid Threshold Out",
        touchpoints: [
          "Decompression zone",
          "Reflection prompts",
          "Photo opportunity",
          "Retail experience",
          "Exit survey",
        ],
        emotionalState: "Integration and grounding",
        actions: ["Reflect", "Capture", "Purchase", "Share"],
        technology: ["Photo booths", "Digital surveys", "POS systems", "Social sharing"],
      },
      phase5_digital_post: {
        name: "Digital Post-Event",
        touchpoints: [
          "Thank you email with photos",
          "Community invitation",
          "Exclusive content unlock",
          "Referral program",
          "Anniversary reminders",
        ],
        emotionalState: "Nostalgia and advocacy",
        actions: ["Remember", "Share", "Return", "Advocate"],
        technology: ["Email automation", "Community platform", "Content delivery", "CRM"],
      },
    },
    
    documents: {
      onePageOverview: `${seed}: THE BECOMING is a transformative immersive experience running [DATES] at [VENUE]. With a capacity of 500 guests per day across 5 sessions, the experience offers a 2-hour journey through 8 distinct zones. Production budget: $500K. Projected gross: $1.2M. Target audience: Experience seekers aged 25-45 seeking meaningful entertainment.`,
      orgChartPreview: [
        { title: "Executive Producer", tier: 1, department: "Executive" },
        { title: "Creative Director", tier: 2, department: "Creative" },
        { title: "Production Manager", tier: 2, department: "Production" },
        { title: "Technical Director", tier: 2, department: "Technical" },
        { title: "Operations Director", tier: 2, department: "Operations" },
        { title: "Marketing Director", tier: 2, department: "Marketing" },
        { title: "Stage Manager", tier: 3, department: "Production" },
        { title: "Lead Designer", tier: 3, department: "Creative" },
        { title: "Guest Experience Lead", tier: 3, department: "Operations" },
        { title: "Safety Coordinator", tier: 3, department: "Operations" },
      ],
      schedulePhases: [
        { name: "Development", code: "DEV", duration: "12 weeks", description: "Concept refinement and design" },
        { name: "Pre-Production", code: "PRE", duration: "8 weeks", description: "Vendor selection and planning" },
        { name: "Build", code: "BLD", duration: "4 weeks", description: "Physical construction" },
        { name: "Tech", code: "TCH", duration: "2 weeks", description: "Technical integration" },
        { name: "Rehearsal", code: "REH", duration: "1 week", description: "Run-throughs and refinement" },
        { name: "Preview", code: "PRV", duration: "1 week", description: "Soft opening" },
        { name: "Run", code: "RUN", duration: "12 weeks", description: "Public performances" },
        { name: "Strike", code: "STR", duration: "1 week", description: "Load-out and wrap" },
      ],
      credentialTypes: [
        { name: "All Access", code: "AA", accessLevel: 10, color: "#FF006E" },
        { name: "Production", code: "PROD", accessLevel: 8, color: "#9B5DE5" },
        { name: "Technical", code: "TECH", accessLevel: 7, color: "#00F5D4" },
        { name: "Performer", code: "PERF", accessLevel: 6, color: "#FEE440" },
        { name: "Operations", code: "OPS", accessLevel: 5, color: "#00BBF9" },
        { name: "Guest Services", code: "GS", accessLevel: 3, color: "#F15BB5" },
        { name: "Vendor", code: "VND", accessLevel: 2, color: "#9B9B9B" },
        { name: "VIP Guest", code: "VIP", accessLevel: 2, color: "#FFD700" },
        { name: "Media", code: "MED", accessLevel: 2, color: "#FF6B6B" },
        { name: "General", code: "GEN", accessLevel: 1, color: "#FFFFFF" },
      ],
      complianceChecklist: [
        { category: "Permits", item: "Event permit from city", required: true },
        { category: "Permits", item: "Fire marshal approval", required: true },
        { category: "Permits", item: "Liquor license (if applicable)", required: false },
        { category: "Insurance", item: "General liability ($2M)", required: true },
        { category: "Insurance", item: "Workers compensation", required: true },
        { category: "Safety", item: "Emergency action plan", required: true },
        { category: "Safety", item: "ADA compliance audit", required: true },
        { category: "Employment", item: "Background checks for staff", required: true },
        { category: "Privacy", item: "Photo/video release forms", required: true },
      ],
    },
    
    executionTiers: {
      tier1_minimal: {
        name: "Minimum Viable",
        budget: "$150,000",
        description: "Core experience with essential elements",
        includes: ["Basic lighting", "Sound system", "3 zones", "20 staff"],
        excludes: ["Live performers", "Custom scenting", "Haptic technology"],
      },
      tier2_enhanced: {
        name: "Enhanced",
        budget: "$350,000",
        description: "Full sensory experience with live elements",
        includes: ["Projection mapping", "Spatial audio", "5 zones", "Live performers", "40 staff"],
        excludes: ["Custom wearables", "AI integration"],
      },
      tier3_premium: {
        name: "Premium",
        budget: "$750,000",
        description: "Complete immersive production",
        includes: ["All senses activated", "8 zones", "Full performer cast", "Custom technology", "60 staff"],
        excludes: ["Permanent installation elements"],
      },
      tier4_ultimate: {
        name: "Ultimate Expression",
        budget: "$1,500,000+",
        description: "No compromises, full vision realized",
        includes: ["Everything in Premium", "Custom-built venue elements", "Extended run capability", "100+ staff"],
        excludes: [],
      },
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { creativeSeed } = body;

    if (!creativeSeed || typeof creativeSeed !== "string") {
      return NextResponse.json(
        { error: "Creative seed is required" },
        { status: 400 }
      );
    }

    if (creativeSeed.length > 50) {
      return NextResponse.json(
        { error: "Creative seed must be 50 characters or less" },
        { status: 400 }
      );
    }

    // TODO: Replace with actual AI generation using OpenAI/Anthropic
    // For MVP, we use mock data
    const blueprint = generateMockBlueprint(creativeSeed);

    // TODO: Store blueprint in database for retrieval
    // await supabase.from('generated_blueprints').insert(blueprint);

    return NextResponse.json({ blueprint });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate blueprint" },
      { status: 500 }
    );
  }
}
