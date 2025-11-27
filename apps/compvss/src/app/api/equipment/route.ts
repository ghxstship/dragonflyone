import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const EquipmentSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['lighting', 'audio', 'video', 'staging', 'rigging', 'power', 'cables', 'cases', 'other']),
  subcategory: z.string().optional(),
  serial_number: z.string().optional(),
  barcode: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  location: z.string(),
  warehouse_id: z.string().uuid().optional(),
  status: z.enum(['available', 'checked_out', 'maintenance', 'repair', 'retired', 'lost']).default('available'),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  purchase_date: z.string().optional(),
  purchase_price: z.number().nonnegative().optional(),
  current_value: z.number().nonnegative().optional(),
  rental_rate_daily: z.number().nonnegative().optional(),
  rental_rate_weekly: z.number().nonnegative().optional(),
  weight_kg: z.number().nonnegative().optional(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
  power_requirements: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/equipment - List equipment
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const warehouseId = searchParams.get('warehouse_id');
    const search = searchParams.get('search');
    const assignedTo = searchParams.get('assigned_to');

    let query = supabase
      .from('equipment')
      .select(`
        *,
        warehouse:warehouses(id, name, location),
        current_checkout:equipment_checkouts(
          id,
          project_id,
          checked_out_by,
          checkout_date,
          expected_return_date,
          project:projects(id, name)
        )
      `)
      .order('name', { ascending: true });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,serial_number.ilike.%${search}%,barcode.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching equipment:', error);
      return NextResponse.json(
        { error: 'Failed to fetch equipment', details: error.message },
        { status: 500 }
      );
    }

    interface EquipmentRecord {
      id: string;
      status: string;
      category: string;
      current_value: number;
      [key: string]: unknown;
    }
    const equipment = (data || []) as unknown as EquipmentRecord[];

    const summary = {
      total: equipment.length,
      by_status: {
        available: equipment.filter(e => e.status === 'available').length,
        checked_out: equipment.filter(e => e.status === 'checked_out').length,
        maintenance: equipment.filter(e => e.status === 'maintenance').length,
        repair: equipment.filter(e => e.status === 'repair').length,
        retired: equipment.filter(e => e.status === 'retired').length,
      },
      by_category: equipment.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      total_value: equipment.reduce((sum, e) => sum + (e.current_value || 0), 0),
    };

    return NextResponse.json({ equipment: data, summary });
  } catch (error) {
    console.error('Error in GET /api/equipment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/equipment - Create equipment
export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const validated = EquipmentSchema.parse(body);

    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    const { data: equipment, error } = await supabase
      .from('equipment')
      .insert({
        organization_id: organizationId,
        ...validated,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating equipment:', error);
      return NextResponse.json(
        { error: 'Failed to create equipment', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(equipment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in POST /api/equipment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/equipment - Update equipment or checkout/checkin
export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const { equipment_id, action, updates } = body;
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    if (!equipment_id) {
      return NextResponse.json({ error: 'equipment_id is required' }, { status: 400 });
    }

    if (action === 'checkout') {
      const { project_id, expected_return_date, notes } = updates || {};

      // Create checkout record
      const { data: checkout, error: checkoutError } = await supabase
        .from('equipment_checkouts')
        .insert({
          equipment_id,
          project_id,
          checked_out_by: userId,
          checkout_date: new Date().toISOString(),
          expected_return_date,
          notes,
          status: 'active',
        })
        .select()
        .single();

      if (checkoutError) {
        return NextResponse.json(
          { error: 'Failed to checkout equipment', details: checkoutError.message },
          { status: 500 }
        );
      }

      // Update equipment status
      await supabase
        .from('equipment')
        .update({ status: 'checked_out', updated_at: new Date().toISOString() })
        .eq('id', equipment_id);

      return NextResponse.json({ success: true, checkout });
    }

    if (action === 'checkin') {
      const { condition, notes, damage_notes } = updates || {};

      // Close active checkout
      await supabase
        .from('equipment_checkouts')
        .update({
          return_date: new Date().toISOString(),
          returned_by: userId,
          return_condition: condition,
          return_notes: notes,
          damage_notes,
          status: 'returned',
        })
        .eq('equipment_id', equipment_id)
        .eq('status', 'active');

      // Update equipment status
      const newStatus = damage_notes ? 'repair' : 'available';
      await supabase
        .from('equipment')
        .update({
          status: newStatus,
          condition,
          updated_at: new Date().toISOString(),
        })
        .eq('id', equipment_id);

      return NextResponse.json({ success: true, message: 'Equipment checked in' });
    }

    if (action === 'maintenance') {
      await supabase
        .from('equipment')
        .update({
          status: 'maintenance',
          last_maintenance_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', equipment_id);

      // Create maintenance record
      await supabase.from('equipment_maintenance').insert({
        equipment_id,
        maintenance_type: updates?.maintenance_type || 'routine',
        description: updates?.description,
        performed_by: userId,
        scheduled_date: new Date().toISOString(),
        status: 'in_progress',
      });

      return NextResponse.json({ success: true, message: 'Equipment sent to maintenance' });
    }

    // Regular update
    if (updates) {
      const { data, error } = await supabase
        .from('equipment')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', equipment_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update equipment', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, equipment: data });
    }

    return NextResponse.json({ error: 'No action specified' }, { status: 400 });
  } catch (error) {
    console.error('Error in PATCH /api/equipment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
