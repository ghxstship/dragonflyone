import { createServerClient, PlatformRole } from "@ghxstship/config";

const GVTEWAY_ADMIN_ROLES = [
  PlatformRole.GVTEWAY_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

export async function authorizeAdminRequest(request: Request): Promise<{
  authorized: boolean;
  user?: { id: string; email?: string; platformRoles: PlatformRole[] };
}> {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    return { authorized: false };
  }

  const token = authHeader.slice("Bearer ".length);
  
  // Primary auth: Role-based using Supabase JWT
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return { authorized: false };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey);
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { authorized: false };
  }

  // Fetch user roles from database
  const { data: userData } = await supabase
    .from("platform_users")
    .select("platform_roles")
    .eq("auth_user_id", user.id)
    .single();

  const platformRoles = (userData?.platform_roles as PlatformRole[]) || [];
  
  // Check if user has admin role
  const hasAdminRole = platformRoles.some(role => GVTEWAY_ADMIN_ROLES.includes(role));
  
  if (!hasAdminRole) {
    return { authorized: false };
  }

  return {
    authorized: true,
    user: {
      id: user.id,
      email: user.email,
      platformRoles,
    },
  };
}
