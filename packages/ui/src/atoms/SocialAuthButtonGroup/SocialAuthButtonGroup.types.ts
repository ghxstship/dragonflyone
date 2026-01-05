export interface SocialAuthProvider {
  id: string;
  name?: string;
}

export interface SocialAuthButtonGroupProps {
  providers: (SocialAuthProvider | string)[];
  onProviderClick: (providerId: string) => void;
  loadingProvider?: string;
  direction?: "horizontal" | "vertical";
  className?: string;
}
