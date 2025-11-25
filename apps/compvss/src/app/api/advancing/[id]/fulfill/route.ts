import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const fulfillItemSchema = z.object({
  item_id: z.string().uuid(),
  quantity_fulfilled: z.number().positive(),
  notes: z.string().optional(),
});

const fulfillAdvanceSchema = z.object({
  items: z.array(fulfillItemSchema),
  fulfillment_notes: z.string().optional(),
  actual_cost: z.number().optional(),
});

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { id } = context.params;
      const payload = context.validated;
      const userId = context.user?.id;

      // Check if advance exists and is approved
      const { data: advance, error: fetchError } = await supabase
        .from('production_advances')
        .select('*, items:production_advance_items(*)')
        .eq('id', id)
        .single();

      if (fetchError || !advance) {
        return NextResponse.json({ error: 'Advance not found' }, { status: 404 });
      }

      if (advance.status !== 'approved' && advance.status !== 'in_progress') {
        return NextResponse.json({ 
          error: 'Advance must be approved before fulfillment' 
        }, { status: 400 });
      }

      // Update each item's fulfillment status
      for (const itemUpdate of payload.items) {
        const item = advance.items.find((i: any) => i.id === itemUpdate.item_id);
        
        if (!item) {
          continue; // Skip items that don't exist
        }

        const newQuantityFulfilled = (item.quantity_fulfilled || 0) + itemUpdate.quantity_fulfilled;
        const fulfillmentStatus = newQuantityFulfilled >= item.quantity ? 'complete' : 'partial';

        await supabase
          .from('production_advance_items')
          .update({
            quantity_fulfilled: newQuantityFulfilled,
            fulfillment_status: fulfillmentStatus,
            notes: itemUpdate.notes || item.notes,
          })
          .eq('id', itemUpdate.item_id);
      }

      // Check if all items are fulfilled
      const { data: updatedItems } = await supabase
        .from('production_advance_items')
        .select('fulfillment_status')
        .eq('advance_id', id);

      const allFulfilled = updatedItems?.every((item: any) => item.fulfillment_status === 'complete');
      const someFulfilled = updatedItems?.some((item: any) => item.fulfillment_status !== 'pending');

      // Update advance status
      const newStatus = allFulfilled ? 'fulfilled' : (someFulfilled ? 'in_progress' : 'approved');
      
      const { data: updatedAdvance, error: updateError } = await supabase
        .from('production_advances')
        .update({
          status: newStatus,
          fulfilled_by: userId,
          fulfilled_at: allFulfilled ? new Date().toISOString() : null,
          fulfillment_notes: payload.fulfillment_notes,
          actual_cost: payload.actual_cost || advance.actual_cost,
        })
        .eq('id', id)
        .select(`
          *,
          items:production_advance_items(*)
        `)
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ 
        advance: updatedAdvance,
        message: allFulfilled ? 'Advance fully fulfilled' : 'Advance partially fulfilled'
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN],
    validation: fulfillAdvanceSchema,
    rateLimit: { maxRequests: 30, windowMs: 60000 },
    audit: { action: 'advancing:fulfill', resource: 'advancing' },
  }
);
