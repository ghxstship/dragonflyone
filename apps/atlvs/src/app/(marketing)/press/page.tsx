"use client";

/**
 * Press Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, press releases, media kit, and contact
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Download, Mail, Calendar, ArrowRight, FileText, Package, Users, ImageIcon } from "lucide-react";
import {
  MarketingPage, HeroSection, CTABanner, Container, Stack, Grid, Card, Body, H3, Button, Badge} from "@ghxstship/ui";

interface PressRelease {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
}

const PRESS_RELEASES: PressRelease[] = [
  { id: "1", title: "ATLVS Raises $50M Series B to Expand Production Platform", date: "2024-12-01", excerpt: "Funding will accelerate product development and global expansion, enabling ATLVS to serve more production teams worldwide.", category: "Funding" },
  { id: "2", title: "ATLVS Named Leader in Production Management Software", date: "2024-11-15", excerpt: "Industry analysts recognize ATLVS for innovation and customer satisfaction in the production management space.", category: "Awards" },
  { id: "3", title: "ATLVS Launches Real-time Collaboration Features", date: "2024-10-20", excerpt: "New features enable teams to work together seamlessly across locations with real-time updates and commenting.", category: "Product" },
  { id: "4", title: "ATLVS Partners with Major Festival Organizers", date: "2024-09-10", excerpt: "Strategic partnerships expand reach in live events industry, bringing ATLVS to the world's largest festivals.", category: "Partnership" },
];

const MEDIA_ASSETS = [
  { id: "logos", name: "Logo Pack", description: "ATLVS logos in PNG, SVG, and EPS formats", format: "ZIP", size: "2.4 MB", icon: <Package className="size-6" /> },
  { id: "brand", name: "Brand Guidelines", description: "Official brand usage guidelines and standards", format: "PDF", size: "8.2 MB", icon: <FileText className="size-6" /> },
  { id: "screenshots", name: "Product Screenshots", description: "High-resolution product images for press use", format: "ZIP", size: "15.6 MB", icon: <ImageIcon className="size-6" /> },
  { id: "photos", name: "Executive Photos", description: "Leadership team headshots and bios", format: "ZIP", size: "4.8 MB", icon: <Users className="size-6" /> },
];

export default function PressPage() {
  const router = useRouter();

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Funding: "bg-success/20 text-success border-success/30",
      Awards: "bg-accent/20 text-accent border-accent/30",
      Product: "bg-primary/20 text-primary border-primary/30",
      Partnership: "bg-secondary/20 text-secondary border-secondary/30",
    };
    return colors[category] || "bg-grey-800 text-on-dark-muted border-grey-700";
  };

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
              kicker="Company"
              title="Press & Media"
              description="News, press releases, and media resources for journalists and analysts covering ATLVS."
              primaryCta={{
                label: "Media Inquiries",
                onClick: () => router.push("/contact?reason=press"),
              }}
              secondaryCta={{
                label: "Download Media Kit",
                onClick: () => document.getElementById("media-kit")?.scrollIntoView({ behavior: "smooth" }),
              }}
              background="gradient"
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "releases",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <Container size="xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Latest News</Body>
                  <H3 className="text-white">Press Releases</H3>
                  <Body className="text-on-dark-muted max-w-2xl">Stay up to date with the latest news and announcements from ATLVS.</Body>
                </Stack>

                <Stack gap={4}>
                  {PRESS_RELEASES.map((release) => (
                    <Card
                      key={release.id}
                      className="p-6 border-2 border-grey-800 rounded-card cursor-pointer hover:border-primary/50 transition-all group"
                      onClick={() => router.push(`/press/${release.id}`)}
                    >
                      <Stack direction="horizontal" className="justify-between items-start flex-wrap gap-4">
                        <Stack gap={3} className="flex-1">
                          <Stack direction="horizontal" gap={3} className="items-center flex-wrap">
                            <Badge className={getCategoryColor(release.category)}>{release.category}</Badge>
                            <Stack direction="horizontal" gap={1} className="items-center text-on-dark-disabled">
                              <Calendar className="size-4" />
                              <Body size="sm">{formatDate(release.date)}</Body>
                            </Stack>
                          </Stack>
                          <Body className="text-white font-weight-bold group-hover:text-primary transition-colors">{release.title}</Body>
                          <Body className="text-on-dark-muted">{release.excerpt}</Body>
                        </Stack>
                        <ArrowRight className="size-5 text-on-dark-disabled group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Container>
          ),
        },
        {
          id: "media-kit",
          background: "black",
          content: (
            <Container size="xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Resources</Body>
                  <H3 className="text-white">Media Kit</H3>
                  <Body className="text-on-dark-muted max-w-2xl">Download official ATLVS brand assets for press and media use.</Body>
                </Stack>

                <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2">
                  {MEDIA_ASSETS.map((asset) => (
                    <Card key={asset.id} className="p-6 border-2 border-grey-800 rounded-card hover:border-primary/50 transition-all">
                      <Stack direction="horizontal" className="justify-between items-start gap-4">
                        <Stack direction="horizontal" gap={4} className="items-start">
                          <div className="p-3 bg-primary/20 rounded-card text-primary">
                            {asset.icon}
                          </div>
                          <Stack gap={1}>
                            <Body className="text-white font-weight-bold">{asset.name}</Body>
                            <Body size="sm" className="text-on-dark-muted">{asset.description}</Body>
                            <Stack direction="horizontal" gap={2} className="mt-2">
                              <Badge variant="outline">{asset.format}</Badge>
                              <Body size="sm" className="text-on-dark-disabled">{asset.size}</Body>
                            </Stack>
                          </Stack>
                        </Stack>
                        <Button variant="outline" size="sm" icon={<Download className="size-4" />} iconPosition="left">
                          Download
                        </Button>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Container>
          ),
        },
        {
          id: "contact",
          background: "ink",
          content: (
            <Container size="lg" className="py-20">
              <Card className="p-12 border-2 border-grey-800 rounded-card">
                <Stack direction="horizontal" className="justify-between items-center flex-wrap gap-8">
                  <Stack direction="horizontal" gap={6} className="items-center">
                    <div className="p-4 bg-primary/20 rounded-card">
                      <Mail className="size-8 text-primary" />
                    </div>
                    <Stack gap={1}>
                      <Body className="text-white font-weight-bold text-h5-md">Press Contact</Body>
                      <Body className="text-on-dark-muted">For media inquiries, interviews, and press information</Body>
                      <Body className="text-primary font-weight-medium mt-2">press@atlvs.com</Body>
                    </Stack>
                  </Stack>
                  <Button variant="solid" onClick={() => router.push("/contact?reason=press")}>
                    Contact Press Team
                  </Button>
                </Stack>
              </Card>
            </Container>
          ),
        },
        {
          id: "cta",
          background: "primary",
          pattern: "halftone",
          content: (
            <CTABanner
              title="Want to Learn More About ATLVS?"
              description="Schedule a briefing with our team to learn about our product roadmap and company vision."
              primaryCta={{
                label: "Schedule Briefing",
                onClick: () => router.push("/contact?reason=press"),
              }}
              secondaryCta={{
                label: "View About Page",
                onClick: () => router.push("/about"),
              }}
              background="primary"
            />
          ),
        },
      ]}
    />
  );
}
