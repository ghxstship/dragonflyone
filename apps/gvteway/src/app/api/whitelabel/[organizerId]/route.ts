/**
 * White-Label Configuration API
 * GET /api/whitelabel/[organizerId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { organizerId: string } }
) {
  try {
    const { organizerId } = params;

    // Create Supabase client
    const supabase = createClient();

    // Fetch white-label configuration
    const { data: config, error } = await supabase
      .from('whitelabel_configs')
      .select('*')
      .eq('organization_id', organizerId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      throw error;
    }

    // If no config found, return default configuration
    if (!config) {
      return NextResponse.json({
        organizerId,
        branding: {
          logo: '',
          colors: {
            primary: '#7B68EE',
          },
          typography: {},
        },
        features: {
          bookingEnabled: true,
          reviewsEnabled: true,
          socialSharingEnabled: true,
          chatEnabled: false,
        },
        content: {
          customNavLinks: [],
          footerContent: '',
          legalLinks: [],
        },
      });
    }

    // Transform database record to API response
    const response = {
      organizerId: config.organization_id,
      branding: {
        logo: config.logo_url || '',
        colors: {
          primary: config.primary_color,
          secondary: config.secondary_color,
          accent: config.accent_color,
        },
        typography: {
          displayFont: config.display_font,
          bodyFont: config.body_font,
        },
        customDomain: config.custom_domain,
      },
      features: config.features,
      content: config.content,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching white-label config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch white-label configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { organizerId: string } }
) {
  try {
    const { organizerId } = params;
    const body = await request.json();

    // Create Supabase client
    const supabase = createClient();

    // Verify user has permission to update this organization's config
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Transform API request to database record
    const updates = {
      organization_id: organizerId,
      logo_url: body.branding?.logo,
      primary_color: body.branding?.colors?.primary,
      secondary_color: body.branding?.colors?.secondary,
      accent_color: body.branding?.colors?.accent,
      display_font: body.branding?.typography?.displayFont,
      body_font: body.branding?.typography?.bodyFont,
      custom_domain: body.branding?.customDomain,
      features: body.features,
      content: body.content,
    };

    // Upsert configuration
    const { data: config, error } = await supabase
      .from('whitelabel_configs')
      .upsert(updates, {
        onConflict: 'organization_id',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Transform response
    const response = {
      organizerId: config.organization_id,
      branding: {
        logo: config.logo_url || '',
        colors: {
          primary: config.primary_color,
          secondary: config.secondary_color,
          accent: config.accent_color,
        },
        typography: {
          displayFont: config.display_font,
          bodyFont: config.body_font,
        },
        customDomain: config.custom_domain,
      },
      features: config.features,
      content: config.content,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating white-label config:', error);
    return NextResponse.json(
      { error: 'Failed to update white-label configuration' },
      { status: 500 }
    );
  }
}
