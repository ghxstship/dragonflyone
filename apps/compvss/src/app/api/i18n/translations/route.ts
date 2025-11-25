import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en-US';
    const namespace = searchParams.get('namespace');
    const keys = searchParams.get('keys')?.split(',').filter(Boolean);

    let query = supabase
      .from('translations')
      .select(`
        id, value, is_approved, is_machine_translated,
        key:translation_keys(key, namespace, description)
      `)
      .eq('locale_code', locale);

    if (namespace) {
      query = query.eq('translation_keys.namespace', namespace);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform to key-value format
    const translations: Record<string, string> = {};
    (data || []).forEach((t: Record<string, unknown>) => {
      const keyData = t.key as { key: string } | null;
      if (keyData?.key) {
        // Filter by specific keys if provided
        if (!keys || keys.includes(keyData.key)) {
          translations[keyData.key] = t.value as string;
        }
      }
    });

    return NextResponse.json({
      locale,
      namespace,
      translations,
    });
  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}
