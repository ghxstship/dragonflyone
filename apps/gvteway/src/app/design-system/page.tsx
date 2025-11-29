"use client";

import { GvtewayAppLayout } from "@/components/app-layout";
import {
  Hero,
  Button,
  Display,
  H2,
  H3,
  Body,
  Label,
  ProjectCard,
  ServiceCard,
  StatCard,
  Newsletter,
  SocialIcon,
  Input,
  Textarea,
  Select,
  Checkbox,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Alert,
  ArrowRight,
  Stack,
  Grid,
  Card,
  Section,
} from "@ghxstship/ui";

export default function DesignSystemPage() {
  return (
    <GvtewayAppLayout>
      <Hero
        title="Design System"
        subtitle="Contemporary Minimal Pop Art"
        background="black"
        pattern="halftone"
        cta={
          <>
            <Button variant="solid" icon={<ArrowRight />}>
              Explore Components
            </Button>
            <Button variant="outlineWhite">View Documentation</Button>
          </>
        }
      />

      <Section id="typography">
        <Stack gap={12}>
          <Stack>
            <Label size="sm" className="text-ink-600 mb-4 block">
              Typography System
            </Label>
            <H2>Bold Typography</H2>
            <Body className="mt-4">
              GHXSTSHIP&apos;s design system features stark black and white contrast with strategic grey usage. Our typography system uses ANTON for display text, BEBAS NEUE for headings, SHARE TECH for body copy, and SHARE TECH MONO for labels and metadata.
            </Body>
          </Stack>

          <Grid cols={2} gap={8}>
            <Card className="border-2 border-black p-6">
              <Label className="text-ink-600 mb-2">Display</Label>
              <Display size="md">GHXSTSHIP</Display>
            </Card>
            <Card className="border-2 border-black p-6">
              <Label className="text-ink-600 mb-2">Heading H2</Label>
              <H2>We Create Beyond Reality</H2>
            </Card>
            <Card className="border-2 border-black p-6">
              <Label className="text-ink-600 mb-2">Heading H3</Label>
              <H3>Immersive Entertainment</H3>
            </Card>
            <Card className="border-2 border-black p-6">
              <Label className="text-ink-600 mb-2">Body Text</Label>
              <Body>
                We architect impossible experiences that push the boundaries of what audiences expect, transforming abstract concepts into tangible realities.
              </Body>
            </Card>
          </Grid>
        </Stack>
      </Section>

      <Section id="components" background="grey">
        <Stack gap={12}>
          <Stack>
            <Label size="sm" className="text-ink-600 mb-4 block">
              Core Components
            </Label>
            <H2>Buttons & Actions</H2>
          </Stack>

          <Stack direction="horizontal" gap={4} className="flex-wrap">
            <Button variant="solid">Solid Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="solid" size="lg" icon={<ArrowRight />}>
              Large with Icon
            </Button>
            <Button variant="outline" size="sm">
              Small Button
            </Button>
          </Stack>

          <Stack>
            <H3 className="mb-6">Badges & Labels</H3>
            <Stack direction="horizontal" gap={3} className="flex-wrap">
              <Badge>Default</Badge>
              <Badge>Status</Badge>
              <Badge>Category</Badge>
              <Label uppercase={false} className="text-ink-600">
                TAMPA, FL // EST. 2022 // 52+ COUNTRIES
              </Label>
            </Stack>
          </Stack>

          <Stack>
            <H3 className="mb-6">Alerts</H3>
            <Stack gap={4}>
              <Alert variant="success">Operation completed successfully</Alert>
              <Alert variant="error">An error occurred during processing</Alert>
              <Alert variant="warning">Please review your submission</Alert>
              <Alert variant="info">New features available</Alert>
            </Stack>
          </Stack>
        </Stack>
      </Section>

      <Section id="cards">
        <Stack gap={12}>
          <Stack>
            <Label size="sm" className="text-ink-600 mb-4 block">
              Card Components
            </Label>
            <H2>Content Cards</H2>
          </Stack>

          <Grid cols={3} gap={6}>
            <StatCard
              label="Total Events"
              value="1,247"
              trend="up"
              trendValue="+12.5%"
            />
            <StatCard
              label="Active Users"
              value="52.3K"
              trend="up"
              trendValue="+8.3%"
            />
            <StatCard
              label="Revenue"
              value="$2.4M"
              trend="down"
              trendValue="-2.1%"
            />
          </Grid>

          <Grid cols={3} gap={6}>
            <ServiceCard
              icon="🎭"
              title="Design"
              description="Strategic brand development, visual identity systems, and immersive experience design."
              background="white"
            />
            <ServiceCard
              icon="⚡"
              title="Development"
              description="Full-stack engineering, API architecture, and scalable cloud infrastructure."
              background="white"
            />
            <ServiceCard
              icon="🚀"
              title="Direction"
              description="Executive consulting, product strategy, and operational excellence."
              background="white"
            />
          </Grid>

          <Grid cols={3} gap={6}>
            <ProjectCard
              title="Formula 1 Miami GP"
              image="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800"
              imageAlt="Formula 1"
              metadata="MIAMI, FL // 2024"
              tags={["EXPERIENTIAL", "SPORTS", "LUXURY"]}
            />
            <ProjectCard
              title="Ultra Music Festival"
              image="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800"
              imageAlt="Music Festival"
              metadata="MIAMI, FL // 2024"
              tags={["FESTIVAL", "MUSIC", "PRODUCTION"]}
            />
            <ProjectCard
              title="Art Basel"
              image="https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800"
              imageAlt="Art Exhibition"
              metadata="BASEL, CH // 2024"
              tags={["ART", "LUXURY", "CULTURE"]}
            />
          </Grid>
        </Stack>
      </Section>

      <Section id="forms" background="grey">
        <Stack gap={12}>
          <Stack>
            <Label size="sm" className="text-ink-600 mb-4 block">
              Form Elements
            </Label>
            <H2>Input Components</H2>
          </Stack>

          <Stack gap={6} className="max-w-2xl">
            <Stack>
              <Label className="mb-2 block">Email Address</Label>
              <Input type="email" placeholder="your@email.com" />
            </Stack>

            <Stack>
              <Label className="mb-2 block">Message</Label>
              <Textarea placeholder="Tell us about your project..." rows={4} />
            </Stack>

            <Stack>
              <Label className="mb-2 block">Service Type</Label>
              <Select>
                <option>Select a service</option>
                <option>Design</option>
                <option>Development</option>
                <option>Direction</option>
                <option>Disruption</option>
              </Select>
            </Stack>

            <Stack direction="horizontal" gap={2} className="items-center">
              <Checkbox id="terms" />
              <Label className="cursor-pointer text-body-sm">
                I agree to the terms and conditions
              </Label>
            </Stack>

            <Button variant="solid" size="lg" className="w-full">
              Submit Request
            </Button>
          </Stack>

          <Stack className="max-w-md">
            <H3 className="mb-4">Newsletter</H3>
            <Newsletter
              placeholder="Your email address"
              buttonText="Subscribe"
              onSubmit={async (email) => {
                console.log("Newsletter signup:", email);
              }}
            />
          </Stack>
        </Stack>
      </Section>

      <Section background="black">
        <Stack gap={8} className="text-center">
          <H2 className="text-white">Ready to Start?</H2>
          <Body className="text-ink-400 mx-auto max-w-2xl">
            Connect with our team to discuss your next immersive experience project.
          </Body>
          <Stack direction="horizontal" gap={4} className="justify-center">
            <SocialIcon platform="instagram" href="#" inverted />
            <SocialIcon platform="twitter" href="#" inverted />
            <SocialIcon platform="linkedin" href="#" inverted />
            <SocialIcon platform="email" href="mailto:hello@ghxstship.com" inverted />
          </Stack>
        </Stack>
      </Section>

      <Section>
        <Stack>
          <Label size="sm" className="text-ink-600 mb-4 block">
            Data Tables
          </Label>
          <H2 className="mb-8">Table Component</H2>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Formula 1 Miami GP</TableCell>
                <TableCell>Formula One Group</TableCell>
                <TableCell>
                  <Badge>Active</Badge>
                </TableCell>
                <TableCell>$2.5M</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Ultra Music Festival</TableCell>
                <TableCell>Ultra Worldwide</TableCell>
                <TableCell>
                  <Badge>Planning</Badge>
                </TableCell>
                <TableCell>$1.8M</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Art Basel</TableCell>
                <TableCell>MCH Group</TableCell>
                <TableCell>
                  <Badge>Completed</Badge>
                </TableCell>
                <TableCell>$950K</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Stack>
      </Section>
    </GvtewayAppLayout>
  );
}
