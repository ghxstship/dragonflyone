import { AtlvsAppLayout } from "../../../components/app-layout";
import {
  Stack,
  Grid,
  Card,
  Body,
  H1,
  H3,
  Label,
  Container,
  Display,
  Button,
  FullBleedSection,
  Badge,
} from "@ghxstship/ui";
import { Code, Key, Webhook, Database, ArrowRight, ExternalLink, BookOpen, Terminal } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const apiDocsData = {
  hero: {
    headline: "API DOCUMENTATION",
    description: "Build powerful integrations with the ATLVS REST API. Access projects, crews, assets, and more.",
  },
  quickStart: [
    { step: "1", title: "Get API Key", description: "Generate an API key from your account settings" },
    { step: "2", title: "Authenticate", description: "Include your key in the Authorization header" },
    { step: "3", title: "Make Requests", description: "Start calling endpoints to access your data" },
  ],
  endpoints: [
    {
      category: "Projects",
      description: "Create, read, update, and delete productions",
      methods: ["GET /projects", "POST /projects", "GET /projects/:id", "PATCH /projects/:id"],
    },
    {
      category: "Crew",
      description: "Manage crew members and assignments",
      methods: ["GET /crew", "POST /crew", "GET /crew/:id", "PATCH /crew/:id"],
    },
    {
      category: "Assets",
      description: "Track equipment and inventory",
      methods: ["GET /assets", "POST /assets", "GET /assets/:id", "PATCH /assets/:id"],
    },
    {
      category: "Finance",
      description: "Budgets, expenses, and invoices",
      methods: ["GET /budgets", "GET /expenses", "POST /expenses", "GET /invoices"],
    },
  ],
  resources: [
    { icon: BookOpen, title: "API Reference", description: "Complete endpoint documentation", href: "#reference" },
    { icon: Terminal, title: "SDKs", description: "Official libraries for Node.js, Python, and more", href: "#sdks" },
    { icon: Webhook, title: "Webhooks", description: "Real-time event notifications", href: "#webhooks" },
    { icon: Database, title: "Data Models", description: "Schema definitions and relationships", href: "#models" },
  ],
  codeExample: `curl -X GET "https://api.atlvs.io/v1/projects" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
};

export default function ApiDocsPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-16 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <Code className="size-8 text-brand-pink" />
            </Stack>
            <Label size="xs" className="text-on-dark-muted">
              DEVELOPERS
            </Label>
            <Display size="lg" className="text-white">
              {apiDocsData.hero.headline}
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              {apiDocsData.hero.description}
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="#reference">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  View Reference
                </Button>
              </NextLink>
              <NextLink href="/settings/api">
                <Button variant="outlineWhite" size="lg" icon={<Key />}>
                  Get API Key
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Quick Start */}
      <FullBleedSection background="white" className="py-8 sm:py-12 lg:py-16">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
            {apiDocsData.quickStart.map((item) => (
              <Stack key={item.step} direction="horizontal" gap={4} className="items-start">
                <Stack className="flex size-10 items-center justify-center border-2 border-ink-950 bg-grey-100">
                  <Label size="sm" className="text-ink-950">{item.step}</Label>
                </Stack>
                <Stack gap={1}>
                  <H3 size="sm" className="text-ink-950">{item.title}</H3>
                  <Label size="xs" className="text-grey-500">{item.description}</Label>
                </Stack>
              </Stack>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Code Example */}
      <FullBleedSection background="ink" className="py-8 sm:py-12 lg:py-16">
        <Container className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8">
          <Card inverted className="border-2 border-ink-800 bg-ink-900 p-6">
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <Label size="xs" className="text-on-dark-muted">EXAMPLE REQUEST</Label>
                <Badge variant="outline" className="border-ink-700 text-on-dark-muted">bash</Badge>
              </Stack>
              <Body size="sm" className="font-mono text-on-dark-secondary">
                <pre className="overflow-x-auto whitespace-pre-wrap">{apiDocsData.codeExample}</pre>
              </Body>
            </Stack>
          </Card>
        </Container>
      </FullBleedSection>

      {/* Endpoints */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24" id="reference">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-16 text-center">
            <H1 className="text-ink-950">API ENDPOINTS</H1>
            <Body size="lg" className="mx-auto max-w-2xl text-grey-600">
              RESTful endpoints for all ATLVS resources.
            </Body>
          </Stack>

          <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
            {apiDocsData.endpoints.map((endpoint) => (
              <Card key={endpoint.category} className="border-2 border-ink-950 bg-white p-6 shadow-md">
                <Stack gap={4}>
                  <Stack gap={2}>
                    <H3 className="text-ink-950">{endpoint.category}</H3>
                    <Body size="sm" className="text-grey-600">{endpoint.description}</Body>
                  </Stack>
                  <Stack gap={2}>
                    {endpoint.methods.map((method) => (
                      <Label key={method} size="xs" className="font-mono text-grey-500">
                        {method}
                      </Label>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Resources */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-16 text-center">
            <H1 className="text-ink-950">DEVELOPER RESOURCES</H1>
          </Stack>

          <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
            {apiDocsData.resources.map((resource) => (
              <NextLink key={resource.title} href={resource.href}>
                <Card className="border-2 border-ink-950 bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
                  <Stack gap={4}>
                    <Stack className="flex size-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                      <resource.icon className="size-6 text-ink-950" />
                    </Stack>
                    <H3 size="sm" className="text-ink-950">{resource.title}</H3>
                    <Body size="xs" className="text-grey-600">{resource.description}</Body>
                  </Stack>
                </Card>
              </NextLink>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* CTA */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-white">
              NEED HELP?
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              Our developer support team is here to help you build amazing integrations.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/contact">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  Contact Support
                </Button>
              </NextLink>
              <NextLink href="/partners">
                <Button variant="outlineWhite" size="lg" icon={<ExternalLink />}>
                  Partner Program
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
