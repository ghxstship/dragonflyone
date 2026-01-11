/**
 * Experience with White-Label API
 * GET /api/experiences/[id]/whitelabel
 * Returns experience data with organizer's white-label configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: experienceId } = params;

    // Create Supabase client
    const supabase = createClient();

    // Fetch experience with all related data
    const { data: experience, error: expError } = await supabase
      .from('experiences')
      .select(
        `
        *,
        category:experience_categories(*),
        status:experience_statuses(*),
        organization:organizations(*),
        itinerary:experience_itinerary(*, activities),
        faqs:experience_faqs(*),
        availability:experience_availability(*),
        addons:experience_addons(*),
        reviews:experience_reviews(
          *,
          author:legend_people(id, name, avatar)
        )
      `
      )
      .eq('id', experienceId)
      .single();

    if (expError || !experience) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }

    // Fetch white-label configuration
    const { data: whitelabelConfig } = await supabase
      .from('whitelabel_configs')
      .select('*')
      .eq('organization_id', experience.organization_id)
      .eq('is_active', true)
      .single();

    // Calculate rating statistics
    const { data: ratingStats } = await supabase.rpc(
      'calculate_experience_rating',
      { exp_id: experienceId }
    );

    // Calculate availability summary
    const { data: availabilitySummary } = await supabase.rpc(
      'get_experience_availability_summary',
      { exp_id: experienceId }
    );

    // Transform database record to API response
    const response = {
      experience: {
        id: experience.id,
        organizerId: experience.organization_id,
        organizer: {
          id: experience.organization.id,
          name: experience.organization.name,
          slug: experience.organization.slug,
          avatar: experience.organization.logo_url,
          bio: experience.organization.description,
          stats: {
            eventsHosted: experience.organization.events_count || 0,
            rating: experience.organization.rating || 0,
            responseRate: experience.organization.response_rate || 0,
            responseTime: experience.organization.response_time || 'N/A',
            memberSince: experience.organization.created_at,
          },
        },
        title: experience.title,
        slug: experience.slug,
        description: experience.description,
        category: experience.category.name,
        location: {
          city: experience.city,
          state: experience.state,
          country: experience.country,
          coordinates: experience.coordinates,
        },
        venue: experience.venue_name
          ? {
              name: experience.venue_name,
              address: experience.venue_address,
              description: experience.venue_description,
            }
          : null,
        media: experience.media || [],
        pricing: {
          basePrice: parseFloat(experience.base_price),
          currency: experience.currency,
          startingPrice: experience.starting_price
            ? parseFloat(experience.starting_price)
            : parseFloat(experience.base_price),
        },
        availability: {
          dates:
            experience.availability?.map((a: any) => ({
              id: a.id,
              startDate: a.start_date,
              endDate: a.end_date,
              spotsAvailable: a.available_spots,
              price: a.price_override
                ? parseFloat(a.price_override)
                : parseFloat(experience.base_price),
              status: a.status,
            })) || [],
          spotsLeft: availabilitySummary?.[0]?.spots_available || 0,
          totalSpots: availabilitySummary?.[0]?.total_spots || 0,
        },
        duration: experience.duration_days,
        groupSize: {
          min: experience.min_group_size,
          max: experience.max_group_size,
        },
        inclusions: experience.inclusions,
        itinerary:
          experience.itinerary?.map((day: any) => ({
            id: day.id,
            dayNumber: day.day_number,
            title: day.title,
            description: day.description,
            activities: day.activities || [],
          })) || [],
        highlights: experience.highlights || [],
        faq:
          experience.faqs?.map((faq: any) => ({
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            order: faq.sort_order,
          })) || [],
        cancellationPolicy: {
          type: experience.cancellation_policy_type,
          description: experience.cancellation_policy_json?.description || '',
          timeline: experience.cancellation_policy_json?.timeline || [],
        },
        rating: {
          average: ratingStats?.[0]?.average_rating || 0,
          count: ratingStats?.[0]?.total_reviews || 0,
          breakdown: ratingStats?.[0]?.rating_breakdown || {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
          },
        },
        reviews:
          experience.reviews?.map((review: any) => ({
            id: review.id,
            author: {
              id: review.author.id,
              name: review.author.name,
              avatar: review.author.avatar,
            },
            rating: review.rating,
            content: review.content,
            date: review.created_at,
            images: review.images || [],
            response: review.response,
            helpful: review.helpful_count,
            verified: review.is_verified,
          })) || [],
        addOns:
          experience.addons
            ?.filter((addon: any) => addon.is_active)
            .map((addon: any) => ({
              id: addon.id,
              name: addon.name,
              description: addon.description,
              price: parseFloat(addon.price),
              required: addon.is_required,
              maxQuantity: addon.max_quantity,
            })) || [],
        status: experience.status.code,
        createdAt: experience.created_at,
        updatedAt: experience.updated_at,
      },
      whitelabel: whitelabelConfig
        ? {
            organizerId: whitelabelConfig.organization_id,
            branding: {
              logo: whitelabelConfig.logo_url || '',
              colors: {
                primary: whitelabelConfig.primary_color,
                secondary: whitelabelConfig.secondary_color,
                accent: whitelabelConfig.accent_color,
              },
              typography: {
                displayFont: whitelabelConfig.display_font,
                bodyFont: whitelabelConfig.body_font,
              },
              customDomain: whitelabelConfig.custom_domain,
            },
            features: whitelabelConfig.features,
            content: whitelabelConfig.content,
          }
        : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching experience with whitelabel:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experience' },
      { status: 500 }
    );
  }
}
