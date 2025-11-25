import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch interactive venue map data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: venue, error } = await supabase
      .from('venues')
      .select(`
        id,
        name,
        address,
        city,
        state,
        zip,
        latitude,
        longitude,
        capacity,
        venue_maps:venue_map_data(*)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch sections and amenities
    const { data: sections } = await supabase
      .from('venue_sections')
      .select('*')
      .eq('venue_id', params.id);

    const { data: amenities } = await supabase
      .from('venue_amenities')
      .select('*')
      .eq('venue_id', params.id);

    // Fetch parking info
    const { data: parking } = await supabase
      .from('venue_parking')
      .select('*')
      .eq('venue_id', params.id);

    return NextResponse.json({
      venue,
      map_data: venue.venue_maps?.[0] || null,
      sections: sections || [],
      amenities: amenities || [],
      parking: parking || [],
      features: {
        has_360_view: !!venue.venue_maps?.[0]?.panorama_url,
        has_interactive_map: !!venue.venue_maps?.[0]?.svg_map,
        has_ar_preview: !!venue.venue_maps?.[0]?.ar_enabled,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch venue map' },
      { status: 500 }
    );
  }
}

// POST - Upload venue map data (admin)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      svg_map,
      floor_plan_url,
      panorama_url,
      sections,
      amenity_locations,
      ar_enabled,
    } = body;

    const { data, error } = await supabase
      .from('venue_map_data')
      .upsert({
        venue_id: params.id,
        svg_map,
        floor_plan_url,
        panorama_url,
        ar_enabled: ar_enabled || false,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update sections if provided
    if (sections && sections.length > 0) {
      await supabase
        .from('venue_sections')
        .delete()
        .eq('venue_id', params.id);

      await supabase.from('venue_sections').insert(
        sections.map((s: any) => ({
          venue_id: params.id,
          ...s,
        }))
      );
    }

    // Update amenity locations if provided
    if (amenity_locations && amenity_locations.length > 0) {
      await supabase
        .from('venue_amenities')
        .delete()
        .eq('venue_id', params.id);

      await supabase.from('venue_amenities').insert(
        amenity_locations.map((a: any) => ({
          venue_id: params.id,
          ...a,
        }))
      );
    }

    return NextResponse.json({ map_data: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update venue map' },
      { status: 500 }
    );
  }
}
