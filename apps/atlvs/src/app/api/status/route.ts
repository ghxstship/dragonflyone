import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance';
  latency?: number;
  lastChecked: string;
}

async function checkDatabaseStatus(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const { error } = await supabase.from('platform_users').select('id').limit(1);
    const latency = Date.now() - start;
    
    return {
      name: 'Database',
      status: error ? 'degraded' : latency > 1000 ? 'degraded' : 'operational',
      latency,
      lastChecked: new Date().toISOString(),
    };
  } catch {
    return {
      name: 'Database',
      status: 'major_outage',
      lastChecked: new Date().toISOString(),
    };
  }
}

async function checkAuthStatus(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const { error } = await supabase.auth.getSession();
    const latency = Date.now() - start;
    
    return {
      name: 'Authentication',
      status: error ? 'degraded' : latency > 500 ? 'degraded' : 'operational',
      latency,
      lastChecked: new Date().toISOString(),
    };
  } catch {
    return {
      name: 'Authentication',
      status: 'major_outage',
      lastChecked: new Date().toISOString(),
    };
  }
}

async function checkStorageStatus(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const { error } = await supabase.storage.listBuckets();
    const latency = Date.now() - start;
    
    return {
      name: 'Storage',
      status: error ? 'degraded' : latency > 1000 ? 'degraded' : 'operational',
      latency,
      lastChecked: new Date().toISOString(),
    };
  } catch {
    return {
      name: 'Storage',
      status: 'degraded',
      lastChecked: new Date().toISOString(),
    };
  }
}

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const startTime = Date.now();
  
  // Run all checks in parallel
  const [database, auth, storage] = await Promise.all([
    checkDatabaseStatus(),
    checkAuthStatus(),
    checkStorageStatus(),
  ]);
  
  const services = { database, auth, storage };
  const statuses = Object.values(services).map(s => s.status);
  
  // Determine overall status
  let overall: 'operational' | 'degraded' | 'partial_outage' | 'major_outage' = 'operational';
  
  if (statuses.some(s => s === 'major_outage')) {
    overall = 'major_outage';
  } else if (statuses.some(s => s === 'partial_outage')) {
    overall = 'partial_outage';
  } else if (statuses.some(s => s === 'degraded')) {
    overall = 'degraded';
  }
  
  // Get active incidents from database
  const { data: incidents } = await supabase
    .from('system_incidents')
    .select('*')
    .in('status', ['investigating', 'identified', 'monitoring'])
    .order('created_at', { ascending: false })
    .limit(5);
  
  // Get upcoming maintenance
  const { data: maintenance } = await supabase
    .from('maintenance_windows')
    .select('*')
    .eq('status', 'scheduled')
    .gt('scheduled_start', new Date().toISOString())
    .order('scheduled_start')
    .limit(5);
  
  const totalLatency = Date.now() - startTime;
  
  return NextResponse.json({
    status: overall,
    services,
    incidents: incidents || [],
    maintenance: maintenance || [],
    meta: {
      timestamp: new Date().toISOString(),
      responseTime: totalLatency,
      version: process.env.npm_package_version || '1.0.0',
    },
  });
}
