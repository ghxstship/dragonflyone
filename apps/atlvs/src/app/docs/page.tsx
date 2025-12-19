import { AtlvsAppLayout } from '../../components/app-layout';
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
  Input,
  FullBleedSection,
  Badge,
} from '@ghxstship/ui';
import {
  BookOpen,
  Code,
  Rocket,
  Settings,
  Users,
  Calendar,
  DollarSign,
  FileText,
  ArrowRight,
  Search,
  ExternalLink,
  Zap,
  Shield,
  Database,
} from 'lucide-react';
import NextLink from 'next/link';

export const runtime = 'edge';

const docsData = {
  hero: {
    headline: 'DOCUMENTATION',
    description: 'Everything you need to get the most out of ATLVS. From quick start guides to advanced API integration.',
  },
  quickLinks: [
    { title: 'Getting Started', description: 'New to ATLVS? Start here', href: '/help/getting-started', icon: Rocket },
    { title: 'API Reference', description: 'Build integrations', href: '/docs/api', icon: Code },
    { title: 'Video Tutorials', description: 'Learn by watching', href: '/help/tutorials', icon: BookOpen },
    { title: 'Release Notes', description: 'Latest updates', href: '/help/releases', icon: Zap },
  ],
  categories: [
    {
      title: 'GETTING STARTED',
      icon: Rocket,
      articles: [
        { title: 'Quick Start Guide', views: 12450, href: '/help/getting-started' },
        { title: 'Account Setup', views: 8920, href: '/help/docs' },
        { title: 'Team Invitations', views: 6340, href: '/help/docs' },
        { title: 'First Project', views: 5890, href: '/help/docs' },
      ],
    },
    {
      title: 'PRODUCTIONS',
      icon: Calendar,
      articles: [
        { title: 'Creating Productions', views: 9870, href: '/help/docs' },
        { title: 'Production Templates', views: 7650, href: '/help/docs' },
        { title: 'Timeline Management', views: 6420, href: '/help/docs' },
        { title: 'Production Reports', views: 4320, href: '/help/docs' },
      ],
    },
    {
      title: 'CREW MANAGEMENT',
      icon: Users,
      articles: [
        { title: 'Adding Crew Members', views: 8540, href: '/help/docs' },
        { title: 'Scheduling & Availability', views: 7890, href: '/help/docs' },
        { title: 'Crew Roles & Departments', views: 5670, href: '/help/docs' },
        { title: 'Timesheets & Payroll', views: 4560, href: '/help/docs' },
      ],
    },
    {
      title: 'FINANCE & BUDGETS',
      icon: DollarSign,
      articles: [
        { title: 'Budget Setup', views: 7890, href: '/help/docs' },
        { title: 'Expense Tracking', views: 6540, href: '/help/docs' },
        { title: 'Invoice Management', views: 5670, href: '/help/docs' },
        { title: 'Financial Reports', views: 4320, href: '/help/docs' },
      ],
    },
    {
      title: 'CONTRACTS & DOCUMENTS',
      icon: FileText,
      articles: [
        { title: 'Contract Templates', views: 6780, href: '/help/docs' },
        { title: 'E-Signatures', views: 5430, href: '/help/docs' },
        { title: 'Document Storage', views: 4560, href: '/help/docs' },
        { title: 'Version Control', views: 3210, href: '/help/docs' },
      ],
    },
    {
      title: 'SETTINGS & ADMIN',
      icon: Settings,
      articles: [
        { title: 'Organization Settings', views: 5670, href: '/help/docs' },
        { title: 'User Permissions', views: 4890, href: '/help/docs' },
        { title: 'Integrations', views: 4320, href: '/help/docs' },
        { title: 'Security & Privacy', views: 3890, href: '/help/docs' },
      ],
    },
  ],
  popularArticles: [
    { title: 'How to create your first production', category: 'Getting Started', views: 12450 },
    { title: 'Setting up automated budget alerts', category: 'Finance', views: 9870 },
    { title: 'Managing crew availability', category: 'Crew', views: 8540 },
    { title: 'API authentication guide', category: 'Developers', views: 7890 },
    { title: 'Contract template best practices', category: 'Documents', views: 6780 },
  ],
  developerResources: [
    { title: 'REST API', description: 'Full API documentation', icon: Code, href: '/docs/api' },
    { title: 'Webhooks', description: 'Real-time event notifications', icon: Zap, href: '/docs/api#webhooks' },
    { title: 'Authentication', description: 'OAuth2 and API keys', icon: Shield, href: '/docs/api#auth' },
    { title: 'Data Models', description: 'Schema reference', icon: Database, href: '/docs/api#models' },
  ],
};

export default function DocsPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-16 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <BookOpen className="size-8 text-brand-pink" />
            </Stack>
            <Label size="xs" className="text-on-dark-muted">
              DOCUMENTATION
            </Label>
            <Display size="lg" className="text-white">
              {docsData.hero.headline}
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              {docsData.hero.description}
            </Body>

            {/* Search */}
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-grey-400" />
              <Input
                placeholder="Search documentation..."
                className="w-full pl-12 border-2 border-ink-700 bg-ink-800 text-white placeholder:text-grey-500"
              />
            </div>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Quick Links */}
      <FullBleedSection background="white" className="py-12 border-b border-grey-200">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Grid cols={4} gap={6} className="sm:grid-cols-2">
            {docsData.quickLinks.map((link) => (
              <NextLink key={link.title} href={link.href}>
                <Card className="border-2 border-ink-950 bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg h-full">
                  <Stack gap={4}>
                    <Stack className="flex size-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                      <link.icon className="size-6 text-ink-950" />
                    </Stack>
                    <Stack gap={1}>
                      <H3 size="sm" className="text-ink-950">{link.title}</H3>
                      <Label size="xs" className="text-grey-500">{link.description}</Label>
                    </Stack>
                  </Stack>
                </Card>
              </NextLink>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Documentation Categories */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-16 text-center">
            <H1 className="text-ink-950">BROWSE BY TOPIC</H1>
            <Body size="lg" className="mx-auto max-w-2xl text-grey-600">
              Find guides, tutorials, and reference documentation for every feature.
            </Body>
          </Stack>

          <Grid cols={3} gap={8} className="sm:grid-cols-1 md:grid-cols-2">
            {docsData.categories.map((category) => (
              <Card key={category.title} className="border-2 border-ink-950 bg-white p-6 shadow-md">
                <Stack gap={6}>
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <Stack className="flex size-10 items-center justify-center border-2 border-ink-950 bg-grey-100">
                      <category.icon className="size-5 text-ink-950" />
                    </Stack>
                    <H3 size="sm" className="text-ink-950">{category.title}</H3>
                  </Stack>

                  <Stack gap={3}>
                    {category.articles.map((article) => (
                      <NextLink key={article.title} href={article.href}>
                        <Stack direction="horizontal" className="items-center justify-between group">
                          <Label size="xs" className="text-grey-700 group-hover:text-brand-pink transition-colors">
                            {article.title}
                          </Label>
                          <Label size="xs" className="text-grey-400">
                            {article.views.toLocaleString()} views
                          </Label>
                        </Stack>
                      </NextLink>
                    ))}
                  </Stack>

                  <NextLink href="/help/docs">
                    <Button variant="outline" size="sm" fullWidth icon={<ArrowRight />}>
                      View All
                    </Button>
                  </NextLink>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Popular Articles */}
      <FullBleedSection background="ink" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-16 text-center">
            <H1 className="text-white">POPULAR ARTICLES</H1>
          </Stack>

          <Stack gap={4}>
            {docsData.popularArticles.map((article, idx) => (
              <Card key={article.title} inverted className="border-2 border-ink-800 bg-ink-900 p-6">
                <Stack direction="horizontal" className="items-center justify-between">
                  <Stack direction="horizontal" gap={4} className="items-center">
                    <Stack className="flex size-10 items-center justify-center border-2 border-ink-700 bg-ink-800">
                      <Label size="sm" className="text-on-dark-muted">{idx + 1}</Label>
                    </Stack>
                    <Stack gap={1}>
                      <H3 size="sm" className="text-white">{article.title}</H3>
                      <Badge variant="outline" className="border-ink-700 text-on-dark-muted w-fit">
                        {article.category}
                      </Badge>
                    </Stack>
                  </Stack>
                  <Label size="xs" className="text-on-dark-muted">
                    {article.views.toLocaleString()} views
                  </Label>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Developer Resources */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-16 text-center">
            <H1 className="text-ink-950">DEVELOPER RESOURCES</H1>
            <Body size="lg" className="mx-auto max-w-2xl text-grey-600">
              Build powerful integrations with our comprehensive API documentation.
            </Body>
          </Stack>

          <Grid cols={4} gap={6} className="sm:grid-cols-2">
            {docsData.developerResources.map((resource) => (
              <NextLink key={resource.title} href={resource.href}>
                <Card className="border-2 border-ink-950 bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg h-full">
                  <Stack gap={4}>
                    <Stack className="flex size-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                      <resource.icon className="size-6 text-ink-950" />
                    </Stack>
                    <Stack gap={1}>
                      <H3 size="sm" className="text-ink-950">{resource.title}</H3>
                      <Label size="xs" className="text-grey-500">{resource.description}</Label>
                    </Stack>
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
              CAN&apos;T FIND WHAT YOU&apos;RE LOOKING FOR?
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              Our support team is here to help you get the most out of ATLVS.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/contact">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  Contact Support
                </Button>
              </NextLink>
              <NextLink href="/community">
                <Button variant="outlineWhite" size="lg" icon={<ExternalLink />}>
                  Community Forum
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
