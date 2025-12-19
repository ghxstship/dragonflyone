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
} from "@ghxstship/ui";
import { Download, ExternalLink, Calendar, ArrowRight } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const pressData = {
  hero: {
    headline: "PRESS & MEDIA",
    description: "News, announcements, and resources for journalists and media professionals.",
  },
  featuredNews: [
    {
      date: "December 2024",
      title: "ATLVS Raises $12M Series A to Transform Production Management",
      source: "TechCrunch",
      excerpt: "The Miami-based startup is revolutionizing how live events and productions are managed with its comprehensive platform.",
      link: "#",
    },
    {
      date: "November 2024",
      title: "How ATLVS is Powering the World's Biggest Festivals",
      source: "Billboard",
      excerpt: "From III Points to Formula 1, ATLVS has become the go-to platform for production professionals.",
      link: "#",
    },
    {
      date: "October 2024",
      title: "The Future of Event Production is Here",
      source: "Event Industry News",
      excerpt: "ATLVS combines project management, finance, and crew coordination into one powerful platform.",
      link: "#",
    },
  ],
  pressReleases: [
    { date: "Dec 1, 2024", title: "ATLVS Announces Integration with Major Ticketing Platforms" },
    { date: "Nov 15, 2024", title: "ATLVS Expands to European Market" },
    { date: "Oct 28, 2024", title: "ATLVS Launches Mobile App for On-Site Production Management" },
    { date: "Sep 10, 2024", title: "ATLVS Partners with Live Nation for Enterprise Deployment" },
  ],
  mediaKit: {
    title: "MEDIA KIT",
    description: "Download logos, brand guidelines, and executive headshots for press use.",
    items: ["Logo Pack (SVG, PNG)", "Brand Guidelines", "Executive Bios", "Product Screenshots"],
  },
  contact: {
    name: "Press Inquiries",
    email: "press@atlvs.io",
  },
};

export default function PressPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="max-w-3xl">
            <Label size="xs" className="text-on-dark-muted">
              NEWSROOM
            </Label>
            <Display size="lg" className="text-white">
              {pressData.hero.headline}
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              {pressData.hero.description}
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Featured News */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-16">
            <H1 className="text-ink-950">IN THE NEWS</H1>
          </Stack>

          <Grid cols={3} gap={6} className="sm:grid-cols-1">
            {pressData.featuredNews.map((item) => (
              <Card key={item.title} className="border-2 border-ink-950 bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Calendar className="size-4 text-grey-400" />
                    <Label size="xs" className="text-grey-500">{item.date}</Label>
                    <Label size="xs" className="text-brand-pink">{item.source}</Label>
                  </Stack>
                  <H3 size="sm" className="text-ink-950">
                    {item.title}
                  </H3>
                  <Body size="sm" className="text-grey-600">
                    {item.excerpt}
                  </Body>
                  <NextLink href={item.link} className="inline-flex items-center gap-1 text-brand-pink">
                    <Label size="xs">Read More</Label>
                    <ExternalLink className="size-3" />
                  </NextLink>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Press Releases */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Grid cols={2} gap={12} className="sm:grid-cols-1">
            <Stack gap={8}>
              <H1 className="text-ink-950">PRESS RELEASES</H1>
              <Stack gap={4}>
                {pressData.pressReleases.map((release) => (
                  <Card key={release.title} className="border-2 border-ink-950 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                    <Stack direction="horizontal" className="items-center justify-between gap-4">
                      <Stack gap={1}>
                        <Label size="xs" className="text-grey-500">{release.date}</Label>
                        <Body size="sm" className="text-ink-950">{release.title}</Body>
                      </Stack>
                      <ArrowRight className="size-4 text-grey-400" />
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>

            {/* Media Kit */}
            <Card className="border-2 border-ink-950 bg-grey-100 p-8 shadow-lg">
              <Stack gap={6}>
                <Stack className="flex size-12 items-center justify-center border-2 border-ink-950 bg-white">
                  <Download className="size-6 text-ink-950" />
                </Stack>
                <H3 className="text-ink-950">{pressData.mediaKit.title}</H3>
                <Body size="sm" className="text-grey-600">
                  {pressData.mediaKit.description}
                </Body>
                <Stack gap={2}>
                  {pressData.mediaKit.items.map((item) => (
                    <Label key={item} size="xs" className="text-grey-500">
                      {item}
                    </Label>
                  ))}
                </Stack>
                <Button variant="pop" size="md" icon={<Download />}>
                  Download Media Kit
                </Button>
              </Stack>
            </Card>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Contact */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-white">
              PRESS INQUIRIES
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              For media inquiries, interviews, or additional information, please contact our press team.
            </Body>
            <NextLink href={`mailto:${pressData.contact.email}`}>
              <Button variant="pop" size="lg" icon={<ArrowRight />}>
                {pressData.contact.email}
              </Button>
            </NextLink>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
