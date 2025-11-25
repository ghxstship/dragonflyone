import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TranslationSchema = z.object({
  content_type: z.enum(['knowledge_article', 'sop', 'training', 'faq', 'template', 'regulation']),
  content_id: z.string().uuid(),
  language_code: z.string().length(2),
  title: z.string(),
  content: z.string(),
  summary: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  is_machine_translated: z.boolean().default(false),
  is_verified: z.boolean().default(false),
});

// GET /api/multilingual-content - Get content in specified language
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('content_type');
    const contentId = searchParams.get('content_id');
    const languageCode = searchParams.get('language') || 'en';
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (contentId) {
      // Get specific content with all translations
      const { data: translations, error } = await supabase
        .from('content_translations')
        .select('*')
        .eq('content_id', contentId)
        .order('language_code');

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get the requested language or fallback to English
      const requestedTranslation = translations?.find(t => t.language_code === languageCode);
      const englishTranslation = translations?.find(t => t.language_code === 'en');

      return NextResponse.json({
        content: requestedTranslation || englishTranslation,
        all_translations: translations,
        available_languages: translations?.map(t => t.language_code) || [],
        requested_language: languageCode,
        is_fallback: !requestedTranslation && !!englishTranslation,
      });
    } else {
      // Get content list in specified language
      let query = supabase
        .from('content_translations')
        .select('*', { count: 'exact' })
        .eq('language_code', languageCode)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (contentType) {
        query = query.eq('content_type', contentType);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      const { data: content, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get available languages
      const { data: languages } = await supabase
        .from('content_translations')
        .select('language_code');

      const availableLanguages = Array.from(new Set(languages?.map(l => l.language_code)));

      return NextResponse.json({
        content: content || [],
        total: count || 0,
        language: languageCode,
        available_languages: availableLanguages,
        limit,
        offset,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

// POST /api/multilingual-content - Create translation
export async function POST(request: NextRequest) {
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
    const action = body.action || 'create_translation';

    if (action === 'create_translation') {
      const validated = TranslationSchema.parse(body);

      // Check for existing translation
      const { data: existing } = await supabase
        .from('content_translations')
        .select('id')
        .eq('content_id', validated.content_id)
        .eq('language_code', validated.language_code)
        .single();

      if (existing) {
        return NextResponse.json({ 
          error: 'Translation already exists for this language',
          existing_id: existing.id,
        }, { status: 400 });
      }

      const { data: translation, error } = await supabase
        .from('content_translations')
        .insert({
          ...validated,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ translation }, { status: 201 });
    } else if (action === 'auto_translate') {
      const { content_id, source_language, target_languages } = body;

      // Get source content
      const { data: sourceContent } = await supabase
        .from('content_translations')
        .select('*')
        .eq('content_id', content_id)
        .eq('language_code', source_language)
        .single();

      if (!sourceContent) {
        return NextResponse.json({ error: 'Source content not found' }, { status: 404 });
      }

      // In production, this would call a translation API (Google Translate, DeepL, etc.)
      // For now, create placeholder translations
      const translations = [];
      for (const targetLang of target_languages) {
        const { data: existing } = await supabase
          .from('content_translations')
          .select('id')
          .eq('content_id', content_id)
          .eq('language_code', targetLang)
          .single();

        if (!existing) {
          const { data: translation } = await supabase
            .from('content_translations')
            .insert({
              content_type: sourceContent.content_type,
              content_id,
              language_code: targetLang,
              title: `[${targetLang.toUpperCase()}] ${sourceContent.title}`,
              content: sourceContent.content,
              summary: sourceContent.summary,
              keywords: sourceContent.keywords,
              is_machine_translated: true,
              is_verified: false,
              created_by: user.id,
            })
            .select()
            .single();

          if (translation) {
            translations.push(translation);
          }
        }
      }

      return NextResponse.json({
        created_count: translations.length,
        translations,
        message: 'Machine translations created. Please review and verify.',
      });
    } else if (action === 'verify_translation') {
      const { translation_id } = body;

      const { data: translation, error } = await supabase
        .from('content_translations')
        .update({
          is_verified: true,
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', translation_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ translation });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/multilingual-content - Update translation
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const translationId = searchParams.get('translation_id');

    if (!translationId) {
      return NextResponse.json({ error: 'Translation ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: translation, error } = await supabase
      .from('content_translations')
      .update({
        ...body,
        is_verified: false, // Reset verification on edit
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', translationId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ translation });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update translation' }, { status: 500 });
  }
}

// DELETE /api/multilingual-content - Delete translation
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const translationId = searchParams.get('translation_id');

    if (!translationId) {
      return NextResponse.json({ error: 'Translation ID required' }, { status: 400 });
    }

    // Don't allow deleting English (primary) translations
    const { data: translation } = await supabase
      .from('content_translations')
      .select('language_code')
      .eq('id', translationId)
      .single();

    if (translation?.language_code === 'en') {
      return NextResponse.json({ error: 'Cannot delete primary English translation' }, { status: 400 });
    }

    const { error } = await supabase
      .from('content_translations')
      .delete()
      .eq('id', translationId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete translation' }, { status: 500 });
  }
}
