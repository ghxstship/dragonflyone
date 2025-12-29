export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const AttachmentSchema = z.object({
  entity_type: z.string().min(1),
  entity_id: z.string().uuid(),
  file_name: z.string().min(1),
  file_url: z.string().url(),
  file_size: z.number().int().optional(),
  file_type: z.string().optional(),
  uploaded_by: z.string().uuid().optional(),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const entityType = searchParams.get('entity_type');
    const entityId = searchParams.get('entity_id');
    const fileType = searchParams.get('file_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'entity_type and entity_id are required' }, { status: 400 });
    }

    const tableName = `${entityType}_attachments`;
    const idColumn = `${entityType}_id`;

    let query = supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .eq(idColumn, entityId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (fileType) {
      query = query.eq('file_type', fileType);
    }

    const { data, error, count } = await query;

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ 
          attachments: [],
          summary: { total: 0 },
          pagination: { limit, offset, total: 0 },
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const attachments = data || [];
    const totalSize = attachments.reduce((sum, a) => sum + (a.file_size || 0), 0);

    return NextResponse.json({
      attachments,
      summary: {
        total: count || 0,
        total_size: totalSize,
        by_type: attachments.reduce((acc, a) => {
          const type = a.file_type || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch attachments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const validatedData = AttachmentSchema.parse(body);

    const { entity_type, entity_id, ...attachmentData } = validatedData;
    const tableName = `${entity_type}_attachments`;
    const idColumn = `${entity_type}_id`;

    const insertData = {
      ...attachmentData,
      [idColumn]: entity_id,
    };

    const { data, error } = await supabase
      .from(tableName)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ attachment: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Failed to create attachment' }, { status: 500 });
  }
}
