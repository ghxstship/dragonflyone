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
  FullBleedSection,
} from "@ghxstship/ui";
import { 
  FileText, 
  ArrowRight, 
  Sparkles, 
  Bug, 
  Wrench,
  Zap,
  Calendar,
  Bell,
  ChevronRight,
} from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const releases = [
  {
    version: "2.4.0",
    date: "December 15, 2024",
    type: "major",
    highlights: [
      "New multi-currency support for international productions",
      "Real-time collaboration on call sheets",
      "Enhanced API rate limits for Enterprise customers",
    ],
    features: [
      { title: "Multi-currency budgets", description: "Track expenses in multiple currencies with automatic conversion" },
      { title: "Live call sheet editing", description: "See changes from team members in real-time" },
      { title: "Bulk expense import", description: "Import expenses from CSV or QuickBooks" },
    ],
    improvements: [
      "50% faster loading times for production dashboards",
      "Improved search relevance for contacts and crew",
      "Better mobile responsiveness across all pages",
    ],
    fixes: [
      "Fixed PDF export failing for large budget reports",
      "Resolved calendar sync issues with Outlook",
      "Fixed notification preferences not saving correctly",
    ],
  },
  {
    version: "2.3.2",
    date: "December 1, 2024",
    type: "patch",
    highlights: [
      "Critical security patch for authentication",
      "Performance improvements for large teams",
    ],
    features: [],
    improvements: [
      "Optimized database queries for faster page loads",
      "Reduced memory usage in background jobs",
    ],
    fixes: [
      "Fixed authentication token refresh issue",
      "Resolved duplicate notification emails",
      "Fixed crew availability calendar display bug",
    ],
  },
  {
    version: "2.3.0",
    date: "November 15, 2024",
    type: "minor",
    highlights: [
      "New production templates feature",
      "Enhanced reporting dashboard",
      "Improved permissions system",
    ],
    features: [
      { title: "Production templates", description: "Save and reuse production configurations" },
      { title: "Custom report builder", description: "Create tailored reports for stakeholders" },
      { title: "Granular permissions", description: "Fine-tune access at the field level" },
    ],
    improvements: [
      "Redesigned navigation for better usability",
      "Added keyboard shortcuts throughout the app",
      "Improved accessibility for screen readers",
    ],
    fixes: [
      "Fixed timezone handling in scheduling",
      "Resolved file upload size limit issues",
      "Fixed sorting in crew directory",
    ],
  },
];

const upcomingFeatures = [
  { title: "AI-powered scheduling suggestions", eta: "Q1 2025" },
  { title: "Advanced analytics dashboard", eta: "Q1 2025" },
  { title: "Mobile app for iOS and Android", eta: "Q2 2025" },
  { title: "Vendor portal for external collaborators", eta: "Q2 2025" },
];

export default function ReleasesPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-20 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <FileText className="size-10 text-brand-pink" />
            </Stack>
            <Display size="lg" className="text-white">
              RELEASE NOTES
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              Stay up to date with the latest features, improvements, and bug fixes 
              in ATLVS. We ship updates regularly to make your experience better.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/settings/notifications">
                <Button variant="pop" size="lg" icon={<Bell />}>
                  Subscribe to Updates
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Latest Release */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8}>
            <Stack gap={4}>
              <Badge variant="success" size="lg">Latest Release</Badge>
              <Stack direction="horizontal" gap={4} className="items-baseline">
                <Display size="md" className="text-ink-950">v{releases[0].version}</Display>
                <Label size="sm" className="text-grey-500">{releases[0].date}</Label>
              </Stack>
            </Stack>

            {/* Highlights */}
            <Card className="border-2 border-primary bg-primary/5 p-6">
              <Stack gap={4}>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Sparkles className="size-5 text-primary" />
                  <H3 size="sm" className="text-primary">HIGHLIGHTS</H3>
                </Stack>
                <Stack gap={2}>
                  {releases[0].highlights.map((highlight, idx) => (
                    <Stack key={idx} direction="horizontal" gap={3} className="items-start">
                      <ChevronRight className="size-4 shrink-0 text-primary mt-1" />
                      <Body className="text-ink-950">{highlight}</Body>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Card>

            <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
              {/* New Features */}
              {releases[0].features.length > 0 && (
                <Card className="border-2 border-ink-950 p-6">
                  <Stack gap={4}>
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <Zap className="size-5 text-success" />
                      <H3 size="sm" className="text-ink-950">NEW FEATURES</H3>
                    </Stack>
                    <Stack gap={4}>
                      {releases[0].features.map((feature, idx) => (
                        <Stack key={idx} gap={1}>
                          <Body className="font-weight-semibold text-ink-950">{feature.title}</Body>
                          <Body size="sm" className="text-grey-600">{feature.description}</Body>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              )}

              {/* Improvements */}
              <Card className="border-2 border-ink-950 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Wrench className="size-5 text-info" />
                    <H3 size="sm" className="text-ink-950">IMPROVEMENTS</H3>
                  </Stack>
                  <Stack gap={2}>
                    {releases[0].improvements.map((improvement, idx) => (
                      <Body key={idx} size="sm" className="text-grey-600">• {improvement}</Body>
                    ))}
                  </Stack>
                </Stack>
              </Card>

              {/* Bug Fixes */}
              <Card className="border-2 border-ink-950 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Bug className="size-5 text-warning" />
                    <H3 size="sm" className="text-ink-950">BUG FIXES</H3>
                  </Stack>
                  <Stack gap={2}>
                    {releases[0].fixes.map((fix, idx) => (
                      <Body key={idx} size="sm" className="text-grey-600">• {fix}</Body>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Previous Releases */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8}>
            <H2 className="text-ink-950">PREVIOUS RELEASES</H2>
            
            <Stack gap={6}>
              {releases.slice(1).map((release) => (
                <Card key={release.version} className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack direction="horizontal" gap={4} className="items-center">
                        <H3 className="text-ink-950">v{release.version}</H3>
                        <Badge variant={release.type === 'patch' ? 'outline' : 'solid'} size="sm">
                          {release.type}
                        </Badge>
                      </Stack>
                      <Stack direction="horizontal" gap={2} className="items-center text-grey-500">
                        <Calendar className="size-4" />
                        <Label size="sm">{release.date}</Label>
                      </Stack>
                    </Stack>
                    
                    <Stack gap={2}>
                      {release.highlights.map((highlight, idx) => (
                        <Body key={idx} size="sm" className="text-grey-600">• {highlight}</Body>
                      ))}
                    </Stack>

                    {(release.fixes.length > 0 || release.improvements.length > 0) && (
                      <Stack direction="horizontal" gap={4}>
                        {release.features.length > 0 && (
                          <Badge variant="success" size="sm">{release.features.length} features</Badge>
                        )}
                        {release.improvements.length > 0 && (
                          <Badge variant="info" size="sm">{release.improvements.length} improvements</Badge>
                        )}
                        {release.fixes.length > 0 && (
                          <Badge variant="warning" size="sm">{release.fixes.length} fixes</Badge>
                        )}
                      </Stack>
                    )}
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Upcoming Features */}
      <FullBleedSection background="ink" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8}>
            <Stack gap={4} className="text-center">
              <H2 className="text-white">COMING SOON</H2>
              <Body className="text-on-dark-secondary">
                Here&apos;s what we&apos;re working on next
              </Body>
            </Stack>

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              {upcomingFeatures.map((feature) => (
                <Card 
                  key={feature.title} 
                  inverted 
                  className="border-2 border-ink-700 bg-ink-800 p-6 transition-all hover:border-brand-pink"
                >
                  <Stack gap={3}>
                    <Badge variant="outline" className="w-fit border-brand-pink text-brand-pink">
                      {feature.eta}
                    </Badge>
                    <Body className="font-weight-semibold text-white">{feature.title}</Body>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Feedback CTA */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center">
            <H2 className="text-ink-950">HAVE A FEATURE REQUEST?</H2>
            <Body size="lg" className="text-grey-600">
              We love hearing from our users. Share your ideas and help us 
              build the features you need most.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/feedback/features">
                <Button variant="solid" size="lg">
                  Submit Feature Request
                </Button>
              </NextLink>
              <NextLink href="/feedback/bugs">
                <Button variant="outline" size="lg" icon={<ArrowRight />}>
                  Report a Bug
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
