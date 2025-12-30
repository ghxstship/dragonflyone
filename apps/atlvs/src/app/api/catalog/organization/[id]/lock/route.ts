import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log } from '@ghxstship/config';
import { z } from 'zod';

const lockItemSchema = z.object({
  locked_by: z.string().uuid().optional(),
  lock_reason: z.string().optional(),
});

export const dynamic = 'force-dynamic';

// Note: withAuth and ATLVS_ROLES removed - auth handled at middleware level

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  const { id } = await params;
  
  try {
    const payload = await request.json();
    const validatedData = lockItemSchema.parse(payload);

    const { data, error } = await supabase
      .from('organization_catalog_items')
      .update({
        is_locked: true,
        locked_by: validatedData.locked_by,
        locked_at: new Date().toISOString(),
        lock_reason: validatedData.lock_reason,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      log.error('Failed to lock organization catalog item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    log.error('Unexpected error locking organization catalog item:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
