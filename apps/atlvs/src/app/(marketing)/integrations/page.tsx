"use client";

/**
 * Integrations Marketing Page
 * Showcase all integration categories organized by business department
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { 
  Users, CreditCard, UserPlus, Building2, Wallet, Calendar, 
  Calculator, MessageSquare, Ticket, Building, FolderOpen, 
  BarChart3, Zap, Shield, Globe, ArrowRight, Check, Clock,
  Database, DollarSign, TrendingUp, Settings, Mail, Share2,
  Package, ClipboardList, Truck, UtensilsCrossed
} from "lucide-react";
import {
  MarketingPage, HeroSection, BentoGrid, StatsSection, 
  CTABanner, Card, Badge, Body, Button, Box, H3, H4, Stack, Grid
} from "@ghxstship/ui";

// ============================================================================
// DEPARTMENT-ORGANIZED INTEGRATION DATA
// ============================================================================

const DEPARTMENT_ICONS: Record<string, React.ReactNode> = {
  people: <Users className="size-6" />,
  finance: <DollarSign className="size-6" />,
  sales: <TrendingUp className="size-6" />,
  operations: <Settings className="size-6" />,
  technology: <Database className="size-6" />,
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  ats: <UserPlus className="size-5" />,
  hr: <Building2 className="size-5" />,
  payroll: <Wallet className="size-5" />,
  scheduling: <Calendar className="size-5" />,
  accounting: <Calculator className="size-5" />,
  pos: <CreditCard className="size-5" />,
  payment: <CreditCard className="size-5" />,
  crm: <Users className="size-5" />,
  ticketing: <Ticket className="size-5" />,
  email_marketing: <Mail className="size-5" />,
  social_media: <Share2 className="size-5" />,
  venue: <Building className="size-5" />,
  inventory: <Package className="size-5" />,
  project_management: <ClipboardList className="size-5" />,
  catering: <UtensilsCrossed className="size-5" />,
  transportation: <Truck className="size-5" />,
  communication: <MessageSquare className="size-5" />,
  file_storage: <FolderOpen className="size-5" />,
  analytics: <BarChart3 className="size-5" />,
  automation: <Zap className="size-5" />,
};

const INTEGRATION_DEPARTMENTS = [
  {
    id: "people",
    name: "People & Workforce",
    description: "Manage your entire workforce lifecycle from hiring to payroll",
    color: "primary",
    providerCount: 61,
    categories: [
      { id: "ats", name: "Recruiting & ATS", count: 24, providers: ["Greenhouse", "Lever", "Indeed", "Workday"] },
      { id: "hr", name: "Human Resources", count: 12, providers: ["BambooHR", "HiBob", "Workday", "Namely"] },
      { id: "payroll", name: "Payroll & Payments", count: 15, providers: ["Gusto", "Rippling", "Deel", "ADP"] },
      { id: "scheduling", name: "Scheduling & Time", count: 10, providers: ["Deputy", "7shifts", "When I Work", "Homebase"] },
    ],
  },
  {
    id: "finance",
    name: "Finance & Revenue",
    description: "Streamline financial operations and real-time revenue tracking",
    color: "success",
    providerCount: 36,
    categories: [
      { id: "accounting", name: "Accounting & Finance", count: 8, providers: ["QuickBooks", "Xero", "Sage", "NetSuite"] },
      { id: "pos", name: "Point of Sale", count: 20, providers: ["Toast", "Square", "Clover", "Lightspeed"] },
      { id: "payment", name: "Payment Processing", count: 8, providers: ["Stripe", "PayPal", "Square", "Adyen"] },
    ],
  },
  {
    id: "sales",
    name: "Sales & Marketing",
    description: "Drive revenue with CRM, ticketing, and marketing automation",
    color: "accent",
    providerCount: 27,
    categories: [
      { id: "crm", name: "CRM & Sales", count: 8, providers: ["Salesforce", "HubSpot", "Pipedrive", "Zoho"] },
      { id: "ticketing", name: "Ticketing & Registration", count: 8, providers: ["Eventbrite", "Ticketmaster", "Universe", "Dice"] },
      { id: "email_marketing", name: "Email Marketing", count: 6, providers: ["Mailchimp", "Klaviyo", "Constant Contact", "SendGrid"] },
      { id: "social_media", name: "Social Media", count: 5, providers: ["Hootsuite", "Sprout Social", "Buffer", "Later"] },
    ],
  },
  {
    id: "operations",
    name: "Production & Operations",
    description: "Coordinate venues, assets, catering, and production logistics",
    color: "secondary",
    providerCount: 28,
    categories: [
      { id: "venue", name: "Venue & Hospitality", count: 6, providers: ["Tripleseat", "Event Temple", "Cvent", "Honeybook"] },
      { id: "inventory", name: "Inventory & Assets", count: 6, providers: ["Sortly", "Asset Panda", "EZOfficeInventory", "Fishbowl"] },
      { id: "project_management", name: "Project Management", count: 8, providers: ["Asana", "Monday.com", "Notion", "ClickUp"] },
      { id: "catering", name: "Catering & F&B", count: 4, providers: ["Caterease", "Total Party Planner", "Flex Catering", "CaterZen"] },
      { id: "transportation", name: "Transportation", count: 4, providers: ["Uber for Business", "Lyft Business", "Limo Anywhere", "Ground Control"] },
    ],
  },
  {
    id: "technology",
    name: "Technology & Data",
    description: "Connect your tech stack and unlock powerful data insights",
    color: "info",
    providerCount: 21,
    categories: [
      { id: "communication", name: "Communication", count: 6, providers: ["Slack", "Microsoft Teams", "Discord", "Zoom"] },
      { id: "file_storage", name: "File Storage", count: 5, providers: ["Google Drive", "Dropbox", "Box", "OneDrive"] },
      { id: "analytics", name: "Analytics & BI", count: 6, providers: ["Tableau", "Looker", "Power BI", "Mixpanel"] },
      { id: "automation", name: "Automation", count: 4, providers: ["Zapier", "Make", "n8n", "Workato"] },
    ],
  },
];

const FEATURED_PROVIDERS = [
  { name: "Toast", category: "POS", department: "Finance", logo: "T" },
  { name: "Square", category: "POS", department: "Finance", logo: "S" },
  { name: "Greenhouse", category: "ATS", department: "People", logo: "G" },
  { name: "Lever", category: "ATS", department: "People", logo: "L" },
  { name: "Gusto", category: "Payroll", department: "People", logo: "G" },
  { name: "Rippling", category: "Payroll", department: "People", logo: "R" },
  { name: "BambooHR", category: "HR", department: "People", logo: "B" },
  { name: "Salesforce", category: "CRM", department: "Sales", logo: "S" },
  { name: "HubSpot", category: "CRM", department: "Sales", logo: "H" },
  { name: "Eventbrite", category: "Ticketing", department: "Sales", logo: "E" },
  { name: "QuickBooks", category: "Accounting", department: "Finance", logo: "Q" },
  { name: "Xero", category: "Accounting", department: "Finance", logo: "X" },
  { name: "Slack", category: "Comms", department: "Technology", logo: "S" },
  { name: "Asana", category: "PM", department: "Operations", logo: "A" },
  { name: "Zapier", category: "Automation", department: "Technology", logo: "Z" },
  { name: "Stripe", category: "Payments", department: "Finance", logo: "S" },
];

const WORKFLOW_EXAMPLES = [
  {
    id: "sales-tracking",
    title: "Real-Time Event Sales",
    description: "Automatically sync POS transactions for live revenue dashboards during events",
    icon: <CreditCard className="size-6" />,
    steps: ["Connect POS system", "Map to venues", "View live dashboard"],
    timeSaved: "10+ hours/event",
  },
  {
    id: "crew-hiring",
    title: "Streamlined Crew Hiring",
    description: "Post jobs, track candidates, and onboard new crew members seamlessly",
    icon: <UserPlus className="size-6" />,
    steps: ["Post to ATS", "Track pipeline", "Auto-onboard hires"],
    timeSaved: "5 hours/hire",
  },
  {
    id: "automated-payroll",
    title: "Automated Crew Payroll",
    description: "Sync timesheets and process payroll automatically for production teams",
    icon: <Wallet className="size-6" />,
    steps: ["Track time", "Approve sheets", "Auto-process pay"],
    timeSaved: "8 hours/period",
  },
  {
    id: "sponsor-sync",
    title: "Sponsor CRM Sync",
    description: "Keep sponsor relationships synchronized between ATLVS and your CRM",
    icon: <Users className="size-6" />,
    steps: ["Connect CRM", "Map fields", "Bidirectional sync"],
    timeSaved: "3 hours/week",
  },
];

const INTEGRATION_STATS = [
  { id: "integrations", value: 100, suffix: "+", label: "Integrations", description: "Ready to connect" },
  { id: "categories", value: 12, suffix: "", label: "Categories", description: "Covering every need" },
  { id: "setup", value: 5, suffix: " min", label: "Avg Setup", description: "Quick and easy" },
  { id: "synced", value: 10, suffix: "M+", label: "Data Points", description: "Synced monthly" },
];

const BENTO_ITEMS = [
  {
    id: "api",
    title: "Powerful API",
    description: "Full REST API with 500+ endpoints for custom integrations and automation.",
    icon: <Database className="size-8 text-primary" />,
    size: "medium" as const,
    background: "default" as const,
  },
  {
    id: "webhooks",
    title: "Real-Time Webhooks",
    description: "50+ webhook events to trigger actions in your connected systems instantly.",
    icon: <Zap className="size-8 text-accent" />,
    size: "small" as const,
    background: "primary" as const,
  },
  {
    id: "security",
    title: "Enterprise Security",
    description: "OAuth 2.0, encrypted credentials, and SOC 2 compliant data handling.",
    icon: <Shield className="size-8 text-success" />,
    size: "small" as const,
    background: "default" as const,
  },
  {
    id: "global",
    title: "Global Connectivity",
    description: "Connect with tools used by production teams worldwide, in any timezone.",
    icon: <Globe className="size-8 text-secondary" />,
    size: "medium" as const,
    background: "gradient" as const,
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function IntegrationsPage() {
  const router = useRouter();

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
              kicker="Integrations"
              title="Connect Your Entire Production Stack"
              description="150+ integrations organized by business function. Sync data, automate workflows, and eliminate manual work across every department."
              primaryCta={{
                label: "Explore by Department",
                onClick: () => document.getElementById("departments")?.scrollIntoView({ behavior: "smooth" }),
              }}
              secondaryCta={{
                label: "View API Docs",
                onClick: () => router.push("/docs/api"),
              }}
              background="gradient"
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "providers",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <Box className="py-16 md:py-24">
              <Box className="text-center mb-12">
                <Badge variant="outline" className="mb-4">Trusted Connections</Badge>
                <H3 className="text-foreground mb-4">
                  Integrate with Industry Leaders
                </H3>
                <Body className="text-muted-foreground max-w-2xl mx-auto">
                  Connect with the platforms your team already uses
                </Body>
              </Box>
              <Box className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
                {FEATURED_PROVIDERS.map((provider) => (
                  <Box
                    key={provider.name}
                    className="flex items-center gap-3 px-4 py-3 bg-surface border-2 border-border rounded-card hover:border-primary transition-colors"
                  >
                    <Box className="size-10 rounded-button bg-muted flex items-center justify-center font-weight-bold text-body-md">
                      {provider.logo}
                    </Box>
                    <Box>
                      <Body size="sm" className="font-weight-semibold">{provider.name}</Body>
                      <Body size="xs" className="text-muted-foreground">{provider.department}</Body>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Box className="text-center mt-8">
                <Body className="text-muted-foreground">
                  And 130+ more integrations across 5 departments
                </Body>
              </Box>
            </Box>
          ),
        },
        {
          id: "capabilities",
          background: "black",
          content: (
            <BentoGrid
              kicker="Platform Capabilities"
              title="Built for Enterprise Integration"
              description="Powerful tools for connecting your entire production ecosystem"
              items={BENTO_ITEMS}
              background="black"
            />
          ),
        },
        {
          id: "departments",
          background: "ink",
          pattern: "halftone",
          patternOpacity: 0.03,
          content: (
            <Box className="py-16 md:py-24">
              <Box className="text-center mb-12">
                <Badge variant="outline" className="mb-4">By Department</Badge>
                <H3 className="text-foreground mb-4">
                  Integrations for Every Team
                </H3>
                <Body className="text-muted-foreground max-w-2xl mx-auto">
                  Find the right integrations organized by business function
                </Body>
              </Box>
              <Stack gap={8} className="max-w-6xl mx-auto">
                {INTEGRATION_DEPARTMENTS.map((dept) => (
                  <Card key={dept.id} variant="outlined" className="p-6">
                    <Box className="flex items-start gap-4 mb-6">
                      <Box className={`size-12 rounded-button bg-${dept.color}/10 flex items-center justify-center text-${dept.color}`}>
                        {DEPARTMENT_ICONS[dept.id]}
                      </Box>
                      <Box className="flex-1">
                        <Box className="flex items-center gap-3 mb-1">
                          <H4 size="sm">{dept.name}</H4>
                          <Badge variant="outline" className="text-body-xs">{dept.providerCount} integrations</Badge>
                        </Box>
                        <Body size="sm" className="text-muted-foreground">{dept.description}</Body>
                      </Box>
                    </Box>
                    <Grid cols={4} gap={4}>
                      {dept.categories.map((cat) => (
                        <Box key={cat.id} className="p-4 bg-muted/30 rounded-card border-2 border-border">
                          <Box className="flex items-center gap-2 mb-2">
                            <Box className="text-muted-foreground">{CATEGORY_ICONS[cat.id]}</Box>
                            <Body size="sm" className="font-weight-semibold">{cat.name}</Body>
                          </Box>
                          <Body size="xs" className="text-muted-foreground mb-2">{cat.count} providers</Body>
                          <Box className="flex flex-wrap gap-1">
                            {cat.providers.slice(0, 3).map((provider) => (
                              <Badge key={provider} variant="outline" className="text-body-xs">{provider}</Badge>
                            ))}
                            {cat.providers.length > 3 && (
                              <Badge variant="outline" className="text-body-xs">+{cat.providers.length - 3}</Badge>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </Box>
          ),
        },
        {
          id: "workflows",
          background: "black",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <Box className="py-16 md:py-24">
              <Box className="text-center mb-12">
                <Badge variant="outline" className="mb-4">Automation</Badge>
                <H3 className="text-foreground mb-4">
                  Workflow Examples
                </H3>
                <Body className="text-muted-foreground max-w-2xl mx-auto">
                  See how teams save hours every week with automated workflows
                </Body>
              </Box>
              <Grid cols={2} gap={6} className="max-w-5xl mx-auto">
                {WORKFLOW_EXAMPLES.map((workflow) => (
                  <Card key={workflow.id} variant="outlined" className="p-6">
                    <Box className="flex items-start gap-4 mb-4">
                      <Box className="size-12 rounded-button bg-primary/10 flex items-center justify-center text-primary">
                        {workflow.icon}
                      </Box>
                      <Box className="flex-1">
                        <H4 size="sm" className="mb-1">{workflow.title}</H4>
                        <Body size="sm" className="text-muted-foreground">{workflow.description}</Body>
                      </Box>
                    </Box>
                    <Stack gap={2} className="mb-4">
                      {workflow.steps.map((step, idx) => (
                        <Box key={idx} className="flex items-center gap-2">
                          <Box className="size-6 rounded-button bg-primary/20 flex items-center justify-center text-body-xs font-weight-bold text-primary">
                            {idx + 1}
                          </Box>
                          <Body size="sm">{step}</Body>
                        </Box>
                      ))}
                    </Stack>
                    <Box className="flex items-center gap-2 pt-4 border-t border-border">
                      <Clock className="size-4 text-success" />
                      <Body size="sm" className="text-success font-weight-medium">
                        Saves {workflow.timeSaved}
                      </Body>
                    </Box>
                  </Card>
                ))}
              </Grid>
            </Box>
          ),
        },
        {
          id: "stats",
          background: "primary",
          content: (
            <StatsSection
              kicker="By the Numbers"
              title="Integration at Scale"
              stats={INTEGRATION_STATS}
              background="primary"
              animate
            />
          ),
        },
        {
          id: "api-cta",
          background: "ink",
          pattern: "stripes",
          content: (
            <Box className="py-16 md:py-24">
              <Grid cols={2} gap={12} className="max-w-6xl mx-auto items-center">
                <Box>
                  <Badge variant="outline" className="mb-4">For Developers</Badge>
                  <H3 className="text-foreground mb-4">
                    Build Custom Integrations
                  </H3>
                  <Body className="text-muted-foreground mb-6">
                    Our comprehensive API gives you full access to build custom integrations, 
                    automate workflows, and extend ATLVS to fit your unique needs.
                  </Body>
                  <Stack gap={3} className="mb-6">
                    {[
                      "RESTful API with 500+ endpoints",
                      "Real-time webhooks for 50+ events",
                      "OAuth 2.0 authentication",
                      "Comprehensive documentation",
                      "SDKs for popular languages",
                    ].map((feature, idx) => (
                      <Box key={idx} className="flex items-center gap-2">
                        <Check className="size-5 text-success" />
                        <Body size="sm" className="text-foreground">{feature}</Body>
                      </Box>
                    ))}
                  </Stack>
                  <Box className="flex gap-3">
                    <Button onClick={() => router.push("/docs/api")}>
                      View API Docs
                      <ArrowRight className="size-4 ml-2" />
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/contact")}>
                      Talk to Sales
                    </Button>
                  </Box>
                </Box>
                <Box className="bg-surface border-2 border-border rounded-card p-6 font-code text-body-sm">
                  <Box className="text-muted-foreground mb-2"># Fetch event sales data</Box>
                  <Box className="text-primary">curl</Box>
                  <Box className="text-foreground pl-4">-X GET \</Box>
                  <Box className="text-accent pl-4">&quot;https://api.atlvs.io/v1/events/123/sales&quot;</Box>
                  <Box className="text-foreground pl-4">\</Box>
                  <Box className="text-foreground pl-4">-H &quot;Authorization: Bearer $TOKEN&quot;</Box>
                  <Box className="mt-4 pt-4 border-t border-border">
                    <Box className="text-muted-foreground mb-2"># Response</Box>
                    <Box className="text-success">{"{"}</Box>
                    <Box className="text-foreground pl-4">&quot;total_revenue&quot;: 45230.00,</Box>
                    <Box className="text-foreground pl-4">&quot;transactions&quot;: 1247,</Box>
                    <Box className="text-foreground pl-4">&quot;avg_transaction&quot;: 36.27</Box>
                    <Box className="text-success">{"}"}</Box>
                  </Box>
                </Box>
              </Grid>
            </Box>
          ),
        },
        {
          id: "cta",
          background: "gradient",
          pattern: "halftone",
          content: (
            <CTABanner
              title="Ready to Connect Your Stack?"
              description="Start integrating with 100+ platforms in minutes. No engineering required for most connections."
              primaryCta={{
                label: "Start Free Trial",
                onClick: () => router.push("/auth/signup"),
              }}
              secondaryCta={{
                label: "Request Demo",
                onClick: () => router.push("/demo"),
              }}
              background="gradient"
            />
          ),
        },
      ]}
      stickyCta={{
        label: "Get Started",
        onClick: () => router.push("/auth/signup"),
      }}
    />
  );
}
