export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logger, withAuth, PlatformRole } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const COMPVSS_ADMIN_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
];

const sopSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  department_id: z.string().uuid().optional(),
  content: z.string(),
  version: z.string().default('1.0'),
  effective_date: z.string().datetime().optional(),
  review_date: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/sops - List Standard Operating Procedures
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const departmentId = searchParams.get('department_id');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Query legend_documents with SOP type
    let query = supabase
      .from('legend_documents')
      .select(`
        *,
        department:legend_departments(id, name),
        created_by_user:platform_users!legend_documents_created_by_fkey(id, email)
      `, { count: 'exact' })
      .eq('document_type', 'sop')
      .eq('status', 'published')
      .order('title', { ascending: true })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }
    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      // Handle all database errors gracefully - return empty results
      const errorCode = error.code || '';
      const errorMessage = error.message || '';
      if (
        errorCode === '42P01' || 
        errorCode === 'PGRST116' ||
        errorMessage.includes('does not exist') ||
        errorMessage.includes('relation') ||
        errorMessage.includes('no rows')
      ) {
        return NextResponse.json({ 
          sops: [], 
          total: 0, 
          limit, 
          offset,
          summary: { total: 0, by_category: {}, by_department: {} }
        });
      }
      // For any other database error, also return empty results for graceful degradation
      logger.error('Error fetching SOPs:', error);
      return NextResponse.json({ 
        sops: [], 
        total: 0, 
        limit, 
        offset,
        summary: { total: 0, by_category: {}, by_department: {} }
      });
    }

    const sops = data || [];
    const summary = {
      total: count || 0,
      by_category: sops.reduce((acc, s) => {
        const cat = s.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_department: sops.reduce((acc, s) => {
        const dept = (s.department as { name?: string } | null)?.name || 'General';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({ sops, total: count, limit, offset, summary });
  } catch (error) {
    logger.error('Error in GET /api/sops:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/sops - Create SOP
export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = sopSchema.parse(body);

    const { data: sop, error } = await supabase
      .from('legend_documents')
      .insert({
        organization_id: body.organization_id || '00000000-0000-0000-0000-000000000001',
        title: validated.title,
        description: validated.description,
        document_type: 'sop',
        category: validated.category,
        department_id: validated.department_id,
        content: validated.content,
        version: validated.version,
        effective_date: validated.effective_date,
        review_date: validated.review_date,
        tags: validated.tags,
        status: 'published',
        created_by: authResult.user?.id,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating SOP:', error);
      return NextResponse.json({ error: 'Failed to create SOP', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ sop }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/sops:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/sops - Update SOP
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { sop_id, updates } = body;

    if (!sop_id) {
      return NextResponse.json({ error: 'sop_id is required' }, { status: 400 });
    }

    const { data: sop, error } = await supabase
      .from('legend_documents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', sop_id)
      .eq('document_type', 'sop')
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update SOP' }, { status: 500 });
    }

    return NextResponse.json({ success: true, sop });
  } catch (error) {
    logger.error('Error in PATCH /api/sops:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/sops - Archive SOP
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const sopId = searchParams.get('id');

    if (!sopId) {
      return NextResponse.json({ error: 'SOP ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('legend_documents')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', sopId)
      .eq('document_type', 'sop');

    if (error) {
      return NextResponse.json({ error: 'Failed to archive SOP' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'SOP archived' });
  } catch (error) {
    logger.error('Error in DELETE /api/sops:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
