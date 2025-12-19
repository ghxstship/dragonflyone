'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { GvtewayAppLayout } from '@/components/app-layout';
import {
  H2, H3, Body, Label, Grid, Stack, Input, Button,
  Card, Badge, Tabs, TabsList, Tab, TabPanel, Textarea, Alert,
  Kicker, useNotifications,
} from '@ghxstship/ui';
import {
  Search, Globe, FileText, CheckCircle, AlertTriangle, ExternalLink, RefreshCw,
} from 'lucide-react';

interface SEOSettings {
  title: string;
  description: string;
  keywords: string[];
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_card: 'summary' | 'summary_large_image';
  canonical_url: string;
  robots: string;
}

interface SEOPage {
  path: string;
  title: string;
  description: string;
  score: number;
  issues: string[];
  lastCrawled: string;
}

const DEFAULT_SEO: SEOSettings = {
  title: 'GVTEWAY - Your Event Ticketing Platform',
  description: 'Discover and book tickets for the best events, concerts, and festivals. GVTEWAY makes event ticketing simple and secure.',
  keywords: ['events', 'tickets', 'concerts', 'festivals', 'live music', 'entertainment'],
  og_title: 'GVTEWAY - Your Event Ticketing Platform',
  og_description: 'Discover and book tickets for the best events, concerts, and festivals.',
  og_image: 'https://gvteway.com/og-image.jpg',
  twitter_card: 'summary_large_image',
  canonical_url: 'https://gvteway.com',
  robots: 'index, follow',
};

const DEMO_PAGES: SEOPage[] = [
  { path: '/', title: 'Home', description: 'Main landing page', score: 92, issues: [], lastCrawled: '2024-11-22' },
  { path: '/events', title: 'Events', description: 'Browse all events', score: 88, issues: ['Meta description could be longer'], lastCrawled: '2024-11-22' },
  { path: '/venues', title: 'Venues', description: 'Browse venues', score: 75, issues: ['Missing alt text on images', 'H1 tag missing'], lastCrawled: '2024-11-21' },
  { path: '/artists', title: 'Artists', description: 'Browse artists', score: 82, issues: ['Duplicate meta description'], lastCrawled: '2024-11-21' },
  { path: '/about', title: 'About Us', description: 'About GVTEWAY', score: 95, issues: [], lastCrawled: '2024-11-20' },
];

function SEOSettingsPageContent() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SEOSettings>(DEFAULT_SEO);
  const [isSaving, setIsSaving] = useState(false);
  const [pages] = useState<SEOPage[]>(DEMO_PAGES);

  const avgScore = pages.reduce((sum, p) => sum + p.score, 0) / pages.length;
  const pagesWithIssues = pages.filter(p => p.issues.length > 0).length;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      addNotification({ type: 'success', title: 'Settings Saved', message: 'SEO settings have been updated' });
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge variant="solid">Excellent</Badge>;
    if (score >= 70) return <Badge variant="outline">Good</Badge>;
    return <Badge variant="ghost">Needs Work</Badge>;
  };

  return (
    <GvtewayAppLayout>
      <Stack gap={10}>
        <Stack gap={2}>
          <Kicker colorScheme="on-dark">Marketing</Kicker>
          <H2 size="lg" className="text-white">SEO Settings</H2>
          <Body className="text-on-dark-muted">Optimize your site for search engines</Body>
        </Stack>

        <Grid cols={4} gap={6}>
          <Card inverted className="p-6">
            <Stack gap={2}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Search className="w-4 h-4 text-on-dark-muted" />
                <Label className="text-on-dark-muted">SEO Score</Label>
              </Stack>
              <Body className="font-mono text-h3-md text-white">{avgScore.toFixed(0)}/100</Body>
            </Stack>
          </Card>
          <Card inverted className="p-6">
            <Stack gap={2}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <FileText className="w-4 h-4 text-on-dark-muted" />
                <Label className="text-on-dark-muted">Pages Indexed</Label>
              </Stack>
              <Body className="font-mono text-h3-md text-white">{pages.length}</Body>
            </Stack>
          </Card>
          <Card inverted className="p-6">
            <Stack gap={2}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <CheckCircle className="w-4 h-4 text-on-dark-muted" />
                <Label className="text-on-dark-muted">Optimized</Label>
              </Stack>
              <Body className="font-mono text-h3-md text-white">{pages.length - pagesWithIssues}</Body>
            </Stack>
          </Card>
          <Card inverted className="p-6">
            <Stack gap={2}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <AlertTriangle className="w-4 h-4 text-on-dark-muted" />
                <Label className="text-on-dark-muted">Issues Found</Label>
              </Stack>
              <Body className="font-mono text-h3-md text-white">{pagesWithIssues}</Body>
            </Stack>
          </Card>
        </Grid>

        <Tabs>
          <TabsList>
            <Tab active={activeTab === 'general'} onClick={() => setActiveTab('general')}>General</Tab>
            <Tab active={activeTab === 'social'} onClick={() => setActiveTab('social')}>Social Media</Tab>
            <Tab active={activeTab === 'pages'} onClick={() => setActiveTab('pages')}>Page Analysis</Tab>
            <Tab active={activeTab === 'advanced'} onClick={() => setActiveTab('advanced')}>Advanced</Tab>
          </TabsList>

          <TabPanel active={activeTab === 'general'}>
            <Card inverted className="p-6">
              <Stack gap={6}>
                <H3 className="text-white">General SEO Settings</H3>
                <Stack gap={4}>
                  <Stack gap={2}>
                    <Label className="text-white">Site Title</Label>
                    <Input
                      value={settings.title}
                      onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                      placeholder="Your site title"
                      inverted
                    />
                    <Label size="xs" className="text-on-dark-muted">{settings.title.length}/60 characters recommended</Label>
                  </Stack>
                  <Stack gap={2}>
                    <Label className="text-white">Meta Description</Label>
                    <Textarea
                      value={settings.description}
                      onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                      placeholder="Describe your site..."
                      rows={3}
                      inverted
                    />
                    <Label size="xs" className="text-on-dark-muted">{settings.description.length}/160 characters recommended</Label>
                  </Stack>
                  <Stack gap={2}>
                    <Label className="text-white">Keywords</Label>
                    <Input
                      value={settings.keywords.join(', ')}
                      onChange={(e) => setSettings({ ...settings, keywords: e.target.value.split(',').map(k => k.trim()) })}
                      placeholder="keyword1, keyword2, keyword3"
                      inverted
                    />
                    <Label size="xs" className="text-on-dark-muted">Separate keywords with commas</Label>
                  </Stack>
                  <Stack gap={2}>
                    <Label className="text-white">Canonical URL</Label>
                    <Input
                      value={settings.canonical_url}
                      onChange={(e) => setSettings({ ...settings, canonical_url: e.target.value })}
                      placeholder="https://yoursite.com"
                      inverted
                    />
                  </Stack>
                </Stack>
                <Button variant="solid" inverted onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              </Stack>
            </Card>
          </TabPanel>

          <TabPanel active={activeTab === 'social'}>
            <Card inverted className="p-6">
              <Stack gap={6}>
                <H3 className="text-white">Social Media Preview</H3>
                <Grid cols={2} gap={6}>
                  <Stack gap={4}>
                    <Stack gap={2}>
                      <Label className="text-white">Open Graph Title</Label>
                      <Input
                        value={settings.og_title}
                        onChange={(e) => setSettings({ ...settings, og_title: e.target.value })}
                        placeholder="Title for social sharing"
                        inverted
                      />
                    </Stack>
                    <Stack gap={2}>
                      <Label className="text-white">Open Graph Description</Label>
                      <Textarea
                        value={settings.og_description}
                        onChange={(e) => setSettings({ ...settings, og_description: e.target.value })}
                        placeholder="Description for social sharing"
                        rows={3}
                        inverted
                      />
                    </Stack>
                    <Stack gap={2}>
                      <Label className="text-white">Open Graph Image URL</Label>
                      <Input
                        value={settings.og_image}
                        onChange={(e) => setSettings({ ...settings, og_image: e.target.value })}
                        placeholder="https://yoursite.com/og-image.jpg"
                        inverted
                      />
                    </Stack>
                    <Stack gap={2}>
                      <Label className="text-white">Twitter Card Type</Label>
                      <Stack direction="horizontal" gap={4}>
                        <Button
                          variant={settings.twitter_card === 'summary' ? 'solid' : 'outline'}
                          onClick={() => setSettings({ ...settings, twitter_card: 'summary' })}
                        >
                          Summary
                        </Button>
                        <Button
                          variant={settings.twitter_card === 'summary_large_image' ? 'solid' : 'outline'}
                          onClick={() => setSettings({ ...settings, twitter_card: 'summary_large_image' })}
                        >
                          Large Image
                        </Button>
                      </Stack>
                    </Stack>
                  </Stack>
                  <Stack gap={4}>
                    <Label className="text-white">Preview</Label>
                    <Card className="p-0 border-2 border-ink-300 overflow-hidden">
                      <div className="h-40 bg-ink-200 flex items-center justify-center">
                        <Globe className="w-12 h-12 text-ink-400" />
                      </div>
                      <Stack gap={2} className="p-4">
                        <Label className="text-ink-500">gvteway.com</Label>
                        <Body className="font-display">{settings.og_title}</Body>
                        <Body size="sm" className="text-ink-600 line-clamp-2">{settings.og_description}</Body>
                      </Stack>
                    </Card>
                  </Stack>
                </Grid>
                <Button variant="solid" inverted onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              </Stack>
            </Card>
          </TabPanel>

          <TabPanel active={activeTab === 'pages'}>
            <Card inverted className="p-6">
              <Stack gap={6}>
                <Stack direction="horizontal" className="justify-between items-center">
                  <H3 className="text-white">Page Analysis</H3>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Re-analyze
                  </Button>
                </Stack>
                <Stack gap={3}>
                  {pages.map((page) => (
                    <Card key={page.path} inverted interactive className="p-4">
                      <Stack direction="horizontal" className="items-start justify-between">
                        <Stack gap={2}>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Body className="font-display text-white">{page.title}</Body>
                            {getScoreBadge(page.score)}
                          </Stack>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Label size="xs" className="text-on-dark-muted font-mono">{page.path}</Label>
                            <ExternalLink className="w-3 h-3 text-on-dark-muted" />
                          </Stack>
                          {page.issues.length > 0 && (
                            <Stack gap={1} className="mt-2">
                              {page.issues.map((issue, idx) => (
                                <Stack key={idx} direction="horizontal" gap={2} className="items-center">
                                  <AlertTriangle className="w-3 h-3 text-warning-500" />
                                  <Label size="xs" className="text-warning-500">{issue}</Label>
                                </Stack>
                              ))}
                            </Stack>
                          )}
                        </Stack>
                        <Stack gap={1} className="text-right">
                          <Body className="font-mono text-h4-md text-white">{page.score}</Body>
                          <Label size="xs" className="text-on-dark-muted">Last: {page.lastCrawled}</Label>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Card>
          </TabPanel>

          <TabPanel active={activeTab === 'advanced'}>
            <Card inverted className="p-6">
              <Stack gap={6}>
                <H3 className="text-white">Advanced Settings</H3>
                <Stack gap={4}>
                  <Stack gap={2}>
                    <Label className="text-white">Robots Meta Tag</Label>
                    <Input
                      value={settings.robots}
                      onChange={(e) => setSettings({ ...settings, robots: e.target.value })}
                      placeholder="index, follow"
                      inverted
                    />
                    <Label size="xs" className="text-on-dark-muted">Controls how search engines index your site</Label>
                  </Stack>
                  <Alert variant="info">
                    <Body size="sm">For robots.txt and sitemap.xml configuration, please contact your development team.</Body>
                  </Alert>
                </Stack>
                <Button variant="solid" inverted onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              </Stack>
            </Card>
          </TabPanel>
        </Tabs>

        <Button variant="outlineInk" onClick={() => router.push('/admin/marketing')}>
          Back to Marketing
        </Button>
      </Stack>
    </GvtewayAppLayout>
  );
}

export default function SEOSettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <SEOSettingsPageContent />
    </Suspense>
  );
}
