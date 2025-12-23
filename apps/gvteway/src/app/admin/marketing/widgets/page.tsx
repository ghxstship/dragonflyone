'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
// Layout provided by route group
import {
  H2, H3, Body, Label, Grid, Stack, Input, Button, Select,
  Card, Badge, Tabs, TabsList, Tab, TabPanel,
  Kicker, useNotifications,
} from '@ghxstship/ui';
import {
  Layout, Calendar, Ticket, Copy, Eye, Settings, Code,
} from 'lucide-react';

interface Widget {
  id: string;
  name: string;
  type: 'calendar' | 'ticket_button' | 'event_list' | 'countdown' | 'featured';
  status: 'active' | 'inactive';
  installations: number;
  views: number;
  clicks: number;
  created_at: string;
}

const DEMO_WIDGETS: Widget[] = [
  { id: 'WDG-001', name: 'Event Calendar Widget', type: 'calendar', status: 'active', installations: 156, views: 45200, clicks: 8920, created_at: '2024-08-15' },
  { id: 'WDG-002', name: 'Buy Tickets Button', type: 'ticket_button', status: 'active', installations: 289, views: 125000, clicks: 23400, created_at: '2024-06-20' },
  { id: 'WDG-003', name: 'Upcoming Events List', type: 'event_list', status: 'active', installations: 78, views: 18900, clicks: 3200, created_at: '2024-09-10' },
  { id: 'WDG-004', name: 'Event Countdown Timer', type: 'countdown', status: 'inactive', installations: 45, views: 8700, clicks: 1520, created_at: '2024-10-01' },
  { id: 'WDG-005', name: 'Featured Event Banner', type: 'featured', status: 'active', installations: 34, views: 12400, clicks: 2890, created_at: '2024-11-05' },
];

function EventWidgetsPageContent() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('widgets');
  const [widgets] = useState<Widget[]>(DEMO_WIDGETS);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  
  const [newWidget, setNewWidget] = useState({
    name: '',
    type: 'calendar' as Widget['type'],
    theme: 'light',
    width: '100%',
    height: '400px',
  });

  const totalViews = widgets.reduce((sum, w) => sum + w.views, 0);
  const totalClicks = widgets.reduce((sum, w) => sum + w.clicks, 0);
  const totalInstallations = widgets.reduce((sum, w) => sum + w.installations, 0);

  const getTypeIcon = (type: Widget['type']) => {
    switch (type) {
      case 'calendar': return <Calendar className="w-4 h-4" />;
      case 'ticket_button': return <Ticket className="w-4 h-4" />;
      case 'event_list': return <Layout className="w-4 h-4" />;
      case 'countdown': return <Calendar className="w-4 h-4" />;
      case 'featured': return <Layout className="w-4 h-4" />;
      default: return <Layout className="w-4 h-4" />;
    }
  };

  const generateEmbedCode = (widget: Widget) => {
    return `<script src="https://gvteway.com/widgets/${widget.id}.js"></script>
<div id="gvteway-widget-${widget.id}" data-theme="light" data-width="100%"></div>`;
  };

  const copyEmbedCode = (widget: Widget) => {
    navigator.clipboard.writeText(generateEmbedCode(widget));
    addNotification({ type: 'success', title: 'Copied!', message: 'Embed code copied to clipboard' });
  };

  return (
    <>
      <Stack gap={10}>
        <Stack gap={2}>
          <Kicker colorScheme="on-dark">Marketing</Kicker>
          <H2 size="lg" className="text-white">Event Widgets</H2>
          <Body className="text-on-dark-muted">Create embeddable widgets for external websites</Body>
        </Stack>

        <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
          <Card inverted className="p-6">
            <Stack gap={2}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Layout className="w-4 h-4 text-on-dark-muted" />
                <Label className="text-on-dark-muted">Total Widgets</Label>
              </Stack>
              <Body className="font-mono text-h3-md text-white">{widgets.length}</Body>
            </Stack>
          </Card>
          <Card inverted className="p-6">
            <Stack gap={2}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Code className="w-4 h-4 text-on-dark-muted" />
                <Label className="text-on-dark-muted">Installations</Label>
              </Stack>
              <Body className="font-mono text-h3-md text-white">{totalInstallations.toLocaleString()}</Body>
            </Stack>
          </Card>
          <Card inverted className="p-6">
            <Stack gap={2}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Eye className="w-4 h-4 text-on-dark-muted" />
                <Label className="text-on-dark-muted">Total Views</Label>
              </Stack>
              <Body className="font-mono text-h3-md text-white">{totalViews.toLocaleString()}</Body>
            </Stack>
          </Card>
          <Card inverted className="p-6">
            <Stack gap={2}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Ticket className="w-4 h-4 text-on-dark-muted" />
                <Label className="text-on-dark-muted">Total Clicks</Label>
              </Stack>
              <Body className="font-mono text-h3-md text-white">{totalClicks.toLocaleString()}</Body>
            </Stack>
          </Card>
        </Grid>

        <Tabs>
          <TabsList>
            <Tab active={activeTab === 'widgets'} onClick={() => setActiveTab('widgets')}>My Widgets</Tab>
            <Tab active={activeTab === 'create'} onClick={() => setActiveTab('create')}>Create Widget</Tab>
            <Tab active={activeTab === 'templates'} onClick={() => setActiveTab('templates')}>Templates</Tab>
          </TabsList>

          <TabPanel active={activeTab === 'widgets'}>
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              {widgets.map((widget) => (
                <Card key={widget.id} inverted interactive className="p-6">
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between items-start">
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <div className="p-3 bg-ink-800 rounded-card">
                          {getTypeIcon(widget.type)}
                        </div>
                        <Stack gap={1}>
                          <Body className="font-display text-white">{widget.name}</Body>
                          <Badge variant={widget.status === 'active' ? 'solid' : 'ghost'}>
                            {widget.status.toUpperCase()}
                          </Badge>
                        </Stack>
                      </Stack>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedWidget(widget)}>
                        <Settings className="w-4 h-4" />
                      </Button>
                    </Stack>
                    <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
                      <Stack gap={1}>
                        <Label size="xs" className="text-on-dark-muted">Installations</Label>
                        <Label className="font-mono text-white">{widget.installations}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-on-dark-muted">Views</Label>
                        <Label className="font-mono text-white">{widget.views.toLocaleString()}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-on-dark-muted">Clicks</Label>
                        <Label className="font-mono text-white">{widget.clicks.toLocaleString()}</Label>
                      </Stack>
                    </Grid>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="outline" size="sm" onClick={() => copyEmbedCode(widget)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Code
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel active={activeTab === 'create'}>
            <Card inverted className="p-6">
              <Stack gap={6}>
                <H3 className="text-white">Create New Widget</H3>
                <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
                  <Stack gap={4}>
                    <Stack gap={2}>
                      <Label className="text-white">Widget Name</Label>
                      <Input
                        value={newWidget.name}
                        onChange={(e) => setNewWidget({ ...newWidget, name: e.target.value })}
                        placeholder="e.g., My Event Calendar"
                        inverted
                      />
                    </Stack>
                    <Stack gap={2}>
                      <Label className="text-white">Widget Type</Label>
                      <Select
                        value={newWidget.type}
                        onChange={(e) => setNewWidget({ ...newWidget, type: e.target.value as Widget['type'] })}
                        inverted
                      >
                        <option value="calendar">Event Calendar</option>
                        <option value="ticket_button">Buy Tickets Button</option>
                        <option value="event_list">Upcoming Events List</option>
                        <option value="countdown">Event Countdown</option>
                        <option value="featured">Featured Event Banner</option>
                      </Select>
                    </Stack>
                    <Stack gap={2}>
                      <Label className="text-white">Theme</Label>
                      <Stack direction="horizontal" gap={4}>
                        <Button
                          variant={newWidget.theme === 'light' ? 'solid' : 'outline'}
                          onClick={() => setNewWidget({ ...newWidget, theme: 'light' })}
                        >
                          Light
                        </Button>
                        <Button
                          variant={newWidget.theme === 'dark' ? 'solid' : 'outline'}
                          onClick={() => setNewWidget({ ...newWidget, theme: 'dark' })}
                        >
                          Dark
                        </Button>
                        <Button
                          variant={newWidget.theme === 'auto' ? 'solid' : 'outline'}
                          onClick={() => setNewWidget({ ...newWidget, theme: 'auto' })}
                        >
                          Auto
                        </Button>
                      </Stack>
                    </Stack>
                    <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                      <Stack gap={2}>
                        <Label className="text-white">Width</Label>
                        <Input
                          value={newWidget.width}
                          onChange={(e) => setNewWidget({ ...newWidget, width: e.target.value })}
                          placeholder="100%"
                          inverted
                        />
                      </Stack>
                      <Stack gap={2}>
                        <Label className="text-white">Height</Label>
                        <Input
                          value={newWidget.height}
                          onChange={(e) => setNewWidget({ ...newWidget, height: e.target.value })}
                          placeholder="400px"
                          inverted
                        />
                      </Stack>
                    </Grid>
                  </Stack>
                  <Stack gap={4}>
                    <Label className="text-white">Preview</Label>
                    <Card className="h-64 bg-ink-100 flex items-center justify-center border-2 border-dashed border-ink-300">
                      <Stack gap={2} className="text-center">
                        {getTypeIcon(newWidget.type)}
                        <Body className="text-ink-500">{newWidget.name || 'Widget Preview'}</Body>
                      </Stack>
                    </Card>
                  </Stack>
                </Grid>
                <Button variant="solid" inverted>
                  Create Widget
                </Button>
              </Stack>
            </Card>
          </TabPanel>

          <TabPanel active={activeTab === 'templates'}>
            <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'Event Calendar', type: 'calendar', desc: 'Display upcoming events in a calendar view' },
                { name: 'Buy Tickets CTA', type: 'ticket_button', desc: 'Simple buy tickets button' },
                { name: 'Events Carousel', type: 'event_list', desc: 'Scrollable list of upcoming events' },
                { name: 'Countdown Timer', type: 'countdown', desc: 'Countdown to a specific event' },
                { name: 'Featured Banner', type: 'featured', desc: 'Highlight a featured event' },
                { name: 'Mini Calendar', type: 'calendar', desc: 'Compact calendar widget' },
              ].map((template, idx) => (
                <Card key={idx} inverted interactive className="p-6 cursor-pointer">
                  <Stack gap={4}>
                    <div className="p-4 bg-ink-800 rounded-card w-fit">
                      {getTypeIcon(template.type as Widget['type'])}
                    </div>
                    <Stack gap={2}>
                      <Body className="font-display text-white">{template.name}</Body>
                      <Body size="sm" className="text-on-dark-muted">{template.desc}</Body>
                    </Stack>
                    <Button variant="outline" size="sm">Use Template</Button>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </TabPanel>
        </Tabs>

        {selectedWidget && (
          <Card inverted className="p-6">
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between items-center">
                <H3 className="text-white">Embed Code: {selectedWidget.name}</H3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedWidget(null)}>Close</Button>
              </Stack>
              <Card className="p-4 bg-ink-900 font-mono text-body-sm text-on-dark-muted overflow-x-auto">
                <pre>{generateEmbedCode(selectedWidget)}</pre>
              </Card>
              <Button variant="solid" inverted onClick={() => copyEmbedCode(selectedWidget)}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Embed Code
              </Button>
            </Stack>
          </Card>
        )}

        <Button variant="outlineInk" onClick={() => router.push('/admin/marketing')}>
          Back to Marketing
        </Button>
      </Stack>
    </>
  );
}

export default function EventWidgetsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <EventWidgetsPageContent />
    </Suspense>
  );
}
