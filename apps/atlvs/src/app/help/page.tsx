import { AtlvsAppLayout } from "../../components/app-layout";
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
  Input,
  FullBleedSection,
} from "@ghxstship/ui";
import { Search, Book, MessageCircle, Video, FileText, HelpCircle, ArrowRight } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const helpData = {
  hero: {
    headline: "HOW CAN WE HELP?",
    description: "Find answers, get support, and learn how to get the most out of ATLVS.",
  },
  categories: [
    {
      icon: Book,
      title: "GETTING STARTED",
      description: "New to ATLVS? Start here with setup guides and onboarding tutorials.",
      articles: 12,
      href: "/help/getting-started",
    },
    {
      icon: Video,
      title: "VIDEO TUTORIALS",
      description: "Watch step-by-step video guides for common workflows and features.",
      articles: 24,
      href: "/help/tutorials",
    },
    {
      icon: FileText,
      title: "DOCUMENTATION",
      description: "Detailed documentation for all ATLVS features and integrations.",
      articles: 86,
      href: "/help/docs",
    },
    {
      icon: HelpCircle,
      title: "FAQ",
      description: "Answers to frequently asked questions about billing, features, and more.",
      articles: 32,
      href: "/help/faq",
    },
    {
      icon: MessageCircle,
      title: "COMMUNITY",
      description: "Connect with other ATLVS users, share tips, and get advice.",
      articles: 0,
      href: "/help/community",
    },
    {
      icon: ArrowRight,
      title: "API REFERENCE",
      description: "Technical documentation for developers building on the ATLVS platform.",
      articles: 48,
      href: "/docs/api",
    },
  ],
  popularArticles: [
    { title: "How to create your first project", href: "/help/articles/create-project" },
    { title: "Setting up crew scheduling", href: "/help/articles/crew-scheduling" },
    { title: "Budget tracking and reporting", href: "/help/articles/budget-tracking" },
    { title: "Integrating with Google Calendar", href: "/help/articles/google-calendar" },
    { title: "Managing vendor contracts", href: "/help/articles/vendor-contracts" },
  ],
};

export default function HelpPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Display size="lg" className="text-white">
              {helpData.hero.headline}
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              {helpData.hero.description}
            </Body>

            {/* Search */}
            <Stack direction="horizontal" gap={0} className="w-full max-w-2xl">
              <Stack className="relative flex-1">
                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-grey-400" />
                <Input
                  placeholder="Search for help articles..."
                  className="border-2 border-r-0 border-white bg-ink-900 pl-12 text-white placeholder:text-grey-500"
                />
              </Stack>
              <Button variant="pop" size="md">
                Search
              </Button>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Help Categories */}
      <FullBleedSection background="white" className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={4} className="mb-12 text-center">
            <H2 className="text-ink-950">BROWSE BY CATEGORY</H2>
          </Stack>

          <Grid cols={3} gap={6}>
            {helpData.categories.map((category) => (
              <NextLink key={category.title} href={category.href}>
                <Card className="h-full border-2 border-ink-950 bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
                  <Stack gap={4}>
                    <Stack className="flex size-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                      <category.icon className="size-6 text-ink-950" />
                    </Stack>
                    <H3 size="sm" className="text-ink-950">
                      {category.title}
                    </H3>
                    <Body size="sm" className="text-grey-600">
                      {category.description}
                    </Body>
                    {category.articles > 0 && (
                      <Label size="xs" className="text-grey-500">
                        {category.articles} articles
                      </Label>
                    )}
                  </Stack>
                </Card>
              </NextLink>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Popular Articles */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 lg:px-8">
          <Stack gap={4} className="mb-12 text-center">
            <H2 className="text-ink-950">POPULAR ARTICLES</H2>
          </Stack>

          <Card className="border-2 border-ink-950 bg-white shadow-md">
            <Stack gap={0}>
              {helpData.popularArticles.map((article, index) => (
                <NextLink
                  key={article.title}
                  href={article.href}
                  className={`block p-6 transition-colors hover:bg-grey-50 ${
                    index !== helpData.popularArticles.length - 1 ? "border-b border-grey-200" : ""
                  }`}
                >
                  <Stack direction="horizontal" className="items-center justify-between">
                    <Body className="text-ink-950">{article.title}</Body>
                    <ArrowRight className="size-5 text-grey-400" />
                  </Stack>
                </NextLink>
              ))}
            </Stack>
          </Card>
        </Container>
      </FullBleedSection>

      {/* Contact Support CTA */}
      <FullBleedSection background="ink" className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 text-center lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-white">
              STILL NEED HELP?
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              Our support team is available 24/7 to help you with any questions.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/contact">
                <Button variant="pop" size="lg">
                  Contact Support
                </Button>
              </NextLink>
              <NextLink href="/demo">
                <Button variant="outlineWhite" size="lg">
                  Schedule a Call
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
