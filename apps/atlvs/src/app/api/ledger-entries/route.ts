import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const createEntrySchema = z.object({
  organization_id: z.string().uuid(),
  account_id: z.string().uuid(),
  amount: z.number(),
  side: z.enum(['debit', 'credit']),
  entry_date: z.string(),
  project_id: z.string().uuid().optional(),
  memo: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('organization_id');
    const projectId = searchParams.get('project_id');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!orgId) return NextResponse.json({ error: 'organization_id required' }, { status: 400 });

    let query = supabase.from('ledger_entries').select('*, ledger_accounts(*)', { count: 'exact' })
      .eq('organization_id', orgId).order('entry_date', { ascending: false }).range(offset, offset + limit - 1);

    if (projectId) query = query.eq('project_id', projectId);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ entries: data, total: count, limit, offset });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const payload = createEntrySchema.parse(body);
    const { data, error } = await supabase.from('ledger_entries').insert(payload).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ entry: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues }, { status: 422 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
