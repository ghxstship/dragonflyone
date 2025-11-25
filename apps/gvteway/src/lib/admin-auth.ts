import { env } from "./env";

export function authorizeAdminRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.slice("Bearer ".length);
  return token === env.ADMIN_API_TOKEN;
}
