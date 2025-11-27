import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

// Dietary restriction and allergy notifications
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    // Get user's dietary preferences
    const { data: preferences } = await supabase.from('user_dietary_preferences').select('*')
      .eq('user_id', user.id).single();

    if (eventId) {
      // Get venue food options matching preferences
      const { data: foodOptions } = await supabase.from('venue_food_options').select('*')
        .eq('event_id', eventId);

      const safeOptions = foodOptions?.filter(opt => {
        const userRestrictions = preferences?.restrictions || [];
        return !userRestrictions.some((r: string) => opt.allergens?.includes(r));
      }) || [];

      return NextResponse.json({
        preferences,
        food_options: foodOptions,
        safe_options: safeOptions,
        warnings: generateWarnings(preferences, foodOptions || [])
      });
    }

    return NextResponse.json({ preferences });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dietary info' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { restrictions, allergies, preferences, severity_levels, emergency_contact } = body;

    const { data, error } = await supabase.from('user_dietary_preferences').upsert({
      user_id: user.id,
      restrictions: restrictions || [],
      allergies: allergies || [],
      preferences: preferences || [],
      severity_levels: severity_levels || {},
      emergency_contact,
      updated_at: new Date().toISOString()
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ preferences: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
}

function generateWarnings(preferences: any, foodOptions: any[]): string[] {
  const warnings: string[] = [];
  const userAllergens = [...(preferences?.restrictions || []), ...(preferences?.allergies || [])];

  foodOptions.forEach(opt => {
    const matches = opt.allergens?.filter((a: string) => userAllergens.includes(a)) || [];
    if (matches.length > 0) {
      warnings.push(`${opt.name} contains: ${matches.join(', ')}`);
    }
  });

  return warnings;
}
