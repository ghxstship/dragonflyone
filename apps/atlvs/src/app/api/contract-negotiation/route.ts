import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ContractVersionSchema = z.object({
  contract_id: z.string().uuid(),
  version_number: z.number().int().positive(),
  document_url: z.string().url(),
  changes_summary: z.string().optional(),
  redlines: z.array(z.object({
    section: z.string(),
    original_text: z.string(),
    proposed_text: z.string(),
    proposed_by: z.enum(['us', 'counterparty']),
    status: z.enum(['pending', 'accepted', 'rejected', 'modified']).default('pending'),
    comments: z.string().optional(),
  })).optional(),
});

const NegotiationSchema = z.object({
  contract_id: z.string().uuid(),
  counterparty_id: z.string().uuid().optional(),
  counterparty_name: z.string(),
  counterparty_contact: z.string().optional(),
  start_date: z.string(),
  target_close_date: z.string().optional(),
  status: z.enum(['draft', 'in_negotiation', 'pending_approval', 'approved', 'executed', 'terminated']).default('draft'),
  key_terms: z.array(z.object({
    term_name: z.string(),
    our_position: z.string(),
    counterparty_position: z.string().optional(),
    agreed_value: z.string().optional(),
    status: z.enum(['open', 'agreed', 'disputed']).default('open'),
  })).optional(),
  notes: z.string().optional(),
});

// GET /api/contract-negotiation - Get negotiations and versions
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contract_id');
    const negotiationId = searchParams.get('negotiation_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (negotiationId) {
      // Get specific negotiation with versions
      const { data: negotiation, error } = await supabase
        .from('contract_negotiations')
        .select(`
          *,
          contract:contracts(id, name, type, value),
          versions:contract_versions(*)
        `)
        .eq('id', negotiationId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get negotiation history/timeline
      const { data: history } = await supabase
        .from('negotiation_history')
        .select('*')
        .eq('negotiation_id', negotiationId)
        .order('created_at', { ascending: false });

      return NextResponse.json({
        negotiation,
        history: history || [],
      });
    } else if (contractId) {
      // Get all negotiations for a contract
      const { data: negotiations, error } = await supabase
        .from('contract_negotiations')
        .select('*')
        .eq('contract_id', contractId)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get versions
      const { data: versions } = await supabase
        .from('contract_versions')
        .select('*')
        .eq('contract_id', contractId)
        .order('version_number', { ascending: false });

      return NextResponse.json({
        negotiations: negotiations || [],
        versions: versions || [],
      });
    } else {
      // Get all active negotiations
      let query = supabase
        .from('contract_negotiations')
        .select(`
          *,
          contract:contracts(id, name, type, value)
        `, { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      } else {
        query = query.in('status', ['draft', 'in_negotiation', 'pending_approval']);
      }

      const { data: negotiations, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        negotiations: negotiations || [],
        total: count || 0,
        limit,
        offset,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch negotiations' }, { status: 500 });
  }
}

// POST /api/contract-negotiation - Create negotiation or version
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
    const action = body.action || 'create_negotiation';

    if (action === 'create_negotiation') {
      const validated = NegotiationSchema.parse(body);

      const { data: negotiation, error } = await supabase
        .from('contract_negotiations')
        .insert({
          ...validated,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log history
      await supabase.from('negotiation_history').insert({
        negotiation_id: negotiation.id,
        action: 'created',
        description: 'Negotiation started',
        performed_by: user.id,
      });

      return NextResponse.json({ negotiation }, { status: 201 });
    } else if (action === 'create_version') {
      const validated = ContractVersionSchema.parse(body);

      // Get current max version
      const { data: maxVersion } = await supabase
        .from('contract_versions')
        .select('version_number')
        .eq('contract_id', validated.contract_id)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      const newVersionNumber = (maxVersion?.version_number || 0) + 1;

      const { data: version, error } = await supabase
        .from('contract_versions')
        .insert({
          contract_id: validated.contract_id,
          version_number: newVersionNumber,
          document_url: validated.document_url,
          changes_summary: validated.changes_summary,
          redlines: validated.redlines,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ version }, { status: 201 });
    } else if (action === 'add_redline') {
      const { version_id, redline } = body;

      const { data: version } = await supabase
        .from('contract_versions')
        .select('redlines')
        .eq('id', version_id)
        .single();

      const currentRedlines = version?.redlines || [];
      currentRedlines.push({
        ...redline,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        created_by: user.id,
      });

      const { data: updatedVersion, error } = await supabase
        .from('contract_versions')
        .update({ redlines: currentRedlines })
        .eq('id', version_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ version: updatedVersion });
    } else if (action === 'update_term') {
      const { negotiation_id, term_index, updates } = body;

      const { data: negotiation } = await supabase
        .from('contract_negotiations')
        .select('key_terms')
        .eq('id', negotiation_id)
        .single();

      const keyTerms = negotiation?.key_terms || [];
      if (term_index >= 0 && term_index < keyTerms.length) {
        keyTerms[term_index] = { ...keyTerms[term_index], ...updates };
      }

      const { data: updated, error } = await supabase
        .from('contract_negotiations')
        .update({ key_terms: keyTerms, updated_at: new Date().toISOString() })
        .eq('id', negotiation_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log history
      await supabase.from('negotiation_history').insert({
        negotiation_id,
        action: 'term_updated',
        description: `Term "${keyTerms[term_index]?.term_name}" updated`,
        performed_by: user.id,
        metadata: updates,
      });

      return NextResponse.json({ negotiation: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/contract-negotiation - Update negotiation status
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
    const negotiationId = searchParams.get('negotiation_id');
    const versionId = searchParams.get('version_id');

    const body = await request.json();

    if (versionId) {
      // Update version (e.g., redline status)
      const { data: version, error } = await supabase
        .from('contract_versions')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', versionId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ version });
    } else if (negotiationId) {
      const previousStatus = body.previous_status;
      
      const { data: negotiation, error } = await supabase
        .from('contract_negotiations')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', negotiationId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log status change
      if (body.status && body.status !== previousStatus) {
        await supabase.from('negotiation_history').insert({
          negotiation_id: negotiationId,
          action: 'status_changed',
          description: `Status changed from ${previousStatus} to ${body.status}`,
          performed_by: user.id,
        });
      }

      return NextResponse.json({ negotiation });
    }

    return NextResponse.json({ error: 'Negotiation ID or Version ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
