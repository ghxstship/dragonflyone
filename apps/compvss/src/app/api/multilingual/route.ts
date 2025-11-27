import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Multilingual support for international crews
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'en';
    const namespace = searchParams.get('namespace');

    let query = supabase.from('translations').select('*').eq('language', language);

    if (namespace) query = query.eq('namespace', namespace);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Convert to key-value format
    const translations: Record<string, string> = {};
    data?.forEach(t => {
      translations[t.key] = t.value;
    });

    return NextResponse.json({
      language,
      translations,
      namespaces: Array.from(new Set(data?.map(t => t.namespace)))
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'add_translation') {
      const { language, namespace, key, value } = body;

      const { data, error } = await supabase.from('translations').upsert({
        language, namespace, key, value, updated_by: user.id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'language,namespace,key' }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ translation: data }, { status: 201 });
    }

    if (action === 'bulk_import') {
      const { language, namespace, translations } = body;

      const records = Object.entries(translations).map(([key, value]) => ({
        language, namespace, key, value: value as string,
        updated_by: user.id, updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('translations').upsert(records, {
        onConflict: 'language,namespace,key'
      });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ imported: records.length });
    }

    if (action === 'set_user_language') {
      const { language } = body;

      await supabase.from('user_preferences').upsert({
        user_id: user.id, preferred_language: language
      }, { onConflict: 'user_id' });

      return NextResponse.json({ success: true });
    }

    if (action === 'get_supported_languages') {
      const { data } = await supabase.from('supported_languages').select('*').eq('active', true);
      return NextResponse.json({ languages: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
