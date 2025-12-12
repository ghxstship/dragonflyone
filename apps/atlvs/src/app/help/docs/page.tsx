import { AtlvsAppLayout } from "../../../components/app-layout";
import {
  Stack,
  Grid,
  Card,
  Body,
  H2,
  H3,
  Label,
  Container,
  Display,
  Button,
  Badge,
  Input,
  FullBleedSection,
} from "@ghxstship/ui";
import { 
  FileText, 
  ArrowRight, 
  Search, 
  Book,
  Users,
  DollarSign,
  Calendar,
  Settings,
  Shield,
  Zap,
  Code,
  ExternalLink,
  ChevronRight,
  Clock,
} from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const docCategories = [
  {
    id: "getting-started",
    icon: Book,
    title: "Getting Started",
    description: "Set up your account, create your first production, and learn the basics.",
    articles: 12,
    popular: ["Account setup", "First production", "Team invitations"],
  },
  {
    id: "productions",
    icon: Zap,
    title: "Productions",
    description: "Create, manage, and track productions from pre-production to wrap.",
    articles: 18,
    popular: ["Production templates", "Phase management", "Milestones"],
  },
  {
    id: "team",
    icon: Users,
    title: "Team & Crew",
    description: "Manage team members, roles, permissions, and crew scheduling.",
    articles: 15,
    popular: ["Role permissions", "Crew availability", "Department setup"],
  },
  {
    id: "finance",
    icon: DollarSign,
    title: "Budgets & Finance",
    description: "Budget tracking, expense management, and financial reporting.",
    articles: 14,
    popular: ["Budget setup", "Expense approvals", "Financial reports"],
  },
  {
    id: "scheduling",
    icon: Calendar,
    title: "Scheduling",
    description: "Call sheets, calendars, availability tracking, and timeline management.",
    articles: 11,
    popular: ["Call sheets", "Calendar sync", "Scheduling conflicts"],
  },
  {
    id: "compliance",
    icon: Shield,
    title: "Compliance & Safety",
    description: "Permits, insurance, safety protocols, and regulatory requirements.",
    articles: 9,
    popular: ["Permit tracking", "Insurance management", "Safety checklists"],
  },
  {
    id: "settings",
    icon: Settings,
    title: "Settings & Admin",
    description: "Account settings, organization configuration, and admin controls.",
    articles: 10,
    popular: ["Organization settings", "Notifications", "Integrations"],
  },
  {
    id: "api",
    icon: Code,
    title: "API Reference",
    description: "Technical documentation for developers building on ATLVS.",
    articles: 48,
    popular: ["Authentication", "REST endpoints", "Webhooks"],
  },
];

const popularArticles = [
  {
    title: "How to create your first production",
    category: "Getting Started",
    readTime: "5 min",
    href: "/help/docs/getting-started/first-production",
  },
  {
    title: "Setting up budget categories and tracking",
    category: "Finance",
    readTime: "8 min",
    href: "/help/docs/finance/budget-setup",
  },
  {
    title: "Managing crew roles and permissions",
    category: "Team",
    readTime: "6 min",
    href: "/help/docs/team/roles-permissions",
  },
  {
    title: "Creating and distributing call sheets",
    category: "Scheduling",
    readTime: "7 min",
    href: "/help/docs/scheduling/call-sheets",
  },
  {
    title: "Integrating with Google Calendar",
    category: "Settings",
    readTime: "4 min",
    href: "/help/docs/settings/google-calendar",
  },
  {
    title: "Expense submission and approval workflow",
    category: "Finance",
    readTime: "6 min",
    href: "/help/docs/finance/expense-workflow",
  },
];

const recentUpdates = [
  {
    title: "New: Bulk expense import feature",
    date: "Dec 10, 2024",
    type: "New Feature",
  },
  {
    title: "Updated: API rate limits documentation",
    date: "Dec 8, 2024",
    type: "Update",
  },
  {
    title: "New: Multi-currency support guide",
    date: "Dec 5, 2024",
    type: "New Feature",
  },
  {
    title: "Updated: Crew scheduling best practices",
    date: "Dec 3, 2024",
    type: "Update",
  },
];

export default function DocsPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-20 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <FileText className="size-10 text-brand-pink" />
            </Stack>
            <Display size="lg" className="text-white">
              DOCUMENTATION
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              Everything you need to know about ATLVS. Comprehensive guides, 
              tutorials, and reference documentation for every feature.
            </Body>

            {/* Search */}
            <Stack direction="horizontal" gap={0} className="w-full max-w-2xl">
              <Stack className="relative flex-1">
                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-grey-400" />
                <Input
                  placeholder="Search documentation..."
                  className="border-2 border-r-0 border-white bg-ink-900 pl-12 text-white placeholder:text-grey-500"
                />
              </Stack>
              <Button variant="pop" size="md">
                Search
              </Button>
            </Stack>

            <Stack direction="horizontal" gap={4}>
              <Badge variant="outline" className="border-ink-600 text-on-dark-muted">
                137 Articles
              </Badge>
              <Badge variant="outline" className="border-ink-600 text-on-dark-muted">
                8 Categories
              </Badge>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Documentation Categories */}
      <FullBleedSection background="white" className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={8}>
            <Stack gap={4}>
              <H2 className="text-ink-950">BROWSE BY CATEGORY</H2>
              <Body className="text-grey-600">Find documentation organized by topic</Body>
            </Stack>

            <Grid cols={2} gap={6}>
              {docCategories.map((category) => (
                <NextLink key={category.id} href={`/help/docs/${category.id}`}>
                  <Card className="h-full border-2 border-grey-200 p-6 transition-all hover:border-primary hover:shadow-md">
                    <Stack gap={4}>
                      <Stack direction="horizontal" gap={4} className="items-start">
                        <Stack className="flex size-12 shrink-0 items-center justify-center border-2 border-ink-950 bg-grey-100">
                          <category.icon className="size-6 text-ink-950" />
                        </Stack>
                        <Stack gap={2} className="flex-1">
                          <Stack direction="horizontal" className="items-center justify-between">
                            <H3 size="sm" className="text-ink-950">{category.title}</H3>
                            <Badge variant="outline" size="sm">{category.articles} articles</Badge>
                          </Stack>
                          <Body size="sm" className=" text-grey-600">{category.description}</Body>
                        </Stack>
                      </Stack>
                      <Stack gap={2}>
                        <Label size="xs" className="text-grey-500">POPULAR</Label>
                        <Stack direction="horizontal" gap={2} className="flex-wrap">
                          {category.popular.map((topic) => (
                            <Badge key={topic} variant="solid" size="sm" className="bg-grey-100 text-grey-700">
                              {topic}
                            </Badge>
                          ))}
                        </Stack>
                      </Stack>
                    </Stack>
                  </Card>
                </NextLink>
              ))}
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Popular Articles & Recent Updates */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Grid cols={2} gap={8}>
            {/* Popular Articles */}
            <Stack gap={6}>
              <H2 className="text-ink-950">POPULAR ARTICLES</H2>
              <Card className="border-2 border-ink-950">
                <Stack gap={0}>
                  {popularArticles.map((article, idx) => (
                    <NextLink 
                      key={article.title} 
                      href={article.href}
                      className={`block p-4 transition-colors hover:bg-grey-50 ${
                        idx !== popularArticles.length - 1 ? "border-b border-grey-200" : ""
                      }`}
                    >
                      <Stack gap={2}>
                        <Stack direction="horizontal" className="items-center justify-between">
                          <Body className="font-weight-semibold text-ink-950">{article.title}</Body>
                          <ChevronRight className="size-4 text-grey-400" />
                        </Stack>
                        <Stack direction="horizontal" gap={3} className="items-center">
                          <Badge variant="outline" size="sm">{article.category}</Badge>
                          <Stack direction="horizontal" gap={1} className="items-center text-grey-500">
                            <Clock className="size-3" />
                            <Label size="xs">{article.readTime}</Label>
                          </Stack>
                        </Stack>
                      </Stack>
                    </NextLink>
                  ))}
                </Stack>
              </Card>
            </Stack>

            {/* Recent Updates */}
            <Stack gap={6}>
              <H2 className="text-ink-950">RECENT UPDATES</H2>
              <Card className="border-2 border-ink-950">
                <Stack gap={0}>
                  {recentUpdates.map((update, idx) => (
                    <Stack 
                      key={update.title}
                      gap={2}
                      className={`p-4 ${idx !== recentUpdates.length - 1 ? "border-b border-grey-200" : ""}`}
                    >
                      <Stack direction="horizontal" className="items-center justify-between">
                        <Body className="font-weight-semibold text-ink-950">{update.title}</Body>
                        <Badge 
                          variant={update.type === "New Feature" ? "success" : "info"} 
                          size="sm"
                        >
                          {update.type}
                        </Badge>
                      </Stack>
                      <Label size="xs" className="text-grey-500">{update.date}</Label>
                    </Stack>
                  ))}
                </Stack>
              </Card>

              {/* API Docs CTA */}
              <Card className="border-2 border-primary bg-primary/5 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <Code className="size-6 text-primary" />
                    <H3 size="sm" className="text-ink-950">API Documentation</H3>
                  </Stack>
                  <Body size="sm" className=" text-grey-600">
                    Building on ATLVS? Check out our comprehensive API reference with 
                    authentication guides, endpoint documentation, and code examples.
                  </Body>
                  <NextLink href="/docs/api">
                    <Button variant="outline" size="sm" icon={<ExternalLink />}>
                      View API Docs
                    </Button>
                  </NextLink>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Help CTA */}
      <FullBleedSection background="ink" className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 text-center lg:px-8">
          <Stack gap={8} className="items-center">
            <H2 className="text-white">CAN&apos;T FIND WHAT YOU NEED?</H2>
            <Body size="lg" className="text-on-dark-secondary">
              Our support team is here to help. Reach out with any questions 
              not covered in the documentation.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/contact">
                <Button variant="pop" size="lg">
                  Contact Support
                </Button>
              </NextLink>
              <NextLink href="/help">
                <Button variant="outlineWhite" size="lg" icon={<ArrowRight />}>
                  Help Center
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
