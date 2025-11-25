import { NextRequest, NextResponse } from 'next/server';
import { createBrowserClient } from '@ghxstship/config';
import { z } from 'zod';

const BatchOperationSchema = z.object({
  operation: z.enum(['create', 'update', 'delete']),
  table: z.string(),
  data: z.array(z.record(z.any())),
});

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = BatchOperationSchema.parse(body);

    let result;
    switch (validated.operation) {
      case 'create':
        result = await (supabase as any).from(validated.table).insert(validated.data).select();
        break;
      case 'update':
        const updates = await Promise.all(
          validated.data.map((item) =>
            (supabase as any)
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
        result = await (supabase as any).from(validated.table).delete().in('id', ids);
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
