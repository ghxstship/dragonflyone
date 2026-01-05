import type { ReactNode } from "react";

export interface ProtectedRouteProps {
  children: ReactNode;
  /** Custom hook that returns user and loading state */
  useAuth: () => { user: unknown | null; loading: boolean };
  /** Path to redirect to when not authenticated */
  redirectPath?: string;
  /** Custom loading text */
  loadingText?: string;
  /** Router push function for navigation */
  onUnauthenticated?: (path: string) => void;
}
