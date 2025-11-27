import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

const pricingRuleSchema = z.object({
  event_id: z.string().uuid(),
  ticket_type_id: z.string().uuid(),
  strategy: z.enum(['demand_based', 'time_based', 'inventory_based', 'hybrid']),
  base_price: z.number().positive(),
  min_price: z.number().positive(),
  max_price: z.number().positive(),
  rules: z.object({
    demand_multiplier: z.number().optional(),
    time_factors: z.array(z.object({
      days_before_event: z.number(),
      price_multiplier: z.number()
    })).optional(),
    inventory_thresholds: z.array(z.object({
      percentage_sold: z.number().min(0).max(100),
      price_multiplier: z.number()
    })).optional(),
    surge_pricing: z.object({
      enabled: z.boolean(),
      threshold_purchases_per_hour: z.number().optional(),
      max_surge_multiplier: z.number().optional()
    }).optional()
  }),
  active: z.boolean().default(true)
});

// GET - Calculate dynamic price for ticket type
export const GET = apiRoute(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const event_id = searchParams.get('event_id');
    const ticket_type_id = searchParams.get('ticket_type_id');

    if (!event_id || !ticket_type_id) {
      return NextResponse.json({ 
        error: 'event_id and ticket_type_id are required' 
      }, { status: 400 });
    }

    // Fetch pricing rule
    const { data: rule, error: ruleError } = await supabase
      .from('dynamic_pricing_rules')
      .select('*')
      .eq('event_id', event_id)
      .eq('ticket_type_id', ticket_type_id)
      .eq('active', true)
      .single();

    if (ruleError || !rule) {
      // No dynamic pricing, return base price
      const { data: ticketType } = await supabase
        .from('ticket_types')
        .select('price')
        .eq('id', ticket_type_id)
        .single();

      return NextResponse.json({
        dynamic_pricing: false,
        price: ticketType?.price || 0,
        base_price: ticketType?.price || 0
      });
    }

    // Calculate dynamic price based on strategy
    const price = await calculateDynamicPrice(rule, event_id, ticket_type_id);

    return NextResponse.json({
      dynamic_pricing: true,
      price: price.final_price,
      base_price: rule.base_price,
      factors: price.factors,
      strategy: rule.strategy
    });
  },
  {
    auth: false, // Public endpoint for pricing
    audit: { action: 'pricing:calculate', resource: 'dynamic_pricing' }
  }
);

// POST - Create dynamic pricing rule
export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const validated = pricingRuleSchema.parse(body);

    // Validate that max_price >= base_price >= min_price
    if (validated.max_price < validated.base_price || validated.base_price < validated.min_price) {
      return NextResponse.json({
        error: 'Invalid price range: max_price >= base_price >= min_price'
      }, { status: 400 });
    }

    const { data: rule, error } = await supabase
      .from('dynamic_pricing_rules')
      .insert({
        ...validated,
        created_by: context.user.id
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      rule,
      message: 'Dynamic pricing rule created successfully'
    }, { status: 201 });
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR],
    validation: pricingRuleSchema,
    audit: { action: 'pricing:create', resource: 'dynamic_pricing' }
  }
);

// Helper function to calculate dynamic price
async function calculateDynamicPrice(rule: any, eventId: string, ticketTypeId: string) {
  const factors: any = {};
  let priceMultiplier = 1.0;

  // Get event and ticket data
  const { data: event } = await supabase
    .from('events')
    .select('*, ticket_types!inner(*)')
    .eq('id', eventId)
    .eq('ticket_types.id', ticketTypeId)
    .single();

  if (!event) {
    return { final_price: rule.base_price, factors };
  }

  const ticketType = event.ticket_types[0];
  const totalCapacity = ticketType.quantity;
  const sold = ticketType.sold || 0;
  const percentageSold = (sold / totalCapacity) * 100;

  // Time-based pricing
  if (rule.strategy === 'time_based' || rule.strategy === 'hybrid') {
    const daysUntilEvent = Math.ceil(
      (new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    if (rule.rules.time_factors) {
      // Find applicable time factor
      const sortedFactors = [...rule.rules.time_factors].sort((a, b) => 
        b.days_before_event - a.days_before_event
      );

      for (const factor of sortedFactors) {
        if (daysUntilEvent <= factor.days_before_event) {
          priceMultiplier *= factor.price_multiplier;
          factors.time_based = {
            days_until_event: daysUntilEvent,
            multiplier: factor.price_multiplier
          };
          break;
        }
      }
    }
  }

  // Inventory-based pricing
  if (rule.strategy === 'inventory_based' || rule.strategy === 'hybrid') {
    if (rule.rules.inventory_thresholds) {
      // Find applicable inventory threshold
      const sortedThresholds = [...rule.rules.inventory_thresholds].sort((a, b) => 
        b.percentage_sold - a.percentage_sold
      );

      for (const threshold of sortedThresholds) {
        if (percentageSold >= threshold.percentage_sold) {
          priceMultiplier *= threshold.price_multiplier;
          factors.inventory_based = {
            percentage_sold: percentageSold.toFixed(1),
            multiplier: threshold.price_multiplier
          };
          break;
        }
      }
    }
  }

  // Demand-based pricing (surge pricing)
  if (rule.strategy === 'demand_based' || rule.strategy === 'hybrid') {
    if (rule.rules.surge_pricing?.enabled) {
      // Calculate recent purchase velocity
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .gte('created_at', oneHourAgo);

      const purchasesPerHour = count || 0;
      const threshold = rule.rules.surge_pricing.threshold_purchases_per_hour || 10;

      if (purchasesPerHour >= threshold) {
        const surgeMultiplier = Math.min(
          1 + ((purchasesPerHour - threshold) / threshold) * 0.1,
          rule.rules.surge_pricing.max_surge_multiplier || 2.0
        );
        priceMultiplier *= surgeMultiplier;
        factors.surge_pricing = {
          purchases_per_hour: purchasesPerHour,
          multiplier: surgeMultiplier
        };
      }
    }

    // Apply general demand multiplier
    if (rule.rules.demand_multiplier) {
      priceMultiplier *= rule.rules.demand_multiplier;
      factors.demand_multiplier = rule.rules.demand_multiplier;
    }
  }

  // Calculate final price with constraints
  let finalPrice = rule.base_price * priceMultiplier;
  finalPrice = Math.max(rule.min_price, Math.min(rule.max_price, finalPrice));
  
  // Round to 2 decimal places
  finalPrice = Math.round(finalPrice * 100) / 100;

  return {
    final_price: finalPrice,
    factors
  };
}

// PUT - Update dynamic pricing rule
export const PUT = apiRoute(
  async (request: NextRequest) => {
    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('dynamic_pricing_rules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      rule: data,
      message: 'Pricing rule updated successfully'
    });
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN],
    audit: { action: 'pricing:update', resource: 'dynamic_pricing' }
  }
);
