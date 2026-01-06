import { createBrowserClient, createServerClient, type TypedSupabaseClient } from './auth-helpers';

let _browserClient: TypedSupabaseClient | null = null;
let _serverClient: TypedSupabaseClient | null = null;

/**
 * Check if Supabase environment variables are configured.
 * Returns true if both URL and anon key are present and valid.
 */
export function isSupabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
}

/**
 * Check if Supabase server environment variables are configured.
 * Returns true if URL and service role key are present and valid.
 */
export function isSupabaseServerConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return !!(supabaseUrl && serviceRoleKey && supabaseUrl.startsWith('http'));
}

function getBrowserClient(): TypedSupabaseClient {
  if (_browserClient) return _browserClient;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  // Validate environment variables before creating client
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing environment variables. Authentication features will be unavailable.');
    // Return a mock client that won't throw but will fail gracefully
    return createMockClient();
  }
  
  try {
    _browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
    return _browserClient;
  } catch (error) {
    console.error('[Supabase] Failed to create browser client:', error);
    return createMockClient();
  }
}

/**
 * Create a mock Supabase client for when env vars are missing.
 * This prevents 500 errors and allows pages to render gracefully.
 */
function createMockClient(): TypedSupabaseClient {
  const mockAuth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
    signInWithOAuth: async () => ({ data: { provider: '', url: '' }, error: new Error('Supabase not configured') }),
    signUp: async () => ({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: new Error('Supabase not configured') }),
    updateUser: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  };

  const mockFrom = () => ({
    select: () => ({ data: null, error: new Error('Supabase not configured'), single: async () => ({ data: null, error: new Error('Supabase not configured') }) }),
    insert: async () => ({ data: null, error: new Error('Supabase not configured') }),
    update: async () => ({ data: null, error: new Error('Supabase not configured') }),
    delete: async () => ({ data: null, error: new Error('Supabase not configured') }),
    eq: () => mockFrom(),
    neq: () => mockFrom(),
    single: async () => ({ data: null, error: new Error('Supabase not configured') }),
  });

  return {
    auth: mockAuth,
    from: mockFrom,
    rpc: async () => ({ data: null, error: new Error('Supabase not configured') }),
    storage: { from: () => ({ upload: async () => ({ data: null, error: new Error('Supabase not configured') }) }) },
    channel: () => ({ on: () => ({ subscribe: () => ({}) }), unsubscribe: () => {} }),
    removeChannel: () => {},
  } as unknown as TypedSupabaseClient;
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
  
  // Validate environment variables before creating client
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('[Supabase] Missing server environment variables. Server-side authentication will be unavailable.');
    return createMockClient();
  }
  
  try {
    _serverClient = createServerClient(supabaseUrl, serviceRoleKey);
    return _serverClient;
  } catch (error) {
    console.error('[Supabase] Failed to create server client:', error);
    return createMockClient();
  }
}

export * from './auth-helpers';
export * from './supabase-types';
