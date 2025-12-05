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
import { MapPin, Clock, Briefcase, ArrowRight, Users, Zap, Heart, Coffee } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const careersData = {
  hero: {
    headline: "BUILD THE FUTURE OF PRODUCTION",
    description: "Join a team of passionate builders creating tools that power the world's most ambitious productions.",
  },
  perks: [
    { icon: Users, title: "REMOTE-FIRST", description: "Work from anywhere. We believe great work happens everywhere." },
    { icon: Zap, title: "SHIP FAST", description: "Move quickly, break things thoughtfully, and learn constantly." },
    { icon: Heart, title: "HEALTH & WELLNESS", description: "Comprehensive benefits including mental health support." },
    { icon: Coffee, title: "UNLIMITED PTO", description: "Take the time you need. We trust you to manage your schedule." },
  ],
  departments: [
    { name: "Engineering", count: 4 },
    { name: "Product", count: 2 },
    { name: "Design", count: 1 },
    { name: "Sales", count: 3 },
    { name: "Operations", count: 2 },
  ],
  openings: [
    {
      title: "Senior Full-Stack Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Build and scale our core platform serving thousands of productions worldwide.",
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      description: "Shape the future of production management through thoughtful, user-centered design.",
    },
    {
      title: "Enterprise Account Executive",
      department: "Sales",
      location: "Los Angeles, CA",
      type: "Full-time",
      description: "Drive growth by partnering with major production companies and festivals.",
    },
    {
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Build and maintain infrastructure that powers mission-critical production operations.",
    },
    {
      title: "Customer Success Manager",
      department: "Operations",
      location: "Miami, FL",
      type: "Full-time",
      description: "Ensure our customers achieve their production goals with ATLVS.",
    },
  ],
};

export default function CareersPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={8} className="max-w-3xl">
            <Label size="xs" className="text-on-dark-muted">
              CAREERS AT ATLVS
            </Label>
            <Display size="lg" className="text-white">
              {careersData.hero.headline}
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              {careersData.hero.description}
            </Body>
            <NextLink href="#openings">
              <Button variant="pop" size="lg" icon={<ArrowRight />}>
                View Open Positions
              </Button>
            </NextLink>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Perks */}
      <FullBleedSection background="white" className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={4} className="mb-16 text-center">
            <H1 className="text-ink-950">WHY ATLVS</H1>
            <Body size="lg" className="mx-auto max-w-2xl text-grey-600">
              We&apos;re building something special and want you to be part of it.
            </Body>
          </Stack>

          <Grid cols={4} gap={6}>
            {careersData.perks.map((perk) => (
              <Card key={perk.title} className="border-2 border-ink-950 bg-white p-6 shadow-md">
                <Stack gap={4}>
                  <Stack className="flex size-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                    <perk.icon className="size-6 text-ink-950" />
                  </Stack>
                  <H3 size="sm" className="text-ink-950">
                    {perk.title}
                  </H3>
                  <Body size="sm" className="text-grey-600">
                    {perk.description}
                  </Body>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Open Positions */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24" id="openings">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={4} className="mb-16 text-center">
            <H1 className="text-ink-950">OPEN POSITIONS</H1>
            <Body size="lg" className="mx-auto max-w-2xl text-grey-600">
              Find your next role and help us transform production management.
            </Body>
          </Stack>

          {/* Department filters */}
          <Stack direction="horizontal" gap={3} className="mb-8 flex-wrap justify-center">
            {careersData.departments.map((dept) => (
              <Badge key={dept.name} variant="outline" className="border-ink-950 text-ink-950">
                {dept.name} ({dept.count})
              </Badge>
            ))}
          </Stack>

          {/* Job listings */}
          <Stack gap={4}>
            {careersData.openings.map((job) => (
              <Card key={job.title} className="border-2 border-ink-950 bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
                <Stack direction="horizontal" className="items-start justify-between gap-6">
                  <Stack gap={3} className="flex-1">
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <H3 className="text-ink-950">{job.title}</H3>
                      <Badge variant="outline">{job.department}</Badge>
                    </Stack>
                    <Body size="sm" className="text-grey-600">
                      {job.description}
                    </Body>
                    <Stack direction="horizontal" gap={4} className="text-grey-500">
                      <Stack direction="horizontal" gap={1} className="items-center">
                        <MapPin className="size-4" />
                        <Label size="xs">{job.location}</Label>
                      </Stack>
                      <Stack direction="horizontal" gap={1} className="items-center">
                        <Clock className="size-4" />
                        <Label size="xs">{job.type}</Label>
                      </Stack>
                      <Stack direction="horizontal" gap={1} className="items-center">
                        <Briefcase className="size-4" />
                        <Label size="xs">{job.department}</Label>
                      </Stack>
                    </Stack>
                  </Stack>
                  <NextLink href={`/careers/${job.title.toLowerCase().replace(/\s+/g, "-")}`}>
                    <Button variant="outline" size="sm" icon={<ArrowRight />}>
                      Apply
                    </Button>
                  </NextLink>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Container>
      </FullBleedSection>

      {/* CTA */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 text-center lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-white">
              DON&apos;T SEE YOUR ROLE?
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              We&apos;re always looking for exceptional talent. Send us your resume and tell us how you can contribute.
            </Body>
            <NextLink href="/contact">
              <Button variant="pop" size="lg" icon={<ArrowRight />}>
                Get in Touch
              </Button>
            </NextLink>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
