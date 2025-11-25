import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search_type = searchParams.get('type') || 'crew'; // crew, vendor, all
    const query_text = searchParams.get('q');
    const languages = searchParams.get('languages')?.split(',').filter(Boolean);
    const specialties = searchParams.get('specialties')?.split(',').filter(Boolean);
    const experience_level = searchParams.get('experience_level');
    const proficiency_level = searchParams.get('proficiency_level');
    const location = searchParams.get('location');
    const available_from = searchParams.get('available_from');
    const available_to = searchParams.get('available_to');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const results: { crew?: unknown[]; vendors?: unknown[] } = {};

    // Search crew/users
    if (search_type === 'crew' || search_type === 'all') {
      let crewQuery = supabase
        .from('platform_users')
        .select(`
          id, email, full_name, avatar_url, phone, location, bio,
          languages:user_languages(
            language:languages(id, code, name),
            proficiency_level, can_translate, can_interpret
          ),
          specialties:user_specialties(
            specialty:specialties(id, name, code, category:specialty_categories(name)),
            experience_level, years_experience, verified
          )
        `, { count: 'exact' });

      // Text search
      if (query_text) {
        crewQuery = crewQuery.or(`full_name.ilike.%${query_text}%,email.ilike.%${query_text}%`);
      }

      // Location filter
      if (location) {
        crewQuery = crewQuery.ilike('location', `%${location}%`);
      }

      const { data: crewData, error: crewError, count: crewCount } = await crewQuery
        .range(offset, offset + limit - 1);

      if (crewError) throw crewError;

      // Filter by languages and specialties in memory (complex joins)
      let filteredCrew = crewData || [];

      if (languages && languages.length > 0) {
        filteredCrew = filteredCrew.filter((user: Record<string, unknown>) => {
          const userLangs = user.languages as Array<{ language: { code: string }; proficiency_level: string }> || [];
          return languages.some(langCode => 
            userLangs.some(ul => 
              ul.language?.code === langCode &&
              (!proficiency_level || ul.proficiency_level === proficiency_level)
            )
          );
        });
      }

      if (specialties && specialties.length > 0) {
        filteredCrew = filteredCrew.filter((user: Record<string, unknown>) => {
          const userSpecs = user.specialties as Array<{ specialty: { code: string }; experience_level: string }> || [];
          return specialties.some(specCode =>
            userSpecs.some(us =>
              us.specialty?.code === specCode &&
              (!experience_level || us.experience_level === experience_level)
            )
          );
        });
      }

      results.crew = filteredCrew;
    }

    // Search vendors
    if (search_type === 'vendor' || search_type === 'all') {
      let vendorQuery = supabase
        .from('vendors')
        .select(`
          id, name, contact_email, phone, address, city, state, country, website,
          languages:vendor_languages(
            language:languages(id, code, name),
            service_available
          ),
          specialties:vendor_specialties(
            specialty:specialties(id, name, code, category:specialty_categories(name)),
            service_description, is_primary
          )
        `, { count: 'exact' })
        .eq('is_active', true);

      // Text search
      if (query_text) {
        vendorQuery = vendorQuery.or(`name.ilike.%${query_text}%,contact_email.ilike.%${query_text}%`);
      }

      // Location filter
      if (location) {
        vendorQuery = vendorQuery.or(`city.ilike.%${location}%,state.ilike.%${location}%,country.ilike.%${location}%`);
      }

      const { data: vendorData, error: vendorError } = await vendorQuery
        .range(offset, offset + limit - 1);

      if (vendorError) throw vendorError;

      // Filter by languages and specialties
      let filteredVendors = vendorData || [];

      if (languages && languages.length > 0) {
        filteredVendors = filteredVendors.filter((vendor: Record<string, unknown>) => {
          const vendorLangs = vendor.languages as Array<{ language: { code: string }; service_available: boolean }> || [];
          return languages.some(langCode =>
            vendorLangs.some(vl => vl.language?.code === langCode && vl.service_available)
          );
        });
      }

      if (specialties && specialties.length > 0) {
        filteredVendors = filteredVendors.filter((vendor: Record<string, unknown>) => {
          const vendorSpecs = vendor.specialties as Array<{ specialty: { code: string } }> || [];
          return specialties.some(specCode =>
            vendorSpecs.some(vs => vs.specialty?.code === specCode)
          );
        });
      }

      results.vendors = filteredVendors;
    }

    return NextResponse.json({
      data: results,
      filters: {
        languages,
        specialties,
        experience_level,
        proficiency_level,
        location,
      },
      pagination: {
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error searching directory:', error);
    return NextResponse.json(
      { error: 'Failed to search directory' },
      { status: 500 }
    );
  }
}
