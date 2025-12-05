/**
 * Client-side authentication utilities
 * Uses fetch API to call auth endpoints
 */

export const signOut = async (): Promise<void> => {
  // Call signout API endpoint
  await fetch('/api/auth/signout', { method: 'POST' });
  
  // Clear any local session data
  if (typeof window !== "undefined") {
    localStorage.removeItem("session");
    sessionStorage.clear();
    
    // Redirect to sign in page
    window.location.href = "/auth/signin";
  }
};

export const getCurrentUser = async () => {
  // Call me API endpoint to get current user
  const response = await fetch('/api/auth/me');
  if (!response.ok) return null;
  const { user } = await response.json();
  return user;
};

export const isAuthenticated = async (): Promise<boolean> => {
  // Check session via API
  const response = await fetch('/api/auth/me');
  return response.ok;
};
