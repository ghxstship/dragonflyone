export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PermitSchema = z.object({
  organization_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  permit_type: z.string().min(1),
  permit_number: z.string().optional(),
  issuing_authority: z.string().optional(),
  status: z.enum(['pending', 'submitted', 'approved', 'denied', 'expired']).default('pending'),
  application_date: z.string().optional(),
  approval_date: z.string().optional(),
  expiration_date: z.string().optional(),
  fee_amount: z.number().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const projectId = searchParams.get('project_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('permits')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const permits = data || [];
    const summary = {
      total: count || 0,
      by_status: {
        pending: permits.filter(p => p.status === 'pending').length,
        submitted: permits.filter(p => p.status === 'submitted').length,
        approved: permits.filter(p => p.status === 'approved').length,
        denied: permits.filter(p => p.status === 'denied').length,
        expired: permits.filter(p => p.status === 'expired').length,
      },
      total_fees: permits.reduce((sum, p) => sum + (p.fee_amount || 0), 0),
    };

    return NextResponse.json({
      permits,
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch permits' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = PermitSchema.parse(body);

    const { data, error } = await supabase
      .from('permits')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ permit: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Failed to create permit' }, { status: 500 });
  }
}
