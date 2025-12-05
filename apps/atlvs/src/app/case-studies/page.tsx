import { AtlvsAppLayout } from "../../components/app-layout";
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
import { ArrowRight, Quote, TrendingUp } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const caseStudiesData = {
  hero: {
    headline: "CUSTOMER SUCCESS STORIES",
    description: "See how production companies are transforming their operations with ATLVS.",
  },
  featured: {
    company: "III POINTS FESTIVAL",
    title: "How III Points Scaled to 30,000+ Attendees with ATLVS",
    excerpt: "Miami's premier music and art festival streamlined operations and reduced planning time by 40%.",
    stats: [
      { value: "40%", label: "Faster Planning" },
      { value: "30K+", label: "Attendees" },
      { value: "200+", label: "Crew Managed" },
    ],
    quote: "ATLVS transformed how we manage our festival. What used to take weeks now takes days.",
    quoteAuthor: "Festival Director",
    slug: "iii-points-festival",
  },
  studies: [
    {
      company: "FORMULA 1 LAS VEGAS",
      industry: "Motorsport Events",
      title: "Managing the Complexity of F1 Race Week",
      excerpt: "How the Las Vegas Grand Prix coordinated thousands of vendors and crew members.",
      stats: { value: "5,000+", label: "Crew Coordinated" },
      slug: "f1-las-vegas",
    },
    {
      company: "CARNIVAL CRUISE LINE",
      industry: "Entertainment",
      title: "Onboard Production Management at Scale",
      excerpt: "Streamlining entertainment production across a fleet of cruise ships.",
      stats: { value: "50%", label: "Cost Reduction" },
      slug: "carnival-cruise",
    },
    {
      company: "FACTORY TOWN",
      industry: "Music Festivals",
      title: "From Spreadsheets to Seamless Operations",
      excerpt: "A boutique festival's journey to professional production management.",
      stats: { value: "3x", label: "Faster Setup" },
      slug: "factory-town",
    },
    {
      company: "SALVAGE CITY",
      industry: "Live Events",
      title: "Building a Sustainable Event Production Model",
      excerpt: "How sustainability-focused events manage complex logistics with ATLVS.",
      stats: { value: "60%", label: "Less Paper" },
      slug: "salvage-city",
    },
    {
      company: "OKEECHOBEE",
      industry: "Music Festivals",
      title: "Multi-Stage Festival Coordination",
      excerpt: "Coordinating 6 stages and 150+ artists over 4 days.",
      stats: { value: "150+", label: "Artists Managed" },
      slug: "okeechobee",
    },
    {
      company: "PATRON EXPERIENCES",
      industry: "Brand Activations",
      title: "Elevating Brand Experiences with Data",
      excerpt: "Using ATLVS analytics to optimize brand activation ROI.",
      stats: { value: "25%", label: "Higher ROI" },
      slug: "patron-experiences",
    },
  ],
  industries: ["All", "Music Festivals", "Motorsport Events", "Brand Activations", "Entertainment", "Live Events"],
};

export default function CaseStudiesPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Label size="xs" className="text-on-dark-muted">
              CASE STUDIES
            </Label>
            <Display size="lg" className="text-white">
              {caseStudiesData.hero.headline}
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              {caseStudiesData.hero.description}
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Featured Case Study */}
      <FullBleedSection background="white" className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Card className="border-2 border-ink-950 bg-white shadow-brand-lg">
            <Grid cols={2}>
              <Stack className="flex items-center justify-center border-r-2 border-ink-950 bg-grey-100 p-12">
                <Display size="lg" className="text-ink-950">{caseStudiesData.featured.company}</Display>
              </Stack>
              <Stack gap={6} className="p-12">
                <Badge variant="outline" className="w-fit border-brand-pink text-brand-pink">
                  FEATURED
                </Badge>
                <H1 className="text-ink-950">{caseStudiesData.featured.title}</H1>
                <Body size="lg" className="text-grey-600">
                  {caseStudiesData.featured.excerpt}
                </Body>

                <Grid cols={3} gap={4}>
                  {caseStudiesData.featured.stats.map((stat) => (
                    <Stack key={stat.label} className="text-center">
                      <Display size="md" className="text-brand-pink">{stat.value}</Display>
                      <Label size="xs" className="text-grey-500">{stat.label}</Label>
                    </Stack>
                  ))}
                </Grid>

                <Card className="border-2 border-grey-200 bg-grey-100 p-6">
                  <Stack gap={3}>
                    <Quote className="size-6 text-grey-400" />
                    <Body size="sm" className="text-grey-700">
                      {caseStudiesData.featured.quote}
                    </Body>
                    <Label size="xs" className="text-grey-500">
                      - {caseStudiesData.featured.quoteAuthor}
                    </Label>
                  </Stack>
                </Card>

                <NextLink href={`/case-studies/${caseStudiesData.featured.slug}`}>
                  <Button variant="pop" size="lg" icon={<ArrowRight />}>
                    Read Full Story
                  </Button>
                </NextLink>
              </Stack>
            </Grid>
          </Card>
        </Container>
      </FullBleedSection>

      {/* Industry Filter */}
      <FullBleedSection background="white" className="py-8">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack direction="horizontal" gap={3} className="flex-wrap justify-center">
            {caseStudiesData.industries.map((industry) => (
              <Badge
                key={industry}
                variant="outline"
                className={industry === "All" ? "border-ink-950 bg-ink-950 text-white" : "border-ink-950 text-ink-950"}
              >
                {industry}
              </Badge>
            ))}
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Case Studies Grid */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Grid cols={3} gap={6}>
            {caseStudiesData.studies.map((study) => (
              <NextLink key={study.slug} href={`/case-studies/${study.slug}`}>
                <Card className="border-2 border-ink-950 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
                  <Stack className="flex aspect-video items-center justify-center border-b-2 border-ink-950 bg-grey-100 p-6">
                    <H3 className="text-center text-ink-950">{study.company}</H3>
                  </Stack>
                  <Stack gap={4} className="p-6">
                    <Badge variant="outline" className="w-fit border-grey-300 text-grey-500">
                      {study.industry}
                    </Badge>
                    <H3 size="sm" className="text-ink-950">{study.title}</H3>
                    <Body size="xs" className="text-grey-600">
                      {study.excerpt}
                    </Body>
                    <Stack direction="horizontal" gap={2} className="items-center text-brand-pink">
                      <TrendingUp className="size-4" />
                      <Label size="sm">{study.stats.value}</Label>
                      <Label size="xs" className="text-grey-500">{study.stats.label}</Label>
                    </Stack>
                  </Stack>
                </Card>
              </NextLink>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* CTA */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 text-center lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-white">
              READY TO WRITE YOUR SUCCESS STORY?
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              Join thousands of productions that have transformed their operations with ATLVS.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/auth/signup">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  Start Free Trial
                </Button>
              </NextLink>
              <NextLink href="/demo">
                <Button variant="outlineWhite" size="lg">
                  Schedule Demo
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
