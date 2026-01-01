"use client";

/**
 * API Documentation Page
 * API reference and developer docs
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Code, Key, Webhook, Copy, Check, List, Terminal} from "lucide-react";
import {
  Badge, Body, Button, Card, Grid, DetailPage, Section, SectionHeader, useToast, Box, Stack } from "@ghxstship/ui";

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

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mb-6">
            <Card className="p-6 text-center">
              <Box className="p-3 bg-primary/20 rounded-card text-primary w-fit mx-auto mb-4"><Key className="size-6" /></Box>
              <Body className="font-weight-bold">Authentication</Body>
              <Body size="sm" className="text-on-dark-muted">API key based auth</Body>
            </Card>
            <Card className="p-6 text-center">
              <Box className="p-3 bg-primary/20 rounded-card text-primary w-fit mx-auto mb-4"><Code className="size-6" /></Box>
              <Body className="font-weight-bold">REST API</Body>
              <Body size="sm" className="text-on-dark-muted">JSON responses</Body>
            </Card>
            <Card className="p-6 text-center">
              <Box className="p-3 bg-primary/20 rounded-card text-primary w-fit mx-auto mb-4"><Webhook className="size-6" /></Box>
              <Body className="font-weight-bold">Webhooks</Body>
              <Body size="sm" className="text-on-dark-muted">Real-time events</Body>
            </Card>
          </Grid>

          <Card className="p-6 mb-6">
            <SectionHeader title="Quick Start" description="Get started with the ATLVS API" />
            <Box className="mt-4 bg-grey-900 rounded-card p-4 relative">
              <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(exampleCode, "example")}>
                {copiedCode === "example" ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
              <pre className="font-weight-normal text-on-dark-secondary overflow-x-auto"><code>{exampleCode}</code></pre>
            </Box>
          </Card>

          <Card className="p-6">
            <SectionHeader title="Base URL" />
            <Box className="mt-4 flex items-center gap-4">
              <code className="bg-grey-800 px-4 py-2 rounded text-primary">https://api.atlvs.com/v1</code>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard("https://api.atlvs.com/v1", "baseurl")}>
                {copiedCode === "baseurl" ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </Box>
          </Card>
        </Section>
      ),
    },
    {
      id: "endpoints",
      label: "Endpoints",
      icon: <Terminal className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="API Endpoints" description="Available REST API endpoints" />
          <Stack gap={2} className="mt-4">
            {ENDPOINTS.map((endpoint, idx) => (
              <Card key={idx} className="p-4 cursor-pointer hover:border-primary transition-colors">
                <Box className="flex items-center gap-4">
                  <Badge variant={METHOD_COLORS[endpoint.method]} className="w-16 justify-center">{endpoint.method}</Badge>
                  <code className="text-primary flex-1">{endpoint.path}</code>
                  <Body size="sm" className="text-on-dark-muted">{endpoint.description}</Body>
                </Box>
              </Card>
            ))}
          </Stack>

          <Card className="p-8 mt-8 text-center">
            <Body className="font-weight-bold font-weight-bold mb-2">Need an API Key?</Body>
            <Body className="text-on-dark-muted mb-4">Generate API keys in your account settings</Body>
            <Button variant="solid" onClick={() => router.push("/settings/integrations")}>Get API Key</Button>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Developer",
        title: "API Reference",
        description: "Build integrations with the ATLVS API",
      }}
      backButton={{ label: "Documentation", href: "/docs" }}
      tabs={tabs}
    />
  );
}
