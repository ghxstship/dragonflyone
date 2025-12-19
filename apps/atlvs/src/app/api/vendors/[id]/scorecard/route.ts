import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const scorecardSchema = z.object({
  quality_score: z.number().min(0).max(100),
  delivery_score: z.number().min(0).max(100),
  communication_score: z.number().min(0).max(100),
  pricing_score: z.number().min(0).max(100),
  notes: z.string().optional(),
  evaluated_by: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const vendorId = params.id;

    // Get vendor scorecards
    const { data: scorecards, error: scorecardsError } = await supabase
      .from('vendor_scorecards')
      .select('*')
      .eq('vendor_profile_id', vendorId)
      .order('evaluation_date', { ascending: false });

    if (scorecardsError) {
      return NextResponse.json(
        { error: 'Failed to fetch scorecards' },
        { status: 500 }
      );
    }

    // Calculate averages
    const latestScorecard = scorecards?.[0];
    const allScores = scorecards || [];
    
    const calculateAverage = (field: string) => {
      const values = allScores
        .map(s => s[field])
        .filter(v => typeof v === 'number');
      return values.length > 0 
        ? values.reduce((a, b) => a + b, 0) / values.length 
        : null;
    };

    const averages = {
      quality: calculateAverage('quality_score'),
      delivery: calculateAverage('delivery_score'),
      communication: calculateAverage('communication_score'),
      pricing: calculateAverage('pricing_score'),
    };

    const overallAverage = Object.values(averages)
      .filter(v => v !== null)
      .reduce((sum, v) => sum + (v || 0), 0) / 4;

    return NextResponse.json({
      latest: latestScorecard || null,
      history: scorecards || [],
      averages,
      overall_score: parseFloat(overallAverage.toFixed(1)),
      evaluation_count: allScores.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const vendorId = params.id;

    const body = await request.json();
    const validatedData = scorecardSchema.parse(body);

    // Check if vendor exists
    const { data: vendor, error: vendorError } = await supabase
      .from('vendor_profiles')
      .select('id')
      .eq('id', vendorId)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Calculate overall score
    const overallScore = (
      validatedData.quality_score +
      validatedData.delivery_score +
      validatedData.communication_score +
      validatedData.pricing_score
    ) / 4;

    // Create scorecard
    const { data: scorecard, error: scorecardError } = await supabase
      .from('vendor_scorecards')
      .insert({
        vendor_profile_id: vendorId,
        quality_score: validatedData.quality_score,
        delivery_score: validatedData.delivery_score,
        communication_score: validatedData.communication_score,
        pricing_score: validatedData.pricing_score,
        overall_score: overallScore,
        notes: validatedData.notes || null,
        evaluated_by: validatedData.evaluated_by || null,
        evaluation_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (scorecardError) {
      return NextResponse.json(
        { error: 'Failed to create scorecard' },
        { status: 500 }
      );
    }

    // Update vendor's overall rating
    await supabase
      .from('vendor_profiles')
      .update({
        rating: overallScore / 20, // Convert 0-100 to 0-5 scale
        updated_at: new Date().toISOString(),
      })
      .eq('id', vendorId);

    return NextResponse.json({
      success: true,
      scorecard,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
