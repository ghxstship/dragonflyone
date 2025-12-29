import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const guestCount = parseInt(searchParams.get('guest_count') || '0');
    const eventType = searchParams.get('event_type');
    const date = searchParams.get('date');
    const venueId = searchParams.get('venue_id');
    const layoutType = searchParams.get('layout_type');
    const maxPrice = searchParams.get('max_price');

    if (!guestCount || guestCount <= 0) {
      return NextResponse.json(
        { error: 'guest_count is required and must be positive' },
        { status: 400 }
      );
    }

    // Get all active spaces with their capacity configs
    let spacesQuery = supabase
      .from('spaces')
      .select(`
        id,
        name,
        description,
        venue_id,
        venue:venues(id, name),
        capacity,
        photos,
        amenities,
        base_pricing,
        is_active
      `)
      .eq('is_active', true);

    if (venueId) {
      spacesQuery = spacesQuery.eq('venue_id', venueId);
    }

    const { data: spaces, error: spacesError } = await spacesQuery;

    if (spacesError) {
      return NextResponse.json(
        { error: 'Failed to fetch spaces' },
        { status: 500 }
      );
    }

    // Get capacity configs for all spaces
    const spaceIds = spaces?.map(s => s.id) || [];
    const { data: capacityConfigs } = await supabase
      .from('space_capacity_configs')
      .select('*')
      .in('space_id', spaceIds);

    // Get pricing rules
    const { data: pricingRules } = await supabase
      .from('space_pricing_rules')
      .select('*')
      .in('space_id', spaceIds)
      .eq('is_active', true);

    // Check availability if date provided
    let bookedSpaceIds: string[] = [];
    if (date) {
      const { data: bookings } = await supabase
        .from('booking_spaces')
        .select('space_id, booking:bookings(event_date, status)')
        .eq('booking.event_date', date)
        .neq('booking.status', 'cancelled');

      bookedSpaceIds = bookings?.map(b => b.space_id) || [];
    }

    // Score and rank spaces
    const recommendations = spaces?.map(space => {
      const spaceConfigs = capacityConfigs?.filter(c => c.space_id === space.id) || [];
      const spacePricing = pricingRules?.filter(p => p.space_id === space.id) || [];
      
      // Find best layout for guest count
      let bestConfig = spaceConfigs.find(c => 
        c.capacity >= guestCount && 
        (!layoutType || c.layout_type === layoutType)
      );
      
      if (!bestConfig && spaceConfigs.length > 0) {
        bestConfig = spaceConfigs.reduce((best, current) => 
          current.capacity > best.capacity ? current : best
        );
      }

      // Calculate fit score (how well the capacity matches)
      const effectiveCapacity = bestConfig?.capacity || space.capacity || 0;
      const utilizationRatio = effectiveCapacity > 0 ? guestCount / effectiveCapacity : 0;
      
      // Ideal is 70-90% utilization
      let fitScore = 0;
      if (utilizationRatio >= 0.7 && utilizationRatio <= 0.9) {
        fitScore = 100;
      } else if (utilizationRatio >= 0.5 && utilizationRatio < 0.7) {
        fitScore = 80;
      } else if (utilizationRatio > 0.9 && utilizationRatio <= 1.0) {
        fitScore = 70;
      } else if (utilizationRatio > 1.0) {
        fitScore = 0; // Over capacity
      } else {
        fitScore = Math.max(0, 60 - (0.5 - utilizationRatio) * 100);
      }

      // Get base price
      const baseRule = spacePricing.find(p => p.rule_type === 'base');
      const estimatedPrice = baseRule?.price || 
        (space.base_pricing as { daily?: number })?.daily || 0;

      // Check availability
      const isAvailable = !bookedSpaceIds.includes(space.id);

      // Check price constraint
      const meetsPrice = !maxPrice || estimatedPrice <= parseFloat(maxPrice);

      // Final score
      let overallScore = fitScore;
      if (!isAvailable) overallScore = 0;
      if (!meetsPrice) overallScore *= 0.5;
      if (effectiveCapacity < guestCount) overallScore = 0;

      return {
        space: {
          id: space.id,
          name: space.name,
          venue: space.venue,
          capacity: effectiveCapacity,
          photos: space.photos,
          amenities: space.amenities,
        },
        recommendation: {
          fit_score: Math.round(fitScore),
          overall_score: Math.round(overallScore),
          utilization: Math.round(utilizationRatio * 100),
          is_available: isAvailable,
          estimated_price: estimatedPrice,
          recommended_layout: bestConfig?.layout_name || 'Default',
          layout_type: bestConfig?.layout_type || null,
        },
        reasons: generateReasons(fitScore, utilizationRatio, isAvailable, effectiveCapacity, guestCount),
      };
    }) || [];

    // Sort by overall score
    const sortedRecommendations = recommendations
      .filter(r => r.recommendation.overall_score > 0)
      .sort((a, b) => b.recommendation.overall_score - a.recommendation.overall_score);

    return NextResponse.json({
      recommendations: sortedRecommendations,
      query: {
        guest_count: guestCount,
        event_type: eventType,
        date,
        venue_id: venueId,
        layout_type: layoutType,
        max_price: maxPrice,
      },
      total_spaces: spaces?.length || 0,
      matching_spaces: sortedRecommendations.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateReasons(
  fitScore: number,
  utilizationRatio: number,
  isAvailable: boolean,
  capacity: number,
  guestCount: number
): string[] {
  const reasons: string[] = [];

  if (!isAvailable) {
    reasons.push('Space is not available on the selected date');
  }

  if (capacity < guestCount) {
    reasons.push(`Capacity (${capacity}) is less than required guests (${guestCount})`);
  } else if (fitScore >= 90) {
    reasons.push('Excellent fit for your guest count');
  } else if (fitScore >= 70) {
    reasons.push('Good fit with room to spare');
  } else if (utilizationRatio < 0.5) {
    reasons.push('Space may be larger than needed');
  }

  if (utilizationRatio >= 0.7 && utilizationRatio <= 0.9) {
    reasons.push('Optimal space utilization');
  }

  return reasons;
}
