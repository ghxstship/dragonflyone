import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const PurchaseOrderSchema = z.object({
  vendor_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  description: z.string().min(1),
  category: z.enum(['equipment', 'staging', 'lighting', 'audio', 'video', 'catering', 'transportation', 'labor', 'rental', 'other']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  requested_delivery_date: z.string().optional(),
  shipping_address: z.string().optional(),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const LineItemSchema = z.object({
  item_name: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().positive(),
  unit_price: z.number(),
  unit_of_measure: z.string().default('each'),
  tax_rate: z.number().default(0),
  discount_amount: z.number().default(0),
});

// GET /api/purchase-orders - List all purchase orders
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const vendorId = searchParams.get('vendor_id');
    const projectId = searchParams.get('project_id');
    const includeLineItems = searchParams.get('include_line_items') === 'true';

    const selectQuery = includeLineItems
      ? `*, vendor:vendors(id, name, email, phone), project:projects(id, name, project_code), requested_by_user:platform_users!requested_by(id, full_name), approved_by_user:platform_users!approved_by(id, full_name), line_items:purchase_order_line_items(*)`
      : `*, vendor:vendors(id, name, email, phone), project:projects(id, name, project_code), requested_by_user:platform_users!requested_by(id, full_name), approved_by_user:platform_users!approved_by(id, full_name)`;

    let query = supabase
      .from('purchase_orders')
      .select(selectQuery)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching purchase orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch purchase orders', details: error.message },
        { status: 500 }
      );
    }

    // Type assertion for the data array
    interface PurchaseOrderRecord {
      id: string;
      status: string;
      total_amount: number | null;
      [key: string]: unknown;
    }
    const purchaseOrders = (data || []) as unknown as PurchaseOrderRecord[];

    // Calculate summary statistics
    const summary = {
      total: purchaseOrders.length,
      by_status: {
        draft: purchaseOrders.filter(po => po.status === 'draft').length,
        pending_approval: purchaseOrders.filter(po => po.status === 'pending_approval').length,
        approved: purchaseOrders.filter(po => po.status === 'approved').length,
        ordered: purchaseOrders.filter(po => po.status === 'ordered').length,
        partially_received: purchaseOrders.filter(po => po.status === 'partially_received').length,
        received: purchaseOrders.filter(po => po.status === 'received').length,
        cancelled: purchaseOrders.filter(po => po.status === 'cancelled').length,
      },
      total_value: purchaseOrders
        .filter(po => !['draft', 'cancelled'].includes(po.status))
        .reduce((sum, po) => sum + Number(po.total_amount || 0), 0),
      pending_approval_value: purchaseOrders
        .filter(po => po.status === 'pending_approval')
        .reduce((sum, po) => sum + Number(po.total_amount || 0), 0),
    };

    return NextResponse.json({
      purchase_orders: data,
      summary,
    });
  } catch (error) {
    console.error('Error in GET /api/purchase-orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/purchase-orders - Create new purchase order
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const validated = PurchaseOrderSchema.parse(body);

    // TODO: Get from auth session
    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    // Generate PO number
    const { data: poNumber } = await supabase.rpc('generate_po_number', {
      org_id: organizationId,
    });

    // Create purchase order
    const { data: purchaseOrder, error: poError } = await supabase
      .from('purchase_orders')
      .insert({
        po_number: poNumber,
        organization_id: organizationId,
        vendor_id: validated.vendor_id,
        project_id: validated.project_id,
        description: validated.description,
        category: validated.category,
        priority: validated.priority,
        status: 'draft',
        requested_by: userId,
        requested_delivery_date: validated.requested_delivery_date,
        shipping_address: validated.shipping_address,
        notes: validated.notes,
        internal_notes: validated.internal_notes,
        tags: validated.tags,
      })
      .select(`
        *,
        vendor:vendors(id, name, email),
        requested_by_user:platform_users!requested_by(id, full_name)
      `)
      .single();

    if (poError) {
      console.error('Error creating purchase order:', poError);
      return NextResponse.json(
        { error: 'Failed to create purchase order', details: poError.message },
        { status: 500 }
      );
    }

    // Add line items if provided
    if (body.line_items && Array.isArray(body.line_items) && body.line_items.length > 0) {
      const validatedItems = body.line_items.map((item: any) => LineItemSchema.parse(item));
      
      const lineItemsToInsert = validatedItems.map((item: any, index: number) => {
        const lineTotal = item.quantity * item.unit_price;
        const taxAmount = lineTotal * (item.tax_rate || 0) / 100;
        return {
          purchase_order_id: purchaseOrder.id,
          item_name: item.item_name,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          unit_of_measure: item.unit_of_measure,
          tax_rate: item.tax_rate,
          tax_amount: taxAmount,
          discount_amount: item.discount_amount,
          line_total: lineTotal - item.discount_amount + taxAmount,
          sort_order: index,
        };
      });

      const { error: itemsError } = await supabase
        .from('purchase_order_line_items')
        .insert(lineItemsToInsert);

      if (itemsError) {
        console.error('Error adding line items:', itemsError);
      }

      // Update PO totals
      const subtotal = lineItemsToInsert.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.unit_price), 0);
      const totalTax = lineItemsToInsert.reduce((sum: number, item: any) => 
        sum + item.tax_amount, 0);
      const totalDiscount = lineItemsToInsert.reduce((sum: number, item: any) => 
        sum + item.discount_amount, 0);

      await supabase
        .from('purchase_orders')
        .update({
          subtotal,
          tax_amount: totalTax,
          discount_amount: totalDiscount,
          total_amount: subtotal + totalTax - totalDiscount,
        })
        .eq('id', purchaseOrder.id);
    }

    // Log activity
    await supabase.from('purchase_order_activity_log').insert({
      purchase_order_id: purchaseOrder.id,
      activity_type: 'created',
      user_id: userId,
      description: 'Purchase order created',
    });

    return NextResponse.json(purchaseOrder, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/purchase-orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
