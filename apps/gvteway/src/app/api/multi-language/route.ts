import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const supportedLanguages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'zh', name: 'Chinese', native: '中文' },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const lang = searchParams.get('lang') || 'en';
    const eventId = searchParams.get('event_id');

    if (type === 'languages') {
      return NextResponse.json({ languages: supportedLanguages });
    }

    if (type === 'translations' && eventId) {
      const { data: translations, error } = await supabase
        .from('event_translations')
        .select('*')
        .eq('event_id', eventId)
        .eq('language_code', lang)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return NextResponse.json({ translations });
    }

    if (type === 'ui_strings') {
      const { data: strings, error } = await supabase
        .from('ui_translations')
        .select('key, value')
        .eq('language_code', lang);

      if (error) throw error;

      const stringMap = strings?.reduce((acc: Record<string, string>, s) => {
        acc[s.key] = s.value;
        return acc;
      }, {});

      return NextResponse.json({ strings: stringMap });
    }

    if (type === 'user_preference') {
      const userId = searchParams.get('user_id');
      if (!userId) return NextResponse.json({ language: 'en' });

      const { data: user } = await supabase
        .from('platform_users')
        .select('preferred_language')
        .eq('id', userId)
        .single();

      return NextResponse.json({ language: user?.preferred_language || 'en' });
    }

    return NextResponse.json({ languages: supportedLanguages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'set_preference') {
      const { user_id, language_code } = body;

      const { error } = await supabase
        .from('platform_users')
        .update({ preferred_language: language_code })
        .eq('id', user_id);

      if (error) throw error;
      return NextResponse.json({ success: true, language: language_code });
    }

    if (action === 'add_translation') {
      const { event_id, language_code, translations } = body.data;

      const { data: translation, error } = await supabase
        .from('event_translations')
        .upsert({
          event_id,
          language_code,
          title: translations.title,
          description: translations.description,
          venue_name: translations.venue_name,
          additional_info: translations.additional_info,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'event_id,language_code' })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ translation }, { status: 201 });
    }

    if (action === 'add_ui_string') {
      const { language_code, key, value } = body.data;

      const { data: string, error } = await supabase
        .from('ui_translations')
        .upsert({
          language_code,
          key,
          value,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'language_code,key' })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ string }, { status: 201 });
    }

    if (action === 'bulk_import') {
      const { language_code, strings } = body.data;

      const records = Object.entries(strings).map(([key, value]) => ({
        language_code,
        key,
        value,
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('ui_translations')
        .upsert(records, { onConflict: 'language_code,key' })
        .select();

      if (error) throw error;
      return NextResponse.json({ imported: data?.length }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
