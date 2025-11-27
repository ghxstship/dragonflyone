import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const RentalEquipmentSchema = z.object({
  vendor_id: z.string().uuid(),
  name: z.string(),
  category: z.string(),
  description: z.string().optional(),
  daily_rate: z.number().positive(),
  weekly_rate: z.number().positive().optional(),
  monthly_rate: z.number().positive().optional(),
  deposit_amount: z.number().optional(),
  specifications: z.record(z.any()).optional(),
  availability_status: z.enum(['available', 'rented', 'maintenance', 'reserved']).default('available'),
  quantity_available: z.number().int().positive().default(1),
  minimum_rental_days: z.number().int().positive().default(1),
  insurance_required: z.boolean().default(false),
  delivery_available: z.boolean().default(false),
  delivery_fee: z.number().optional(),
});

const RentalBookingSchema = z.object({
  equipment_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  start_date: z.string(),
  end_date: z.string(),
  quantity: z.number().int().positive().default(1),
  delivery_address: z.string().optional(),
  notes: z.string().optional(),
  insurance_option: z.enum(['none', 'basic', 'premium']).default('none'),
});

// GET /api/rental-equipment - Get rental equipment catalog
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const vendorId = searchParams.get('vendor_id');
    const search = searchParams.get('search');
    const availableOnly = searchParams.get('available_only') === 'true';
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('rental_equipment')
      .select(`
        *,
        vendor:vendors(id, name, contact_email, phone)
      `, { count: 'exact' })
      .order('name')
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    if (availableOnly) {
      query = query.eq('availability_status', 'available');
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: equipment, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Check availability for date range if provided
    let availableEquipment = equipment;
    if (startDate && endDate && equipment) {
      const { data: bookings } = await supabase
        .from('rental_bookings')
        .select('equipment_id, quantity')
        .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
        .in('status', ['confirmed', 'active']);

      const bookedQuantities: Record<string, number> = {};
      bookings?.forEach(b => {
        bookedQuantities[b.equipment_id] = (bookedQuantities[b.equipment_id] || 0) + b.quantity;
      });

      availableEquipment = equipment.map(e => ({
        ...e,
        available_quantity: Math.max(0, e.quantity_available - (bookedQuantities[e.id] || 0)),
      }));
    }

    // Get categories for filtering
    const { data: categories } = await supabase
      .from('rental_equipment')
      .select('category')
      .order('category');

    const uniqueCategories = [...new Set(categories?.map(c => c.category))];

    return NextResponse.json({
      equipment: availableEquipment || [],
      total: count || 0,
      categories: uniqueCategories,
      limit,
      offset,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rental equipment' }, { status: 500 });
  }
}

// POST /api/rental-equipment - Create rental equipment or booking
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
    const action = body.action || 'create_equipment';

    if (action === 'create_booking') {
      const validated = RentalBookingSchema.parse(body);

      // Check availability
      const { data: equipment } = await supabase
        .from('rental_equipment')
        .select('*')
        .eq('id', validated.equipment_id)
        .single();

      if (!equipment) {
        return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
      }

      // Check for conflicting bookings
      const { data: existingBookings } = await supabase
        .from('rental_bookings')
        .select('quantity')
        .eq('equipment_id', validated.equipment_id)
        .or(`start_date.lte.${validated.end_date},end_date.gte.${validated.start_date}`)
        .in('status', ['confirmed', 'active']);

      const bookedQuantity = existingBookings?.reduce((sum, b) => sum + b.quantity, 0) || 0;
      const availableQuantity = equipment.quantity_available - bookedQuantity;

      if (validated.quantity > availableQuantity) {
        return NextResponse.json({ 
          error: 'Insufficient availability',
          available_quantity: availableQuantity,
        }, { status: 400 });
      }

      // Calculate rental cost
      const startDate = new Date(validated.start_date);
      const endDate = new Date(validated.end_date);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let totalCost = 0;
      if (days >= 30 && equipment.monthly_rate) {
        const months = Math.floor(days / 30);
        const remainingDays = days % 30;
        totalCost = (months * equipment.monthly_rate + remainingDays * equipment.daily_rate) * validated.quantity;
      } else if (days >= 7 && equipment.weekly_rate) {
        const weeks = Math.floor(days / 7);
        const remainingDays = days % 7;
        totalCost = (weeks * equipment.weekly_rate + remainingDays * equipment.daily_rate) * validated.quantity;
      } else {
        totalCost = days * equipment.daily_rate * validated.quantity;
      }

      // Add insurance cost
      let insuranceCost = 0;
      if (validated.insurance_option === 'basic') {
        insuranceCost = totalCost * 0.05;
      } else if (validated.insurance_option === 'premium') {
        insuranceCost = totalCost * 0.1;
      }

      // Add delivery fee
      const deliveryFee = validated.delivery_address && equipment.delivery_available ? (equipment.delivery_fee || 0) : 0;

      const { data: booking, error } = await supabase
        .from('rental_bookings')
        .insert({
          equipment_id: validated.equipment_id,
          project_id: validated.project_id,
          user_id: user.id,
          start_date: validated.start_date,
          end_date: validated.end_date,
          quantity: validated.quantity,
          daily_rate: equipment.daily_rate,
          total_days: days,
          subtotal: totalCost,
          insurance_option: validated.insurance_option,
          insurance_cost: insuranceCost,
          delivery_address: validated.delivery_address,
          delivery_fee: deliveryFee,
          deposit_amount: equipment.deposit_amount || 0,
          total_cost: totalCost + insuranceCost + deliveryFee,
          notes: validated.notes,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ booking }, { status: 201 });
    } else {
      // Create equipment
      const validated = RentalEquipmentSchema.parse(body);

      const { data: equipment, error } = await supabase
        .from('rental_equipment')
        .insert({
          ...validated,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ equipment }, { status: 201 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/rental-equipment - Update equipment or booking
export async function PATCH(request: NextRequest) {
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
    const equipmentId = searchParams.get('equipment_id');
    const bookingId = searchParams.get('booking_id');

    const body = await request.json();

    if (bookingId) {
      const { data: booking, error } = await supabase
        .from('rental_bookings')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ booking });
    } else if (equipmentId) {
      const { data: equipment, error } = await supabase
        .from('rental_equipment')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq('id', equipmentId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ equipment });
    }

    return NextResponse.json({ error: 'Equipment ID or Booking ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
