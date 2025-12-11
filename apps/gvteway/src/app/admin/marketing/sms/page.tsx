"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Alert,
  Kicker,
} from "@ghxstship/ui";

import {
  DEMO_SMS_CAMPAIGNS,
  DEMO_AUDIENCE_SEGMENTS,
  type DemoSMSCampaign as SMSCampaign,
} from "@/lib/demo-data";

const mockCampaigns = DEMO_SMS_CAMPAIGNS;
const audienceSegments = DEMO_AUDIENCE_SEGMENTS;

function SMSMarketingPageContent() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'campaigns',
    validTabs: ['campaigns', 'audiences', 'templates'],
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<SMSCampaign | null>(null);
  const [messageText, setMessageText] = useState("");

  const totalSent = mockCampaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const totalDelivered = mockCampaigns.reduce((sum, c) => sum + c.deliveredCount, 0);
  const totalClicks = mockCampaigns.reduce((sum, c) => sum + c.clickCount, 0);
  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : 0;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'solid' | 'outline' | 'ghost'> = {
      Completed: 'solid',
      Sending: 'outline',
      Scheduled: 'outline',
      Draft: 'ghost',
      Paused: 'outline',
    };
    return <Badge variant={variants[status] || 'ghost'}>{status}</Badge>;
  };

  const characterCount = messageText.length;
  const segmentCount = Math.ceil(characterCount / 160);

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Marketing</Kicker>
              <H2 size="lg" className="text-white">SMS Marketing</H2>
              <Body className="text-on-dark-muted">Create and manage SMS campaigns for events</Body>
            </Stack>

            <Grid cols={4} gap={6}>
              <StatCard label="Messages Sent" value={totalSent.toLocaleString()} inverted />
              <StatCard label="Delivery Rate" value={`${deliveryRate}%`} inverted />
              <StatCard label="Total Clicks" value={totalClicks.toLocaleString()} inverted />
              <StatCard label="Active Campaigns" value={mockCampaigns.filter(c => c.status === "Sending" || c.status === "Scheduled").length.toString()} inverted />
            </Grid>

          <Tabs>
            <TabsList>
              <Tab active={isActive('campaigns')} onClick={() => setActiveTab('campaigns')}>Campaigns</Tab>
              <Tab active={isActive('audiences')} onClick={() => setActiveTab('audiences')}>Audiences</Tab>
              <Tab active={isActive('templates')} onClick={() => setActiveTab('templates')}>Templates</Tab>
            </TabsList>

            <TabPanel active={isActive('campaigns')}>
              <Stack gap={4}>
                <Stack direction="horizontal" className="justify-between">
                  <Input type="search" placeholder="Search campaigns..." className="w-64" inverted />
                  <Button variant="solid" inverted onClick={() => setShowCreateModal(true)}>Create Campaign</Button>
                </Stack>

                <Card inverted className="overflow-hidden">
                  <Table variant="dark">
                    <TableHeader>
                      <TableRow className="bg-ink-900">
                        <TableHead className="text-on-dark-muted">Campaign</TableHead>
                        <TableHead className="text-on-dark-muted">Status</TableHead>
                        <TableHead className="text-on-dark-muted">Audience</TableHead>
                        <TableHead className="text-on-dark-muted">Sent</TableHead>
                        <TableHead className="text-on-dark-muted">Delivered</TableHead>
                        <TableHead className="text-on-dark-muted">Clicks</TableHead>
                        <TableHead className="text-on-dark-muted">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockCampaigns.map((campaign) => (
                        <TableRow key={campaign.id} className="border-b border-ink-700">
                          <TableCell>
                            <Stack gap={1}>
                              <Body className="font-display text-white">{campaign.name}</Body>
                              {campaign.eventName && <Label size="xs" className="text-on-dark-muted">{campaign.eventName}</Label>}
                            </Stack>
                          </TableCell>
                          <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                          <TableCell><Label className="font-mono text-white">{campaign.audienceSize.toLocaleString()}</Label></TableCell>
                          <TableCell><Label className="font-mono text-white">{campaign.sentCount.toLocaleString()}</Label></TableCell>
                          <TableCell>
                            <Stack gap={0}>
                              <Label className="font-mono text-white">{campaign.deliveredCount.toLocaleString()}</Label>
                              {campaign.sentCount > 0 && <Label size="xs" className="text-on-dark-disabled">{((campaign.deliveredCount / campaign.sentCount) * 100).toFixed(1)}%</Label>}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack gap={0}>
                              <Label className="font-mono text-white">{campaign.clickCount.toLocaleString()}</Label>
                              {campaign.deliveredCount > 0 && <Label size="xs" className="text-on-dark-disabled">{((campaign.clickCount / campaign.deliveredCount) * 100).toFixed(1)}% CTR</Label>}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="horizontal" gap={2}>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedCampaign(campaign)}>View</Button>
                              {campaign.status === "Draft" && <Button variant="outlineInk" size="sm">Send</Button>}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </Stack>
            </TabPanel>

            <TabPanel active={isActive('audiences')}>
              <Grid cols={3} gap={4}>
                {audienceSegments.map((segment) => (
                  <Card key={segment.id} inverted>
                    <Stack gap={3}>
                      <Body className="font-display text-white">{segment.name}</Body>
                      <Label className="font-mono text-white">{segment.count.toLocaleString()}</Label>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Export</Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
                <Card inverted interactive className="flex cursor-pointer items-center justify-center border-2 border-dashed border-ink-700">
                  <Stack gap={2} className="text-center">
                    <Label className="text-on-dark-muted">+ Create Segment</Label>
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>

            <TabPanel active={isActive('templates')}>
              <Grid cols={2} gap={4}>
                {[
                  { name: "Event Reminder", message: "Don't forget! [EVENT] is tomorrow. Gates open at [TIME]. See you there!" },
                  { name: "Flash Sale", message: "FLASH SALE! [DISCOUNT]% off tickets for the next [HOURS] hours only. Shop now: [LINK]" },
                  { name: "VIP Upgrade", message: "Upgrade to VIP for [EVENT]! Get exclusive perks for just $[PRICE] more: [LINK]" },
                  { name: "Last Chance", message: "Last chance! Only [COUNT] tickets left for [EVENT]. Get yours now: [LINK]" },
                ].map((template, idx) => (
                  <Card key={idx} inverted>
                    <Stack gap={3}>
                      <Body className="font-display text-white">{template.name}</Body>
                      <Body size="sm" className="text-on-dark-muted">{template.message}</Body>
                      <Button variant="outline" size="sm">Use Template</Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>
          </Tabs>

          <Button variant="outlineInk" onClick={() => router.push("/admin/marketing")}>Back to Marketing</Button>
          </Stack>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create SMS Campaign</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Stack gap={2}>
              <Label>Campaign Name</Label>
              <Input placeholder="e.g., Early Bird Reminder" />
            </Stack>
            <Stack gap={2}>
              <Label>Select Event (optional)</Label>
              <Select>
                <option value="">No specific event</option>
                <option value="EVT-001">Summer Fest 2024</option>
                <option value="EVT-002">Winter Gala</option>
              </Select>
            </Stack>
            <Stack gap={2}>
              <Label>Target Audience</Label>
              <Select>
                {audienceSegments.map(seg => (
                  <option key={seg.id} value={seg.id}>{seg.name} ({seg.count.toLocaleString()})</option>
                ))}
              </Select>
            </Stack>
            <Stack gap={2}>
              <Stack direction="horizontal" className="justify-between">
                <Label>Message</Label>
                <Label size="xs" className={characterCount > 160 ? "text-warning-600" : "text-ink-500"}>
                  {characterCount}/160 ({segmentCount} segment{segmentCount > 1 ? "s" : ""})
                </Label>
              </Stack>
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                rows={3}
              />
              {characterCount > 160 && (
                <Alert variant="warning">Messages over 160 characters will be sent as multiple segments</Alert>
              )}
            </Stack>
            <Stack gap={2}>
              <Label>Schedule</Label>
              <Grid cols={2} gap={2}>
                <Input type="date" />
                <Input type="time" />
              </Grid>
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="outline">Save Draft</Button>
          <Button variant="solid">Schedule</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedCampaign} onClose={() => setSelectedCampaign(null)}>
        <ModalHeader><H3>Campaign Details</H3></ModalHeader>
        <ModalBody>
          {selectedCampaign && (
            <Stack gap={4}>
              <Body className="font-display">{selectedCampaign.name}</Body>
              <Card className="border-2 p-3">
                <Body size="sm">{selectedCampaign.message}</Body>
              </Card>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-on-light-muted">Status</Label>{getStatusBadge(selectedCampaign.status)}</Stack>
                <Stack gap={1}><Label size="xs" className="text-on-light-muted">Audience</Label><Label>{selectedCampaign.audienceSize.toLocaleString()}</Label></Stack>
              </Grid>
              <Grid cols={3} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-on-light-muted">Sent</Label><Label className="font-mono">{selectedCampaign.sentCount.toLocaleString()}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-on-light-muted">Delivered</Label><Label className="font-mono">{selectedCampaign.deliveredCount.toLocaleString()}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-on-light-muted">Clicks</Label><Label className="font-mono">{selectedCampaign.clickCount.toLocaleString()}</Label></Stack>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedCampaign(null)}>Close</Button>
        </ModalFooter>
      </Modal>
    </GvtewayAppLayout>
  );
}

export default function SMSMarketingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <SMSMarketingPageContent />
    </Suspense>
  );
}
