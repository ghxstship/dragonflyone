"use client";

/**
 * Press Page
 * Press releases and media resources
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Download, Mail, Calendar, List, Image as ImageIcon } from "lucide-react";
import {
  Badge,
  Body,
  Button,
  Card,
  Grid,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

interface PressRelease {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
}

const PRESS_RELEASES: PressRelease[] = [
  { id: "1", title: "ATLVS Raises $50M Series B to Expand Production Platform", date: "2024-12-01", excerpt: "Funding will accelerate product development and global expansion...", category: "Funding" },
  { id: "2", title: "ATLVS Named Leader in Production Management Software", date: "2024-11-15", excerpt: "Industry analysts recognize ATLVS for innovation and customer satisfaction...", category: "Awards" },
  { id: "3", title: "ATLVS Launches Real-time Collaboration Features", date: "2024-10-20", excerpt: "New features enable teams to work together seamlessly...", category: "Product" },
  { id: "4", title: "ATLVS Partners with Major Festival Organizers", date: "2024-09-10", excerpt: "Strategic partnerships expand reach in live events industry...", category: "Partnership" },
];

const MEDIA_ASSETS = [
  { name: "Logo Pack", description: "ATLVS logos in various formats", format: "ZIP" },
  { name: "Brand Guidelines", description: "Official brand usage guidelines", format: "PDF" },
  { name: "Product Screenshots", description: "High-resolution product images", format: "ZIP" },
  { name: "Executive Photos", description: "Leadership team headshots", format: "ZIP" },
];

export default function PressPage() {
  const router = useRouter();

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const tabs = [
    {
      id: "releases",
      label: "Press Releases",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <div className="space-y-4">
            {PRESS_RELEASES.map((release) => (
              <Card key={release.id} className="p-6 cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(`/press/${release.id}`)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{release.category}</Badge>
                      <div className="flex items-center gap-1 text-grey-500">
                        <Calendar className="size-4" />
                        <Body size="sm">{formatDate(release.date)}</Body>
                      </div>
                    </div>
                    <Body className="font-weight-bold mb-2">{release.title}</Body>
                    <Body className="text-grey-400">{release.excerpt}</Body>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ),
    },
    {
      id: "media",
      label: "Media Kit",
      icon: <ImageIcon className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Media Resources" description="Download official ATLVS brand assets" />
          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2 mt-6">
            {MEDIA_ASSETS.map((asset, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <Body className="font-weight-bold">{asset.name}</Body>
                    <Body size="sm" className="text-grey-400">{asset.description}</Body>
                    <Badge variant="outline" className="mt-2">{asset.format}</Badge>
                  </div>
                  <Button variant="outline" size="sm" icon={<Download className="size-4" />} iconPosition="left">Download</Button>
                </div>
              </Card>
            ))}
          </Grid>

          <Card className="p-6 mt-8">
            <SectionHeader title="Press Contact" />
            <div className="flex items-center gap-4 mt-4">
              <div className="p-3 bg-primary/20 rounded-card"><Mail className="size-6 text-primary" /></div>
              <div>
                <Body className="font-weight-medium">Media Inquiries</Body>
                <Body size="sm" className="text-grey-400">press@atlvs.com</Body>
              </div>
            </div>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Company",
        title: "Press & Media",
        description: "News, press releases, and media resources",
      }}
      tabs={tabs}
      actions={<Button variant="outline" onClick={() => router.push("/contact")}>Media Inquiries</Button>}
    />
  );
}
