import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ArticleSchema = z.object({
  title: z.string(),
  content: z.string(),
  category_id: z.string().uuid(),
  tags: z.array(z.string()).optional(),
  is_sop: z.boolean().default(false),
  sop_type: z.enum(['procedure', 'checklist', 'guideline', 'policy']).optional(),
  department: z.string().optional(),
  access_level: z.enum(['public', 'internal', 'restricted']).default('internal'),
  attachments: z.array(z.string()).optional(),
});

// GET /api/knowledge-base - Get articles and categories
export async function GET(request: NextRequest) {
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
    const articleId = searchParams.get('article_id');
    const categoryId = searchParams.get('category_id');
    const action = searchParams.get('action');
    const search = searchParams.get('search');

    if (action === 'categories') {
      const { data: categories } = await supabase
        .from('kb_categories')
        .select(`
          *,
          articles:kb_articles(count)
        `)
        .order('sort_order');

      return NextResponse.json({ categories: categories || [] });
    }

    if (action === 'sops') {
      const department = searchParams.get('department');

      let query = supabase
        .from('kb_articles')
        .select(`
          *,
          category:kb_categories(name, slug)
        `)
        .eq('is_sop', true)
        .eq('status', 'published')
        .order('title');

      if (department) {
        query = query.eq('department', department);
      }

      const { data: sops } = await query;

      return NextResponse.json({ sops: sops || [] });
    }

    if (action === 'search' && search) {
      const { data: results } = await supabase
        .from('kb_articles')
        .select(`
          id, title, content, tags, is_sop,
          category:kb_categories(name)
        `)
        .eq('status', 'published')
        .or(`title.ilike.%${search}%,content.ilike.%${search}%,tags.cs.{${search}}`)
        .limit(20);

      return NextResponse.json({ results: results || [] });
    }

    if (action === 'popular') {
      const { data: popular } = await supabase
        .from('kb_articles')
        .select('id, title, view_count, category:kb_categories(name)')
        .eq('status', 'published')
        .order('view_count', { ascending: false })
        .limit(10);

      return NextResponse.json({ popular: popular || [] });
    }

    if (action === 'recent') {
      const { data: recent } = await supabase
        .from('kb_articles')
        .select('id, title, updated_at, category:kb_categories(name)')
        .eq('status', 'published')
        .order('updated_at', { ascending: false })
        .limit(10);

      return NextResponse.json({ recent: recent || [] });
    }

    if (articleId) {
      const { data: article } = await supabase
        .from('kb_articles')
        .select(`
          *,
          category:kb_categories(*),
          author:platform_users!created_by(first_name, last_name)
        `)
        .eq('id', articleId)
        .single();

      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }

      // Increment view count
      await supabase
        .from('kb_articles')
        .update({ view_count: (article.view_count || 0) + 1 })
        .eq('id', articleId);

      // Get related articles
      const { data: related } = await supabase
        .from('kb_articles')
        .select('id, title')
        .eq('category_id', article.category_id)
        .neq('id', articleId)
        .eq('status', 'published')
        .limit(5);

      return NextResponse.json({
        article,
        related: related || [],
      });
    }

    if (categoryId) {
      const { data: articles } = await supabase
        .from('kb_articles')
        .select('*')
        .eq('category_id', categoryId)
        .eq('status', 'published')
        .order('title');

      return NextResponse.json({ articles: articles || [] });
    }

    // Default: Get all published articles
    const { data: articles } = await supabase
      .from('kb_articles')
      .select(`
        id, title, is_sop, sop_type, department, updated_at,
        category:kb_categories(id, name)
      `)
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(50);

    return NextResponse.json({ articles: articles || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch knowledge base' }, { status: 500 });
  }
}

// POST /api/knowledge-base - Create or update article
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
    const action = body.action || 'create';

    if (action === 'create') {
      const validated = ArticleSchema.parse(body);

      // Generate slug
      const slug = validated.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { data: article, error } = await supabase
        .from('kb_articles')
        .insert({
          ...validated,
          slug,
          status: 'draft',
          version: 1,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ article }, { status: 201 });
    } else if (action === 'create_category') {
      const { name, description, parent_id, icon } = body;

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { data: category, error } = await supabase
        .from('kb_categories')
        .insert({
          name,
          slug,
          description,
          parent_id,
          icon,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ category }, { status: 201 });
    } else if (action === 'publish') {
      const { article_id } = body;

      const { data: article, error } = await supabase
        .from('kb_articles')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          published_by: user.id,
        })
        .eq('id', article_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ article });
    } else if (action === 'create_version') {
      const { article_id, content, change_notes } = body;

      // Get current article
      const { data: current } = await supabase
        .from('kb_articles')
        .select('version, content')
        .eq('id', article_id)
        .single();

      if (!current) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }

      // Save version history
      await supabase.from('kb_article_versions').insert({
        article_id,
        version: current.version,
        content: current.content,
        created_by: user.id,
      });

      // Update article
      const { data: article, error } = await supabase
        .from('kb_articles')
        .update({
          content,
          version: current.version + 1,
          change_notes,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq('id', article_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ article });
    } else if (action === 'add_feedback') {
      const { article_id, helpful, feedback_text } = body;

      const { data: feedback, error } = await supabase
        .from('kb_article_feedback')
        .insert({
          article_id,
          user_id: user.id,
          helpful,
          feedback_text,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update article helpful counts
      if (helpful) {
        await supabase.rpc('increment_helpful_count', { p_article_id: article_id });
      } else {
        await supabase.rpc('increment_not_helpful_count', { p_article_id: article_id });
      }

      return NextResponse.json({ feedback });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/knowledge-base - Update article
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
    const articleId = searchParams.get('article_id');

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: article, error } = await supabase
      .from('kb_articles')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', articleId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

// DELETE /api/knowledge-base - Archive article
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('article_id');

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID required' }, { status: 400 });
    }

    // Soft delete
    const { error } = await supabase
      .from('kb_articles')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString(),
      })
      .eq('id', articleId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to archive article' }, { status: 500 });
  }
}
