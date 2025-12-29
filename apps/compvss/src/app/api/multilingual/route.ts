export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const addTranslationSchema = z.object({
  action: z.literal('add_translation'),
  language: z.string().min(2),
  namespace: z.string(),
  key: z.string(),
  value: z.string(),
});

const bulkImportSchema = z.object({
  action: z.literal('bulk_import'),
  language: z.string().min(2),
  namespace: z.string(),
  translations: z.record(z.string()),
});

const setUserLanguageSchema = z.object({
  action: z.literal('set_user_language'),
  language: z.string().min(2),
});

const getSupportedLanguagesSchema = z.object({
  action: z.literal('get_supported_languages'),
});

const multilingualActionSchema = z.union([
  addTranslationSchema,
  bulkImportSchema,
  setUserLanguageSchema,
  getSupportedLanguagesSchema,
]);

// Multilingual support for international crews
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'en';
    const namespace = searchParams.get('namespace');

    let query = supabase.from('translations').select('*').eq('language', language);

    if (namespace) query = query.eq('namespace', namespace);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

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
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = multilingualActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'add_translation') {
      const { language, namespace, key, value } = validatedData as z.infer<typeof addTranslationSchema>;

      const { data, error } = await supabase.from('translations').upsert({
        language, namespace, key, value, updated_by: user.id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'language,namespace,key' }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ translation: data }, { status: 201 });
    }

    if (action === 'bulk_import') {
      const { language, namespace, translations } = validatedData as z.infer<typeof bulkImportSchema>;

      const records = Object.entries(translations).map(([key, value]) => ({
        language, namespace, key, value: value as string,
        updated_by: user.id, updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('translations').upsert(records, {
        onConflict: 'language,namespace,key'
      });

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ imported: records.length });
    }

    if (action === 'set_user_language') {
      const { language } = validatedData as z.infer<typeof setUserLanguageSchema>;

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
