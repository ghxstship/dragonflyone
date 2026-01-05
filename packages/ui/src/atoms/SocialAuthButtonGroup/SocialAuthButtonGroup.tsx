"use client";

import React from "react";
import { Github, Chrome } from "lucide-react";
import { Button } from "../Button/index.js";
import { socialAuthButtonGroupVariants } from "./SocialAuthButtonGroup.variants.js";
import type { SocialAuthButtonGroupProps, SocialAuthProvider } from "./SocialAuthButtonGroup.types.js";

/**
 * SocialAuthButtonGroup component - Bold Contemporary Pop Art Adventure
 * 
 * A group of social authentication buttons
 */
export function SocialAuthButtonGroup({
  providers,
  onProviderClick,
  className,
}: SocialAuthButtonGroupProps) {
  const getProviderInfo = (provider: SocialAuthProvider | string) => {
    if (typeof provider === 'string') {
      return { id: provider, name: provider };
    }
    return { id: provider.id, name: provider.name || provider.id };
  };

  const getIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'github':
        return <Github className="w-5 h-5" />;
      case 'google':
      case 'google-oauth':
        return <Chrome className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className={socialAuthButtonGroupVariants({ className })}>
      <div className="space-y-3">
        {providers.map((provider) => {
          const providerInfo = getProviderInfo(provider);
          return (
            <Button
              key={providerInfo.id}
              onClick={() => onProviderClick(providerInfo.id)}
              variant="outline"
              className="w-full flex items-center justify-center gap-3"
            >
              {getIcon(providerInfo.name)}
              <span className="font-mono text-sm">
                Continue with {providerInfo.name}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
