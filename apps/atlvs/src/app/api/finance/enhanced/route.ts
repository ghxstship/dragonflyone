import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const createEntrySchema = z.object({
  ledger_account_id: z.string().uuid(),
  amount: z.number(),
  entry_type: z.enum(['revenue', 'expense', 'asset', 'liability']),
  posted_date: z.string(),
  description: z.string().min(1),
  project_id: z.string().uuid().optional(),
  invoice_id: z.string().uuid().optional(),
});

export const GET = apiRoute(
  async (request: NextRequest) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { searchParams } = new URL(request.url);
      
      const orgId = searchParams.get('organization_id');
      const entryType = searchParams.get('entry_type');
      const startDate = searchParams.get('start_date');
      const endDate = searchParams.get('end_date');
      const limit = parseInt(searchParams.get('limit') || '100');
      const offset = parseInt(searchParams.get('offset') || '0');

      if (!orgId) {
        return NextResponse.json({ error: 'organization_id required' }, { status: 400 });
      }

      let query = supabase
        .from('ledger_entries')
        .select('*, ledger_accounts(*), projects(*)', { count: 'exact' })
        .eq('organization_id', orgId)
        .order('posted_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (entryType) {
        query = query.eq('entry_type', entryType);
      }

      if (startDate) {
        query = query.gte('posted_date', startDate);
      }

      if (endDate) {
        query = query.lte('posted_date', endDate);
      }

      const { data, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const summary = {
        total_revenue: data?.filter(e => e.entry_type === 'revenue').reduce((sum, e) => sum + e.amount, 0) || 0,
        total_expenses: data?.filter(e => e.entry_type === 'expense').reduce((sum, e) => sum + Math.abs(e.amount), 0) || 0,
        total_assets: data?.filter(e => e.entry_type === 'asset').reduce((sum, e) => sum + e.amount, 0) || 0,
        total_liabilities: data?.filter(e => e.entry_type === 'liability').reduce((sum, e) => sum + e.amount, 0) || 0,
      };

      return NextResponse.json({ 
        entries: data,
        summary,
        total: count,
        limit,
        offset
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN],
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    audit: { action: 'finance:view', resource: 'ledger_entries' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const payload = context.validated;

      const { data: account, error: accountError } = await supabase
        .from('ledger_accounts')
        .select('organization_id')
        .eq('id', payload.ledger_account_id)
        .single();

      if (accountError || !account) {
        return NextResponse.json({ error: 'Ledger account not found' }, { status: 404 });
      }

      const { data, error } = await supabase
        .from('ledger_entries')
        .insert({
          ...payload,
          organization_id: account.organization_id,
          created_by: context.user?.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ entry: data }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN],
    validation: createEntrySchema,
    rateLimit: { maxRequests: 50, windowMs: 60000 },
    audit: { action: 'finance:create_entry', resource: 'ledger_entries' },
  }
);
