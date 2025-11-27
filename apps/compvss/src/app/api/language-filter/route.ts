import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const LanguageProfileSchema = z.object({
  user_id: z.string().uuid().optional(),
  languages: z.array(z.object({
    code: z.string().length(2),
    name: z.string(),
    proficiency: z.enum(['native', 'fluent', 'conversational', 'basic']),
    is_primary: z.boolean().default(false),
  })),
  specialties: z.array(z.string()).optional(),
});

// GET /api/language-filter - Search by language and specialty
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const languages = searchParams.get('languages')?.split(',');
    const specialties = searchParams.get('specialties')?.split(',');
    const proficiency = searchParams.get('proficiency');
    const entityType = searchParams.get('entity_type') || 'crew';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get all language profiles
    let query = supabase
      .from('language_profiles')
      .select(`
        *,
        user:platform_users(id, first_name, last_name, email, avatar_url)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1);

    const { data: profiles, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter by languages
    let filteredProfiles = profiles || [];
    
    if (languages && languages.length > 0) {
      filteredProfiles = filteredProfiles.filter(p => {
        const userLanguages = p.languages || [];
        return languages.some(lang => 
          userLanguages.some((ul: any) => ul.code === lang)
        );
      });
    }

    // Filter by proficiency
    if (proficiency) {
      const proficiencyLevels = ['basic', 'conversational', 'fluent', 'native'];
      const minIndex = proficiencyLevels.indexOf(proficiency);
      
      filteredProfiles = filteredProfiles.filter(p => {
        const userLanguages = p.languages || [];
        return userLanguages.some((ul: any) => {
          const ulIndex = proficiencyLevels.indexOf(ul.proficiency);
          return ulIndex >= minIndex;
        });
      });
    }

    // Filter by specialties
    if (specialties && specialties.length > 0) {
      filteredProfiles = filteredProfiles.filter(p => {
        const userSpecialties = p.specialties || [];
        return specialties.some(spec => userSpecialties.includes(spec));
      });
    }

    // Get available languages for filtering
    const allLanguages = new Set<string>();
    profiles?.forEach(p => {
      (p.languages || []).forEach((l: any) => allLanguages.add(l.code));
    });

    // Get available specialties
    const allSpecialties = new Set<string>();
    profiles?.forEach(p => {
      (p.specialties || []).forEach((s: string) => allSpecialties.add(s));
    });

    // Common languages list
    const commonLanguages = [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'ar', name: 'Arabic' },
      { code: 'ru', name: 'Russian' },
      { code: 'hi', name: 'Hindi' },
    ];

    return NextResponse.json({
      profiles: filteredProfiles,
      total: filteredProfiles.length,
      filters: {
        available_languages: Array.from(allLanguages),
        available_specialties: Array.from(allSpecialties),
        common_languages: commonLanguages,
        proficiency_levels: ['basic', 'conversational', 'fluent', 'native'],
      },
      limit,
      offset,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch language data' }, { status: 500 });
  }
}

// POST /api/language-filter - Create or update language profile
export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = LanguageProfileSchema.parse(body);

    const userId = validated.user_id || user.id;

    // Check for existing profile
    const { data: existing } = await supabase
      .from('language_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Update existing
      const { data: profile, error } = await supabase
        .from('language_profiles')
        .update({
          languages: validated.languages,
          specialties: validated.specialties,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ profile, updated: true });
    } else {
      // Create new
      const { data: profile, error } = await supabase
        .from('language_profiles')
        .insert({
          user_id: userId,
          languages: validated.languages,
          specialties: validated.specialties,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ profile }, { status: 201 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to save language profile' }, { status: 500 });
  }
}
