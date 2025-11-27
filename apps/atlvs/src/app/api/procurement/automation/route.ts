import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const RFPSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
  deadline: z.string(),
  requirements: z.array(z.string()),
  evaluation_criteria: z.array(z.object({
    criterion: z.string(),
    weight: z.number(),
  })),
  invited_vendors: z.array(z.string().uuid()).optional(),
  is_public: z.boolean().default(false),
  attachments: z.array(z.string()).optional(),
});

const RFQSchema = z.object({
  title: z.string(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unit: z.string(),
    specifications: z.string().optional(),
  })),
  deadline: z.string(),
  delivery_date: z.string().optional(),
  delivery_location: z.string().optional(),
  invited_vendors: z.array(z.string().uuid()).optional(),
  is_public: z.boolean().default(false),
});

// GET /api/procurement/automation - Get RFPs, RFQs, and automation rules
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
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
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const rfpId = searchParams.get('rfp_id');
    const rfqId = searchParams.get('rfq_id');

    if (rfpId) {
      // Get specific RFP with responses
      const { data: rfp } = await supabase
        .from('rfps')
        .select(`
          *,
          responses:rfp_responses(
            *,
            vendor:vendors(id, name, contact_email)
          )
        `)
        .eq('id', rfpId)
        .single();

      if (!rfp) {
        return NextResponse.json({ error: 'RFP not found' }, { status: 404 });
      }

      return NextResponse.json({ rfp });
    }

    if (rfqId) {
      // Get specific RFQ with quotes
      const { data: rfq } = await supabase
        .from('rfqs')
        .select(`
          *,
          quotes:rfq_quotes(
            *,
            vendor:vendors(id, name, contact_email)
          )
        `)
        .eq('id', rfqId)
        .single();

      if (!rfq) {
        return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
      }

      return NextResponse.json({ rfq });
    }

    if (type === 'rfp') {
      let query = supabase
        .from('rfps')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: rfps, count } = await query;

      return NextResponse.json({ rfps: rfps || [], total: count || 0 });
    }

    if (type === 'rfq') {
      let query = supabase
        .from('rfqs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: rfqs, count } = await query;

      return NextResponse.json({ rfqs: rfqs || [], total: count || 0 });
    }

    if (type === 'automation_rules') {
      const { data: rules } = await supabase
        .from('procurement_automation_rules')
        .select('*')
        .eq('is_active', true)
        .order('priority');

      return NextResponse.json({ rules: rules || [] });
    }

    // Default: Get summary
    const { data: rfps } = await supabase
      .from('rfps')
      .select('status')
      .eq('status', 'open');

    const { data: rfqs } = await supabase
      .from('rfqs')
      .select('status')
      .eq('status', 'open');

    const { data: pendingApprovals } = await supabase
      .from('purchase_orders')
      .select('id')
      .eq('status', 'pending_approval');

    return NextResponse.json({
      summary: {
        open_rfps: rfps?.length || 0,
        open_rfqs: rfqs?.length || 0,
        pending_approvals: pendingApprovals?.length || 0,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch procurement data' }, { status: 500 });
  }
}

// POST /api/procurement/automation - Create RFP, RFQ, or automation rule
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
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
    const action = body.action || 'create_rfp';

    if (action === 'create_rfp') {
      const validated = RFPSchema.parse(body);

      // Generate RFP number
      const { data: lastRfp } = await supabase
        .from('rfps')
        .select('rfp_number')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const lastNumber = lastRfp?.rfp_number ? parseInt(lastRfp.rfp_number.replace('RFP-', '')) : 0;
      const rfpNumber = `RFP-${String(lastNumber + 1).padStart(6, '0')}`;

      const { data: rfp, error } = await supabase
        .from('rfps')
        .insert({
          rfp_number: rfpNumber,
          ...validated,
          status: 'draft',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ rfp }, { status: 201 });
    } else if (action === 'create_rfq') {
      const validated = RFQSchema.parse(body);

      // Generate RFQ number
      const { data: lastRfq } = await supabase
        .from('rfqs')
        .select('rfq_number')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const lastNumber = lastRfq?.rfq_number ? parseInt(lastRfq.rfq_number.replace('RFQ-', '')) : 0;
      const rfqNumber = `RFQ-${String(lastNumber + 1).padStart(6, '0')}`;

      const { data: rfq, error } = await supabase
        .from('rfqs')
        .insert({
          rfq_number: rfqNumber,
          ...validated,
          status: 'draft',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ rfq }, { status: 201 });
    } else if (action === 'publish_rfp') {
      const { rfp_id } = body;

      const { data: rfp } = await supabase
        .from('rfps')
        .select('*')
        .eq('id', rfp_id)
        .single();

      if (!rfp) {
        return NextResponse.json({ error: 'RFP not found' }, { status: 404 });
      }

      // Update status
      await supabase
        .from('rfps')
        .update({
          status: 'open',
          published_at: new Date().toISOString(),
        })
        .eq('id', rfp_id);

      // Notify invited vendors
      if (rfp.invited_vendors?.length > 0) {
        for (const vendorId of rfp.invited_vendors) {
          const { data: vendor } = await supabase
            .from('vendors')
            .select('contact_user_id')
            .eq('id', vendorId)
            .single();

          if (vendor?.contact_user_id) {
            await supabase.from('unified_notifications').insert({
              user_id: vendor.contact_user_id,
              title: 'New RFP Invitation',
              message: `You have been invited to respond to RFP: ${rfp.title}`,
              type: 'action_required',
              priority: 'high',
              source_platform: 'atlvs',
              source_entity_type: 'rfp',
              source_entity_id: rfp_id,
              link: `/procurement/rfp/${rfp_id}`,
            });
          }
        }
      }

      return NextResponse.json({ success: true, status: 'open' });
    } else if (action === 'publish_rfq') {
      const { rfq_id } = body;

      await supabase
        .from('rfqs')
        .update({
          status: 'open',
          published_at: new Date().toISOString(),
        })
        .eq('id', rfq_id);

      return NextResponse.json({ success: true, status: 'open' });
    } else if (action === 'submit_rfp_response') {
      const { rfp_id, vendor_id, proposal, pricing, attachments } = body;

      const { data: response, error } = await supabase
        .from('rfp_responses')
        .insert({
          rfp_id,
          vendor_id,
          proposal,
          pricing,
          attachments,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          submitted_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ response }, { status: 201 });
    } else if (action === 'submit_rfq_quote') {
      const { rfq_id, vendor_id, line_items, total_amount, validity_days, notes } = body;

      const { data: quote, error } = await supabase
        .from('rfq_quotes')
        .insert({
          rfq_id,
          vendor_id,
          line_items,
          total_amount,
          validity_days,
          notes,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          submitted_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ quote }, { status: 201 });
    } else if (action === 'evaluate_rfp') {
      const { rfp_id, response_id, scores, notes, recommendation } = body;

      const { data: evaluation, error } = await supabase
        .from('rfp_evaluations')
        .insert({
          rfp_id,
          response_id,
          scores,
          notes,
          recommendation,
          evaluated_by: user.id,
          evaluated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ evaluation }, { status: 201 });
    } else if (action === 'award_rfp') {
      const { rfp_id, response_id, vendor_id } = body;

      // Update RFP status
      await supabase
        .from('rfps')
        .update({
          status: 'awarded',
          awarded_to: vendor_id,
          awarded_at: new Date().toISOString(),
        })
        .eq('id', rfp_id);

      // Update winning response
      await supabase
        .from('rfp_responses')
        .update({ status: 'awarded' })
        .eq('id', response_id);

      // Update other responses
      await supabase
        .from('rfp_responses')
        .update({ status: 'not_selected' })
        .eq('rfp_id', rfp_id)
        .neq('id', response_id);

      return NextResponse.json({ success: true });
    } else if (action === 'create_automation_rule') {
      const { name, trigger_type, conditions, actions, priority } = body;

      const { data: rule, error } = await supabase
        .from('procurement_automation_rules')
        .insert({
          name,
          trigger_type,
          conditions,
          actions,
          priority,
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ rule }, { status: 201 });
    } else if (action === 'auto_create_po') {
      // Automatically create PO from awarded RFP or selected quote
      const { source_type, source_id, vendor_id } = body;

      let poData: any = {
        vendor_id,
        status: 'pending_approval',
        created_by: user.id,
      };

      if (source_type === 'rfp') {
        const { data: response } = await supabase
          .from('rfp_responses')
          .select('pricing, rfp:rfps(title)')
          .eq('id', source_id)
          .single();

        poData.items = response?.pricing?.items || [];
        poData.total_amount = response?.pricing?.total || 0;
        poData.notes = `Auto-generated from RFP: ${(response?.rfp as any)?.title}`;
        poData.source_rfp_id = source_id;
      } else if (source_type === 'rfq') {
        const { data: quote } = await supabase
          .from('rfq_quotes')
          .select('line_items, total_amount, rfq:rfqs(title)')
          .eq('id', source_id)
          .single();

        poData.items = quote?.line_items || [];
        poData.total_amount = quote?.total_amount || 0;
        poData.notes = `Auto-generated from RFQ: ${(quote?.rfq as any)?.title}`;
        poData.source_rfq_id = source_id;
      }

      // Generate PO number
      const { data: lastPo } = await supabase
        .from('purchase_orders')
        .select('po_number')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const lastNumber = lastPo?.po_number ? parseInt(lastPo.po_number.replace('PO-', '')) : 0;
      poData.po_number = `PO-${String(lastNumber + 1).padStart(6, '0')}`;

      const { data: po, error } = await supabase
        .from('purchase_orders')
        .insert(poData)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ purchase_order: po }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/procurement/automation - Update RFP, RFQ, or rule
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rfpId = searchParams.get('rfp_id');
    const rfqId = searchParams.get('rfq_id');
    const ruleId = searchParams.get('rule_id');

    const body = await request.json();

    if (rfpId) {
      const { data: rfp, error } = await supabase
        .from('rfps')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', rfpId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ rfp });
    }

    if (rfqId) {
      const { data: rfq, error } = await supabase
        .from('rfqs')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', rfqId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ rfq });
    }

    if (ruleId) {
      const { data: rule, error } = await supabase
        .from('procurement_automation_rules')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', ruleId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ rule });
    }

    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
