import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.6";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60000, // 1 minute
};

export async function checkRateLimit(
  userId: string,
  endpoint: string,
  supabaseUrl: string,
  supabaseKey: string,
  config: Partial<RateLimitConfig> = {}
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const { maxRequests, windowMs } = { ...defaultConfig, ...config };
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);
  
  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_user_id: userId,
    p_endpoint: endpoint,
    p_max_requests: maxRequests,
    p_window_minutes: Math.floor(windowMs / 60000),
  });
  
  if (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, remaining: maxRequests, resetAt: new Date(Date.now() + windowMs) };
  }
  
  const allowed = data as boolean;
  
  const { data: currentLimit } = await supabase
    .from('api_rate_limits')
    .select('request_count')
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .eq('window_start', windowStart.toISOString())
    .single();
  
  const currentCount = currentLimit?.request_count || 0;
  const remaining = Math.max(0, maxRequests - currentCount);
  const resetAt = new Date(windowStart.getTime() + windowMs);
  
  return { allowed, remaining, resetAt };
}

export function createRateLimitResponse(remaining: number, resetAt: Date): Headers {
  const headers = new Headers();
  headers.set('X-RateLimit-Remaining', remaining.toString());
  headers.set('X-RateLimit-Reset', Math.floor(resetAt.getTime() / 1000).toString());
  return headers;
}

export function rateLimitExceededResponse(resetAt: Date): Response {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((resetAt.getTime() - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil((resetAt.getTime() - Date.now()) / 1000).toString(),
      },
    }
  );
}
