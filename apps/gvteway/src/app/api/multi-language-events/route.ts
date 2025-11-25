import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Multi-language event information
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const language = searchParams.get('language') || 'en';

    if (!eventId) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

    const { data, error } = await supabase.from('event_translations').select('*')
      .eq('event_id', eventId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Get specific language or default
    const translation = data?.find(t => t.language === language) || data?.find(t => t.language === 'en');
    const availableLanguages = data?.map(t => t.language) || [];

    return NextResponse.json({
      translation,
      available_languages: availableLanguages,
      all_translations: data
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { event_id, language, title, description, venue_info, accessibility_info, policies } = body;

    const { data, error } = await supabase.from('event_translations').upsert({
      event_id, language, title, description, venue_info,
      accessibility_info, policies, updated_by: user.id,
      updated_at: new Date().toISOString()
    }, { onConflict: 'event_id,language' }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ translation: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
