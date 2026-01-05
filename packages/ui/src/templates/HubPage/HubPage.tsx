"use client";

import React from "react";
import { Container } from "../../foundations/layout.js";
import { Grid, Stack } from "../../foundations/layout.js";
import { Display, Body } from "../../atoms/Typography/index.js";
import { hubPageVariants } from "./HubPage.variants.js";
import type { HubPageProps } from "./HubPage.types.js";

/**
 * HubPage component - Bold Contemporary Pop Art Adventure
 * 
 * A centralized hub page for community features with:
 * - Hero section with title and description
 * - Grid of hub cards for different features
 * - Responsive layout
 * - Consistent spacing and typography
 */
export function HubPage({
  title,
  subtitle,
  hubs,
  actions,
  className,
}: HubPageProps) {
  return (
    <div className={hubPageVariants({ className })}>
      {/* Header */}
      <header className="border-b-2 border-border bg-surface-elevated">
        <Container>
          <Stack direction="vertical" gap={24} className="py-8">
            <div className="text-center">
              <Display className="text-text-primary">{title}</Display>
              {subtitle && (
                <Body className="text-text-muted mt-2 max-w-2xl mx-auto">
                  {subtitle}
                </Body>
              )}
            </div>
            
            {actions && (
              <div className="flex justify-center gap-4">
                {actions}
              </div>
            )}
          </Stack>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Container>
          <Stack direction="vertical" gap={32} className="py-8">
            {/* Hub Cards Grid */}
            <Grid cols={3} gap={24}>
              {hubs.map((hub, index) => (
                <div
                  key={index}
                  className="p-6 bg-surface-primary border-2 border-border rounded-card hover:shadow-primary transition-all duration-200 cursor-pointer group"
                  onClick={hub.onClick}
                >
                  <Stack direction="vertical" gap={16}>
                    {/* Icon */}
                    <div className="w-12 h-12 bg-surface-elevated rounded-card flex items-center justify-center group-hover:bg-surface-primary transition-colors">
                      {hub.icon}
                    </div>
                    
                    {/* Content */}
                    <Stack direction="vertical" gap={8}>
                      <h3 className="font-heading text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                        {hub.title}
                      </h3>
                      <Body className="text-text-muted">
                        {hub.description}
                      </Body>
                    </Stack>
                    
                    {/* Footer */}
                    {hub.footer && (
                      <div className="pt-4 border-t border-border">
                        {hub.footer}
                      </div>
                    )}
                  </Stack>
                </div>
              ))}
            </Grid>
          </Stack>
        </Container>
      </main>
    </div>
  );
}
