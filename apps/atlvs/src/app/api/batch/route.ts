export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createBrowserClient, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const BatchOperationSchema = z.object({
  operation: z.enum(['create', 'update', 'delete']),
  table: z.string(),
  data: z.array(z.record(z.any())),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = BatchOperationSchema.parse(body);

    let result: { data: unknown; error: { message: string } | null } = { data: null, error: null };
    switch (validated.operation) {
      case 'create':
        result = await supabase.from(validated.table).insert(validated.data).select();
        break;
      case 'update':
        const updates = await Promise.all(
          validated.data.map((item) =>
            supabase
              .from(validated.table)
              .update(item)
              .eq('id', item.id)
              .select()
          )
        );
        result = { data: updates.map((u) => u.data).flat(), error: null };
        break;
      case 'delete':
        const ids = validated.data.map((item) => item.id);
        result = await supabase.from(validated.table).delete().in('id', ids);
        break;
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      count: Array.isArray(result.data) ? result.data.length : 0,
      data: result.data,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
