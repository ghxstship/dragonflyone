import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BlanketPOSchema = z.object({
  vendor_id: z.string().uuid(),
  description: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  total_amount: z.number().positive(),
  release_limit: z.number().positive().optional(),
  terms: z.string().optional(),
});

const ReleaseSchema = z.object({
  blanket_po_id: z.string().uuid(),
  amount: z.number().positive(),
  description: z.string(),
  delivery_date: z.string().optional(),
});

// GET /api/blanket-po - Get blanket POs and releases
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const blanketPoId = searchParams.get('blanket_po_id');
    const vendorId = searchParams.get('vendor_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (blanketPoId) {
      // Get specific blanket PO with releases
      const { data: blanketPo, error } = await supabase
        .from('blanket_purchase_orders')
        .select(`
          *,
          vendor:vendors(id, name, contact_email),
          releases:blanket_po_releases(*)
        `)
        .eq('id', blanketPoId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Calculate utilization
      const utilization = blanketPo.total_amount > 0 
        ? (blanketPo.amount_used / blanketPo.total_amount * 100).toFixed(2)
        : 0;

      return NextResponse.json({
        blanket_po: {
          ...blanketPo,
          utilization_percent: utilization,
        },
      });
    } else {
      // Get all blanket POs
      let query = supabase
        .from('blanket_purchase_orders')
        .select(`
          *,
          vendor:vendors(id, name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (vendorId) {
        query = query.eq('vendor_id', vendorId);
      }

      if (status) {
        query = query.eq('status', status);
      } else {
        query = query.in('status', ['active', 'draft']);
      }

      const { data: blanketPos, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Add utilization to each
      const blanketPosWithUtilization = blanketPos?.map(po => ({
        ...po,
        utilization_percent: po.total_amount > 0 
          ? (po.amount_used / po.total_amount * 100).toFixed(2)
          : 0,
      }));

      return NextResponse.json({
        blanket_pos: blanketPosWithUtilization || [],
        total: count || 0,
        limit,
        offset,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blanket POs' }, { status: 500 });
  }
}

// POST /api/blanket-po - Create blanket PO or release
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
    const action = body.action || 'create_blanket_po';

    if (action === 'create_blanket_po') {
      const validated = BlanketPOSchema.parse(body);

      // Generate PO number
      const { data: lastPo } = await supabase
        .from('blanket_purchase_orders')
        .select('po_number')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const lastNumber = lastPo?.po_number ? parseInt(lastPo.po_number.replace('BPO-', '')) : 0;
      const poNumber = `BPO-${String(lastNumber + 1).padStart(6, '0')}`;

      const { data: blanketPo, error } = await supabase
        .from('blanket_purchase_orders')
        .insert({
          ...validated,
          po_number: poNumber,
          amount_used: 0,
          amount_remaining: validated.total_amount,
          status: 'draft',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ blanket_po: blanketPo }, { status: 201 });
    } else if (action === 'create_release') {
      const validated = ReleaseSchema.parse(body);

      // Get blanket PO
      const { data: blanketPo } = await supabase
        .from('blanket_purchase_orders')
        .select('*')
        .eq('id', validated.blanket_po_id)
        .single();

      if (!blanketPo) {
        return NextResponse.json({ error: 'Blanket PO not found' }, { status: 404 });
      }

      if (blanketPo.status !== 'active') {
        return NextResponse.json({ error: 'Blanket PO is not active' }, { status: 400 });
      }

      // Check release limit
      if (blanketPo.release_limit && validated.amount > blanketPo.release_limit) {
        return NextResponse.json({ 
          error: 'Release amount exceeds limit',
          release_limit: blanketPo.release_limit,
        }, { status: 400 });
      }

      // Check remaining amount
      if (validated.amount > blanketPo.amount_remaining) {
        return NextResponse.json({ 
          error: 'Insufficient remaining amount',
          amount_remaining: blanketPo.amount_remaining,
        }, { status: 400 });
      }

      // Get next release number
      const { data: lastRelease } = await supabase
        .from('blanket_po_releases')
        .select('release_number')
        .eq('blanket_po_id', validated.blanket_po_id)
        .order('release_number', { ascending: false })
        .limit(1)
        .single();

      const releaseNumber = (lastRelease?.release_number || 0) + 1;

      // Create release
      const { data: release, error } = await supabase
        .from('blanket_po_releases')
        .insert({
          blanket_po_id: validated.blanket_po_id,
          release_number: releaseNumber,
          amount: validated.amount,
          description: validated.description,
          delivery_date: validated.delivery_date,
          status: 'pending',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update blanket PO amounts
      await supabase
        .from('blanket_purchase_orders')
        .update({
          amount_used: blanketPo.amount_used + validated.amount,
          amount_remaining: blanketPo.amount_remaining - validated.amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', validated.blanket_po_id);

      return NextResponse.json({ release }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/blanket-po - Update blanket PO or release
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const blanketPoId = searchParams.get('blanket_po_id');
    const releaseId = searchParams.get('release_id');

    const body = await request.json();

    if (releaseId) {
      const { data: release, error } = await supabase
        .from('blanket_po_releases')
        .update({
          ...body,
        })
        .eq('id', releaseId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ release });
    } else if (blanketPoId) {
      const { data: blanketPo, error } = await supabase
        .from('blanket_purchase_orders')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', blanketPoId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ blanket_po: blanketPo });
    }

    return NextResponse.json({ error: 'Blanket PO ID or Release ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
