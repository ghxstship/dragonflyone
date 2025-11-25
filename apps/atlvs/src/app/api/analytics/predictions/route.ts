import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const predictionRequestSchema = z.object({
  model_type: z.enum(['revenue_forecast', 'demand_forecast', 'churn_prediction', 'ticket_sales', 'resource_optimization']),
  target_date: z.string(),
  dimension_key: z.string().optional(),
  dimension_value: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id, organization_id, platform_roles')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const model_type = searchParams.get('model_type');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    // Get active models
    let modelsQuery = supabase
      .from('predictive_models')
      .select('*')
      .eq('organization_id', platformUser.organization_id)
      .eq('status', 'active');

    if (model_type) {
      modelsQuery = modelsQuery.eq('model_type', model_type);
    }

    const { data: models } = await modelsQuery;

    if (!models || models.length === 0) {
      return NextResponse.json({
        data: [],
        message: 'No active predictive models found',
      });
    }

    // Get predictions for active models
    let predictionsQuery = supabase
      .from('predictions')
      .select(`
        *,
        model:predictive_models(id, name, model_type, accuracy)
      `)
      .in('model_id', models.map(m => m.id));

    if (start_date) {
      predictionsQuery = predictionsQuery.gte('target_date', start_date);
    }
    if (end_date) {
      predictionsQuery = predictionsQuery.lte('target_date', end_date);
    }

    const { data: predictions, error } = await predictionsQuery
      .order('target_date', { ascending: true });

    if (error) throw error;

    // Group predictions by model
    const groupedPredictions = models.map(model => ({
      model,
      predictions: predictions?.filter(p => p.model_id === model.id) || [],
    }));

    return NextResponse.json({ data: groupedPredictions });
  } catch (error) {
    console.error('Get predictions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}

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

    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id, organization_id, platform_roles')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = predictionRequestSchema.parse(body);

    // Find active model of the requested type
    const { data: model } = await supabase
      .from('predictive_models')
      .select('*')
      .eq('organization_id', platformUser.organization_id)
      .eq('model_type', validated.model_type)
      .eq('status', 'active')
      .single();

    if (!model) {
      return NextResponse.json(
        { error: 'No active model found for this prediction type' },
        { status: 404 }
      );
    }

    // Generate prediction (simplified - in production, this would call an ML service)
    const prediction = await generatePrediction(model, validated, platformUser.organization_id);

    // Store prediction
    const { data, error } = await supabase
      .from('predictions')
      .insert({
        model_id: model.id,
        prediction_date: new Date().toISOString().split('T')[0],
        target_date: validated.target_date,
        predicted_value: prediction.value,
        confidence_lower: prediction.lower,
        confidence_upper: prediction.upper,
        confidence_level: 0.95,
        dimension_key: validated.dimension_key,
        dimension_value: validated.dimension_value,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Generate prediction error:', error);
    return NextResponse.json(
      { error: 'Failed to generate prediction' },
      { status: 500 }
    );
  }
}

async function generatePrediction(
  model: { model_type: string; hyperparameters: Record<string, unknown> },
  request: { model_type: string; target_date: string },
  organizationId: string
): Promise<{ value: number; lower: number; upper: number }> {
  // Simplified prediction logic - in production, this would call an ML service
  // For now, we'll use historical data to generate a basic forecast
  
  const targetDate = new Date(request.target_date);
  const dayOfWeek = targetDate.getDay();
  const month = targetDate.getMonth();
  
  let baseValue = 0;
  let variance = 0;
  
  switch (model.model_type) {
    case 'revenue_forecast':
      // Get average daily revenue from recent data
      const { data: revenueData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('organization_id', organizationId)
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
      
      baseValue = (revenueData?.reduce((sum, t) => sum + (t.amount || 0), 0) ?? 0) / 90 || 10000;
      variance = baseValue * 0.2;
      
      // Apply seasonality
      if ([5, 6].includes(dayOfWeek)) baseValue *= 1.3; // Weekend boost
      if ([10, 11].includes(month)) baseValue *= 1.5; // Holiday season
      break;
      
    case 'ticket_sales':
      baseValue = 150;
      variance = 50;
      if ([5, 6].includes(dayOfWeek)) baseValue *= 2;
      break;
      
    case 'demand_forecast':
      baseValue = 1000;
      variance = 200;
      break;
      
    default:
      baseValue = 100;
      variance = 20;
  }
  
  // Add some randomness
  const randomFactor = 0.9 + Math.random() * 0.2;
  const predictedValue = baseValue * randomFactor;
  
  return {
    value: Math.round(predictedValue * 100) / 100,
    lower: Math.round((predictedValue - variance) * 100) / 100,
    upper: Math.round((predictedValue + variance) * 100) / 100,
  };
}
