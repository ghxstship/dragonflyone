import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  error?: string;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const checks: Record<string, HealthCheck> = {};
  
  // Database health check
  try {
    const dbStart = Date.now();
    const { error } = await supabase.from('events').select('id').limit(1);
    const dbLatency = Date.now() - dbStart;
    
    checks.database = {
      status: error ? 'unhealthy' : dbLatency > 1000 ? 'degraded' : 'healthy',
      latency: dbLatency,
      error: error?.message,
    };
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
  
  // Auth service health check
  try {
    const authStart = Date.now();
    const { error } = await supabase.auth.getSession();
    const authLatency = Date.now() - authStart;
    
    checks.auth = {
      status: error ? 'degraded' : authLatency > 500 ? 'degraded' : 'healthy',
      latency: authLatency,
    };
  } catch (error) {
    checks.auth = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
  
  // Stripe health check (if configured)
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const stripeStart = Date.now();
      // Simple check - just verify key format
      const isValidKey = process.env.STRIPE_SECRET_KEY.startsWith('sk_');
      const stripeLatency = Date.now() - stripeStart;
      
      checks.stripe = {
        status: isValidKey ? 'healthy' : 'degraded',
        latency: stripeLatency,
      };
    } catch (error) {
      checks.stripe = {
        status: 'degraded',
        error: 'Stripe configuration issue',
      };
    }
  }
  
  const statuses = Object.values(checks).map(c => c.status);
  const overallStatus = statuses.includes('unhealthy') 
    ? 'unhealthy' 
    : statuses.includes('degraded') 
      ? 'degraded' 
      : 'healthy';
  
  const totalLatency = Date.now() - startTime;
  
  return NextResponse.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    latency: totalLatency,
    platform: 'gvteway',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    checks,
  }, { status: overallStatus === 'unhealthy' ? 503 : 200 });
}
