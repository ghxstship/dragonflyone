'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { GvtewayAppLayout } from '@/components/app-layout';
import {
  H2, H3, Body, Label, Grid, Stack, Input, Button, Select,
  Card, Badge, Tabs, TabsList, Tab, TabPanel,
  Kicker, useNotifications,
} from '@ghxstship/ui';
import {
  Code, Copy, ExternalLink, Ticket, Calendar, Share2,
} from 'lucide-react';

interface EmbedConfig {
  eventId: string;
  type: 'button' | 'inline' | 'popup' | 'iframe';
  theme: 'light' | 'dark' | 'auto';
  buttonText: string;
  buttonColor: string;
  width: string;
  height: string;
  showTitle: boolean;
  showDate: boolean;
  showVenue: boolean;
  showPrice: boolean;
}

const DEMO_EVENTS = [
  { id: 'EVT-001', name: 'Summer Fest 2025', date: 'Mar 28-30, 2025' },
  { id: 'EVT-002', name: 'New Year Gala', date: 'Dec 31, 2024' },
  { id: 'EVT-003', name: 'Tech Conference 2025', date: 'Feb 15-17, 2025' },
];

function EmbedCodePageContent() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('generator');
  
  const [config, setConfig] = useState<EmbedConfig>({
    eventId: '',
    type: 'button',
    theme: 'light',
    buttonText: 'Get Tickets',
    buttonColor: '#6366f1',
    width: '100%',
    height: '500px',
    showTitle: true,
    showDate: true,
    showVenue: true,
    showPrice: true,
  });

  const generateCode = () => {
    const baseUrl = 'https://gvteway.com';
    const eventId = config.eventId || 'EVT-001';
    
    switch (config.type) {
      case 'button':
        return `<!-- GVTEWAY Buy Tickets Button -->
<a href="${baseUrl}/e/${eventId}/tickets" 
   target="_blank"
   style="display:inline-block;padding:12px 24px;background:${config.buttonColor};color:white;text-decoration:none;border-radius:4px;font-family:sans-serif;font-weight:600;">
  ${config.buttonText}
</a>`;
      
      case 'inline':
        return `<!-- GVTEWAY Inline Ticket Widget -->
<div id="gvteway-embed-${eventId}"></div>
<script src="${baseUrl}/embed.js"></script>
<script>
  GvtewayEmbed.init({
    container: '#gvteway-embed-${eventId}',
    eventId: '${eventId}',
    theme: '${config.theme}',
    showTitle: ${config.showTitle},
    showDate: ${config.showDate},
    showVenue: ${config.showVenue},
    showPrice: ${config.showPrice}
  });
</script>`;
      
      case 'popup':
        return `<!-- GVTEWAY Popup Ticket Widget -->
<script src="${baseUrl}/embed.js"></script>
<button onclick="GvtewayEmbed.popup('${eventId}')" 
        style="padding:12px 24px;background:${config.buttonColor};color:white;border:none;border-radius:4px;cursor:pointer;font-family:sans-serif;font-weight:600;">
  ${config.buttonText}
</button>`;
      
      case 'iframe':
        return `<!-- GVTEWAY iFrame Embed -->
<iframe 
  src="${baseUrl}/embed/${eventId}?theme=${config.theme}"
  width="${config.width}"
  height="${config.height}"
  frameborder="0"
  scrolling="auto"
  allow="payment"
  title="GVTEWAY Tickets">
</iframe>`;
      
      default:
        return '';
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generateCode());
    addNotification({ type: 'success', title: 'Copied!', message: 'Embed code copied to clipboard' });
  };

  return (
    <GvtewayAppLayout>
      <Stack gap={10}>
        <Stack gap={2}>
          <Kicker colorScheme="on-dark">Marketing</Kicker>
          <H2 size="lg" className="text-white">Embed Code Generator</H2>
          <Body className="text-on-dark-muted">Generate embed codes to sell tickets on external websites</Body>
        </Stack>

        <Grid cols={3} gap={6}>
          <Card inverted className="p-6">
            <Stack gap={3}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Ticket className="w-5 h-5 text-on-dark-muted" />
                <Body className="font-display text-white">Buy Button</Body>
              </Stack>
              <Body size="sm" className="text-on-dark-muted">Simple button that links to your ticket page</Body>
              <Badge variant="solid">Most Popular</Badge>
            </Stack>
          </Card>
          <Card inverted className="p-6">
            <Stack gap={3}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Code className="w-5 h-5 text-on-dark-muted" />
                <Body className="font-display text-white">Inline Widget</Body>
              </Stack>
              <Body size="sm" className="text-on-dark-muted">Embedded ticket selection on your page</Body>
              <Badge variant="outline">Recommended</Badge>
            </Stack>
          </Card>
          <Card inverted className="p-6">
            <Stack gap={3}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Share2 className="w-5 h-5 text-on-dark-muted" />
                <Body className="font-display text-white">iFrame</Body>
              </Stack>
              <Body size="sm" className="text-on-dark-muted">Full checkout experience in an iframe</Body>
              <Badge variant="ghost">Advanced</Badge>
            </Stack>
          </Card>
        </Grid>

        <Tabs>
          <TabsList>
            <Tab active={activeTab === 'generator'} onClick={() => setActiveTab('generator')}>Code Generator</Tab>
            <Tab active={activeTab === 'docs'} onClick={() => setActiveTab('docs')}>Documentation</Tab>
            <Tab active={activeTab === 'examples'} onClick={() => setActiveTab('examples')}>Examples</Tab>
          </TabsList>

          <TabPanel active={activeTab === 'generator'}>
            <Grid cols={2} gap={6}>
              <Card inverted className="p-6">
                <Stack gap={6}>
                  <H3 className="text-white">Configuration</H3>
                  <Stack gap={4}>
                    <Stack gap={2}>
                      <Label className="text-white">Select Event</Label>
                      <Select
                        value={config.eventId}
                        onChange={(e) => setConfig({ ...config, eventId: e.target.value })}
                        inverted
                      >
                        <option value="">Select an event...</option>
                        {DEMO_EVENTS.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.name} - {event.date}
                          </option>
                        ))}
                      </Select>
                    </Stack>
                    <Stack gap={2}>
                      <Label className="text-white">Embed Type</Label>
                      <Grid cols={4} gap={2}>
                        {(['button', 'inline', 'popup', 'iframe'] as const).map((type) => (
                          <Button
                            key={type}
                            variant={config.type === type ? 'solid' : 'outline'}
                            size="sm"
                            onClick={() => setConfig({ ...config, type })}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Button>
                        ))}
                      </Grid>
                    </Stack>
                    <Stack gap={2}>
                      <Label className="text-white">Theme</Label>
                      <Stack direction="horizontal" gap={4}>
                        {(['light', 'dark', 'auto'] as const).map((theme) => (
                          <Button
                            key={theme}
                            variant={config.theme === theme ? 'solid' : 'outline'}
                            size="sm"
                            onClick={() => setConfig({ ...config, theme })}
                          >
                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                          </Button>
                        ))}
                      </Stack>
                    </Stack>
                    {(config.type === 'button' || config.type === 'popup') && (
                      <>
                        <Stack gap={2}>
                          <Label className="text-white">Button Text</Label>
                          <Input
                            value={config.buttonText}
                            onChange={(e) => setConfig({ ...config, buttonText: e.target.value })}
                            placeholder="Get Tickets"
                            inverted
                          />
                        </Stack>
                        <Stack gap={2}>
                          <Label className="text-white">Button Color</Label>
                          <Stack direction="horizontal" gap={2}>
                            <Input
                              type="color"
                              value={config.buttonColor}
                              onChange={(e) => setConfig({ ...config, buttonColor: e.target.value })}
                              className="w-12 h-10"
                            />
                            <Input
                              value={config.buttonColor}
                              onChange={(e) => setConfig({ ...config, buttonColor: e.target.value })}
                              placeholder="#6366f1"
                              inverted
                              className="flex-1"
                            />
                          </Stack>
                        </Stack>
                      </>
                    )}
                    {config.type === 'iframe' && (
                      <Grid cols={2} gap={4}>
                        <Stack gap={2}>
                          <Label className="text-white">Width</Label>
                          <Input
                            value={config.width}
                            onChange={(e) => setConfig({ ...config, width: e.target.value })}
                            placeholder="100%"
                            inverted
                          />
                        </Stack>
                        <Stack gap={2}>
                          <Label className="text-white">Height</Label>
                          <Input
                            value={config.height}
                            onChange={(e) => setConfig({ ...config, height: e.target.value })}
                            placeholder="500px"
                            inverted
                          />
                        </Stack>
                      </Grid>
                    )}
                  </Stack>
                </Stack>
              </Card>
              <Stack gap={6}>
                <Card inverted className="p-6">
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between items-center">
                      <H3 className="text-white">Generated Code</H3>
                      <Button variant="solid" inverted size="sm" onClick={copyCode}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Code
                      </Button>
                    </Stack>
                    <Card className="p-4 bg-ink-900 overflow-x-auto">
                      <pre className="font-mono text-body-sm text-on-dark-muted whitespace-pre-wrap">
                        {generateCode()}
                      </pre>
                    </Card>
                  </Stack>
                </Card>
                <Card inverted className="p-6">
                  <Stack gap={4}>
                    <H3 className="text-white">Preview</H3>
                    <Card className="p-6 bg-white min-h-[150px] flex items-center justify-center">
                      {config.type === 'button' || config.type === 'popup' ? (
                        <button
                          style={{
                            padding: '12px 24px',
                            background: config.buttonColor,
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {config.buttonText}
                        </button>
                      ) : (
                        <Stack gap={2} className="text-center">
                          <Code className="w-8 h-8 mx-auto text-ink-400" />
                          <Body className="text-ink-500">
                            {config.type === 'inline' ? 'Inline Widget Preview' : 'iFrame Preview'}
                          </Body>
                        </Stack>
                      )}
                    </Card>
                  </Stack>
                </Card>
              </Stack>
            </Grid>
          </TabPanel>

          <TabPanel active={activeTab === 'docs'}>
            <Card inverted className="p-6">
              <Stack gap={6}>
                <H3 className="text-white">Integration Documentation</H3>
                <Stack gap={4}>
                  <Card inverted className="p-4 border-2 border-ink-700">
                    <Stack gap={3}>
                      <Body className="font-display text-white">1. Choose Your Embed Type</Body>
                      <Body size="sm" className="text-on-dark-muted">
                        Select the embed type that best fits your website. Buttons are simple and work everywhere.
                        Inline widgets provide a seamless experience. iFrames offer the full checkout flow.
                      </Body>
                    </Stack>
                  </Card>
                  <Card inverted className="p-4 border-2 border-ink-700">
                    <Stack gap={3}>
                      <Body className="font-display text-white">2. Configure Options</Body>
                      <Body size="sm" className="text-on-dark-muted">
                        Customize the appearance to match your website. Choose colors, themes, and display options.
                      </Body>
                    </Stack>
                  </Card>
                  <Card inverted className="p-4 border-2 border-ink-700">
                    <Stack gap={3}>
                      <Body className="font-display text-white">3. Copy & Paste</Body>
                      <Body size="sm" className="text-on-dark-muted">
                        Copy the generated code and paste it into your website HTML where you want the widget to appear.
                      </Body>
                    </Stack>
                  </Card>
                  <Card inverted className="p-4 border-2 border-ink-700">
                    <Stack gap={3}>
                      <Body className="font-display text-white">4. Test & Deploy</Body>
                      <Body size="sm" className="text-on-dark-muted">
                        Test the integration on a staging environment before deploying to production.
                      </Body>
                    </Stack>
                  </Card>
                </Stack>
                <Button variant="outline" onClick={() => window.open('/docs/embed', '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Full Documentation
                </Button>
              </Stack>
            </Card>
          </TabPanel>

          <TabPanel active={activeTab === 'examples'}>
            <Grid cols={2} gap={6}>
              {[
                { name: 'WordPress', desc: 'Add to any post or page using HTML block' },
                { name: 'Squarespace', desc: 'Use the Code Injection feature' },
                { name: 'Wix', desc: 'Add HTML iframe element' },
                { name: 'Shopify', desc: 'Add to theme liquid files' },
              ].map((platform, idx) => (
                <Card key={idx} inverted className="p-6">
                  <Stack gap={4}>
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <Calendar className="w-6 h-6 text-on-dark-muted" />
                      <Stack gap={0}>
                        <Body className="font-display text-white">{platform.name}</Body>
                        <Body size="sm" className="text-on-dark-muted">{platform.desc}</Body>
                      </Stack>
                    </Stack>
                    <Button variant="outline" size="sm">
                      View Guide
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </TabPanel>
        </Tabs>

        <Button variant="outlineInk" onClick={() => router.push('/admin/marketing')}>
          Back to Marketing
        </Button>
      </Stack>
    </GvtewayAppLayout>
  );
}

export default function EmbedCodePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <EmbedCodePageContent />
    </Suspense>
  );
}
