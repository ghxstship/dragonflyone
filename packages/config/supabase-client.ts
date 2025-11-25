import { createBrowserClient, createServerClient, type TypedSupabaseClient } from './auth-helpers';

let _browserClient: TypedSupabaseClient | null = null;
let _serverClient: TypedSupabaseClient | null = null;

function getBrowserClient(): TypedSupabaseClient {
  if (_browserClient) return _browserClient;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  _browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return _browserClient;
}

// Lazy-loaded browser client
export const supabase = new Proxy({} as TypedSupabaseClient, {
  get(_target, prop: keyof TypedSupabaseClient) {
    return getBrowserClient()[prop];
  },
});

export function getServerSupabase(): TypedSupabaseClient {
  if (_serverClient) return _serverClient;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  _serverClient = createServerClient(supabaseUrl, serviceRoleKey);
  return _serverClient;
}

export * from './auth-helpers';
export * from './supabase-types';
