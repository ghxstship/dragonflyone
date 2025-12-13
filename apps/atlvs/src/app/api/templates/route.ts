export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const TemplateSchema = z.object({
  organization_id: z.string().uuid(),
  category_id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  template_type: z.enum(['document', 'email', 'task', 'workflow', 'proposal', 'event', 'notification']),
  content: z.record(z.unknown()).optional(),
  is_active: z.boolean().default(true),
  is_public: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const organizationId = searchParams.get('organization_id');
    const templateType = searchParams.get('template_type');
    const categoryId = searchParams.get('category_id');
    const isActive = searchParams.get('is_active');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('templates')
      .select(`
        *,
        category:template_categories(id, name)
      `, { count: 'exact' })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (templateType && templateType !== 'all') {
      query = query.eq('template_type', templateType);
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (isActive !== null && isActive !== 'all') {
      query = query.eq('is_active', isActive === 'true');
    }
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const templates = data || [];
    const summary = {
      total: count || 0,
      active: templates.filter(t => t.is_active).length,
      by_type: templates.reduce((acc, t) => {
        acc[t.template_type] = (acc[t.template_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      templates,
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const validatedData = TemplateSchema.parse(body);

    const { data, error } = await supabase
      .from('templates')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ template: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
