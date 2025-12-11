'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Eye, FileText, Presentation, Edit, Share2 } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { useSponsorTiers, useSponsorStats } from '../../../hooks/useSponsors';
import { logger } from '@ghxstship/config';
import {
  Container,
  Section,
  Stack,
  Grid,
  Card,
  H2,
  H3,
  Body,
  Button,
  Badge,
  Box,
} from '@ghxstship/ui';

export default function SponsorshipDeckPage() {
  const router = useRouter();
  const { data: tiers } = useSponsorTiers();
  const { data: stats } = useSponsorStats();
  
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'pptx' | 'web'>('pdf');

  const handleDownload = async () => {
    logger.info('Deck generation triggered');
    const response = await fetch(`/api/sponsors/deck/generate?format=${selectedFormat}`, { method: 'POST' });
    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sponsorship-deck.${selectedFormat}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handlePreview = () => {
    logger.info('Deck preview triggered');
    window.open('/sponsors/deck/preview', '_blank');
  };

  return (
    <AtlvsAppLayout>
      <Section className="min-h-screen bg-grey-100 py-8">
        <Container>
          <Stack gap={6}>
            {/* Header */}
            <Stack direction="horizontal" gap={4} className="items-start justify-between">
              <Stack gap={2}>
                <H2>Sponsorship Deck</H2>
                <Body className="text-grey-600">
                  Generate and customize your sponsorship presentation
                </Body>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Button
                  onClick={handlePreview}
                  variant="outline"
                  size="sm"
                  icon={<Eye className="size-4" />}
                  iconPosition="left"
                >
                  Preview
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="solid"
                  size="sm"
                  icon={<Download className="size-4" />}
                  iconPosition="left"
                >
                  Download
                </Button>
              </Stack>
            </Stack>

            <Grid cols={3} gap={6}>
              {/* Main Content */}
              <Box className="col-span-2">
                <Stack gap={4}>
                  {/* Deck Preview */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Deck Contents</H3>
                      <Stack gap={3}>
                        {[
                          { slide: 1, title: 'Cover Slide', description: 'Event name, dates, and branding' },
                          { slide: 2, title: 'About the Event', description: 'Event overview and history' },
                          { slide: 3, title: 'Audience Demographics', description: 'Target audience and reach' },
                          { slide: 4, title: 'Sponsorship Tiers', description: 'Available sponsorship levels' },
                          { slide: 5, title: 'Benefits Overview', description: 'What sponsors receive' },
                          { slide: 6, title: 'Past Sponsors', description: 'Previous sponsor logos and testimonials' },
                          { slide: 7, title: 'Media Coverage', description: 'Press and social media reach' },
                          { slide: 8, title: 'Contact Information', description: 'How to get in touch' },
                        ].map(slide => (
                          <Card key={slide.slide} className="border-2 border-grey-200 p-4">
                            <Stack direction="horizontal" gap={4} className="items-center justify-between">
                              <Stack direction="horizontal" gap={4} className="items-center">
                                <Box className="flex size-10 items-center justify-center rounded-card border-2 border-grey-300 bg-grey-100 font-weight-bold">
                                  {slide.slide}
                                </Box>
                                <Stack gap={0}>
                                  <Body className="font-weight-semibold">{slide.title}</Body>
                                  <Body className="text-body-sm text-grey-500">{slide.description}</Body>
                                </Stack>
                              </Stack>
                              <Button variant="outline" size="icon">
                                <Edit className="size-4" />
                              </Button>
                            </Stack>
                          </Card>
                        ))}
                      </Stack>
                    </Stack>
                  </Card>

                  {/* Tier Summary */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Sponsorship Tiers in Deck</H3>
                      {tiers && tiers.length > 0 ? (
                        <Grid cols={2} gap={4}>
                          {tiers.filter(t => t.is_active).map(tier => (
                            <Card key={tier.id} className="border-2 border-grey-200 p-4">
                              <Stack gap={2}>
                                <Stack direction="horizontal" gap={2} className="items-center justify-between">
                                  <Body className="font-weight-semibold">{tier.name}</Body>
                                  <Badge>Level {tier.level}</Badge>
                                </Stack>
                                <Body className="text-body-lg font-weight-bold text-primary">
                                  ${tier.price?.toLocaleString()}
                                </Body>
                                <Body className="text-body-sm text-grey-500">
                                  {tier.benefits?.length || 0} benefits included
                                </Body>
                              </Stack>
                            </Card>
                          ))}
                        </Grid>
                      ) : (
                        <Body className="text-grey-500">No active tiers. Create tiers to include in the deck.</Body>
                      )}
                    </Stack>
                  </Card>
                </Stack>
              </Box>

              {/* Sidebar */}
              <Stack gap={4}>
                {/* Export Options */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Export Format</H3>
                    <Stack gap={2}>
                      {[
                        { id: 'pdf', label: 'PDF Document', icon: <FileText className="size-5" /> },
                        { id: 'pptx', label: 'PowerPoint', icon: <Presentation className="size-5" /> },
                        { id: 'web', label: 'Web Link', icon: <Share2 className="size-5" /> },
                      ].map(format => (
                        <Card
                          key={format.id}
                          className={`cursor-pointer border-2 p-3 transition-all ${
                            selectedFormat === format.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-grey-200 hover:border-grey-400'
                          }`}
                          onClick={() => setSelectedFormat(format.id as 'pdf' | 'pptx' | 'web')}
                        >
                          <Stack direction="horizontal" gap={3} className="items-center">
                            {format.icon}
                            <Body>{format.label}</Body>
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  </Stack>
                </Card>

                {/* Stats */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Current Stats</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-grey-500">Active Tiers</Body>
                        <Body className="font-weight-semibold">{tiers?.filter(t => t.is_active).length || 0}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-grey-500">Total Potential Value</Body>
                        <Body className="font-weight-semibold">
                          ${(tiers?.reduce((sum, t) => sum + (t.price || 0), 0) || 0).toLocaleString()}
                        </Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-grey-500">Confirmed Sponsors</Body>
                        <Body className="font-weight-semibold">{stats?.confirmed || 0}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-grey-500">Confirmed Value</Body>
                        <Body className="font-weight-semibold">${(stats?.totalValue || 0).toLocaleString()}</Body>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>

                {/* Quick Actions */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Quick Actions</H3>
                    <Stack gap={2}>
                      <Button
                        onClick={() => router.push('/sponsors/tiers')}
                        variant="outline"
                        size="sm"
                        fullWidth
                      >
                        Edit Tiers
                      </Button>
                      <Button
                        onClick={() => router.push('/sponsors')}
                        variant="outline"
                        size="sm"
                        fullWidth
                      >
                        View Sponsors
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              </Stack>
            </Grid>
          </Stack>
        </Container>
      </Section>
    </AtlvsAppLayout>
  );
}
