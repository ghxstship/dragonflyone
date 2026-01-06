"use client";

/**
 * API Documentation Page - 2026 Landing Page Best Practices
 * API reference and developer docs
 * Full-width marketing layout with hero and content sections
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Code, Key, Webhook, Copy, Check, Terminal } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container,
  Badge, Body, Button, Card, Grid, Stack, Box, useToast,
  type FeatureItem
} from "@ghxstship/ui";

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
}

const ENDPOINTS: Endpoint[] = [
  { method: "GET", path: "/api/v1/projects", description: "List all projects" },
  { method: "POST", path: "/api/v1/projects", description: "Create a new project" },
  { method: "GET", path: "/api/v1/projects/:id", description: "Get project details" },
  { method: "PUT", path: "/api/v1/projects/:id", description: "Update a project" },
  { method: "DELETE", path: "/api/v1/projects/:id", description: "Delete a project" },
  { method: "GET", path: "/api/v1/events", description: "List all events" },
  { method: "POST", path: "/api/v1/events", description: "Create a new event" },
  { method: "GET", path: "/api/v1/contacts", description: "List all contacts" },
  { method: "POST", path: "/api/v1/contacts", description: "Create a new contact" },
];

const METHOD_COLORS = {
  GET: "success",
  POST: "info",
  PUT: "warning",
  DELETE: "error",
} as const;

const API_FEATURES: FeatureItem[] = [
  { id: "auth", icon: <Key className="size-8" />, title: "Authentication", description: "Secure API key based authentication for all requests." },
  { id: "rest", icon: <Code className="size-8" />, title: "REST API", description: "Clean RESTful endpoints with JSON responses." },
  { id: "webhooks", icon: <Webhook className="size-8" />, title: "Webhooks", description: "Real-time event notifications to your systems." },
  { id: "sdks", icon: <Terminal className="size-8" />, title: "SDKs", description: "Official SDKs for popular programming languages." },
];

export default function ApiDocsPage() {
  const router = useRouter();
  const toast = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    toast.success("Copied", "Code copied to clipboard");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const exampleCode = `curl -X GET "https://api.atlvs.com/v1/projects" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;

  return (
    <MarketingPage
      sections={[
        {
          id: "hero",
          background: "gradient",
          pattern: "halftone",
          patternOpacity: 0.05,
          content: (
            <HeroSection
              kicker="Developer"
              title="API Reference"
              description="Build powerful integrations with the ATLVS API. Access production data, automate workflows, and extend platform capabilities."
              primaryCta={{
                label: "Get API Key",
                onClick: () => router.push("/settings/integrations"),
              }}
              secondaryCta={{
                label: "View Documentation",
                onClick: () => router.push("/docs"),
              }}
              background="gradient"
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "features",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <FeatureGrid
              kicker="Capabilities"
              title="API Features"
              description="Everything you need to integrate with ATLVS"
              features={API_FEATURES}
              columns={4}
              variant="bordered"
              background="ink"
              align="center"
            />
          ),
        },
        {
          id: "quickstart",
          background: "black",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Quick Start</Body>
                  <Body className="text-text-primary font-weight-bold text-h3-md">Get Started in Minutes</Body>
                </Stack>

                <Card className="p-6 border-2 border-border rounded-card">
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Body className="text-text-primary font-weight-bold">Example Request</Body>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(exampleCode, "example")}>
                        {copiedCode === "example" ? <Check className="size-4" /> : <Copy className="size-4" />}
                      </Button>
                    </Stack>
                    <Box className="bg-surface-elevated rounded-card p-4">
                      <pre className="font-weight-normal text-text-secondary overflow-x-auto"><code>{exampleCode}</code></pre>
                    </Box>
                  </Stack>
                </Card>

                <Card className="p-6 border-2 border-border rounded-card">
                  <Stack direction="horizontal" className="justify-between items-center">
                    <Stack gap={1}>
                      <Body className="text-text-primary font-weight-bold">Base URL</Body>
                      <code className="text-primary">https://api.atlvs.com/v1</code>
                    </Stack>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("https://api.atlvs.com/v1", "baseurl")}>
                      {copiedCode === "baseurl" ? <Check className="size-4" /> : <Copy className="size-4" />}
                    </Button>
                  </Stack>
                </Card>
              </Stack>
            </Container>
          ),
        },
        {
          id: "endpoints",
          background: "ink",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Reference</Body>
                  <Body className="text-text-primary font-weight-bold text-h3-md">API Endpoints</Body>
                  <Body className="text-text-muted max-w-2xl">Available REST API endpoints for managing your production data</Body>
                </Stack>

                <Grid cols={1} gap={3}>
                  {ENDPOINTS.map((endpoint, idx) => (
                    <Card key={idx} className="p-4 border-2 border-border rounded-card pop-card cursor-pointer">
                      <Box className="flex items-center gap-4">
                        <Badge variant={METHOD_COLORS[endpoint.method]} className="w-20 justify-center">{endpoint.method}</Badge>
                        <code className="text-primary flex-1">{endpoint.path}</code>
                        <Body size="sm" className="text-text-muted">{endpoint.description}</Body>
                      </Box>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Container>
          ),
        },
        {
          id: "cta",
          background: "primary",
          pattern: "halftone",
          content: (
            <CTABanner
              title="Ready to Build?"
              description="Get your API key and start integrating with ATLVS today."
              primaryCta={{
                label: "Get API Key",
                onClick: () => router.push("/settings/integrations"),
              }}
              secondaryCta={{
                label: "Contact Sales",
                onClick: () => router.push("/contact"),
              }}
              background="primary"
            />
          ),
        },
      ]}
    />
  );
}
