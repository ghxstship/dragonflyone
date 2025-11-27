"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "../../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Alert,
} from "@ghxstship/ui";

interface SMSCampaign {
  id: string;
  name: string;
  message: string;
  status: "Draft" | "Scheduled" | "Sending" | "Completed" | "Paused";
  audienceSize: number;
  sentCount: number;
  deliveredCount: number;
  clickCount: number;
  scheduledDate?: string;
  completedDate?: string;
  eventId?: string;
  eventName?: string;
}

const mockCampaigns: SMSCampaign[] = [
  { id: "SMS-001", name: "Early Bird Reminder", message: "Last chance! Early bird tickets for Summer Fest end tonight. Get 20% off: gvteway.com/sf24", status: "Completed", audienceSize: 15420, sentCount: 15420, deliveredCount: 14892, clickCount: 2134, completedDate: "2024-11-20", eventId: "EVT-001", eventName: "Summer Fest 2024" },
  { id: "SMS-002", name: "VIP Upgrade Offer", message: "Exclusive offer! Upgrade to VIP for just $50 more. Limited availability: gvteway.com/vip", status: "Sending", audienceSize: 8500, sentCount: 4250, deliveredCount: 4102, clickCount: 523, eventId: "EVT-001", eventName: "Summer Fest 2024" },
  { id: "SMS-003", name: "Event Reminder - 24hr", message: "See you tomorrow! Summer Fest gates open at 2PM. Don't forget your ticket: gvteway.com/mytickets", status: "Scheduled", audienceSize: 12000, sentCount: 0, deliveredCount: 0, clickCount: 0, scheduledDate: "2024-11-25T10:00:00Z", eventId: "EVT-001", eventName: "Summer Fest 2024" },
  { id: "SMS-004", name: "Flash Sale Alert", message: "FLASH SALE! 30% off all remaining tickets for the next 2 hours only!", status: "Draft", audienceSize: 25000, sentCount: 0, deliveredCount: 0, clickCount: 0 },
];

const audienceSegments = [
  { id: "SEG-001", name: "All Subscribers", count: 45000 },
  { id: "SEG-002", name: "Past Attendees", count: 28000 },
  { id: "SEG-003", name: "VIP Members", count: 3500 },
  { id: "SEG-004", name: "Ticket Holders", count: 12000 },
  { id: "SEG-005", name: "Cart Abandoners", count: 2800 },
];

export default function SMSMarketingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("campaigns");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<SMSCampaign | null>(null);
  const [messageText, setMessageText] = useState("");

  const totalSent = mockCampaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const totalDelivered = mockCampaigns.reduce((sum, c) => sum + c.deliveredCount, 0);
  const totalClicks = mockCampaigns.reduce((sum, c) => sum + c.clickCount, 0);
  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "text-success-400";
      case "Sending": return "text-info-400";
      case "Scheduled": return "text-warning-400";
      case "Draft": return "text-ink-600";
      case "Paused": return "text-error-400";
      default: return "text-ink-600";
    }
  };

  const characterCount = messageText.length;
  const segmentCount = Math.ceil(characterCount / 160);

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2} className="border-b-2 border-black pb-8">
            <H1>SMS Marketing</H1>
            <Body className="text-ink-600">Create and manage SMS campaigns for events</Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Messages Sent" value={totalSent.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Delivery Rate" value={`${deliveryRate}%`} className="border-2 border-black" />
            <StatCard label="Total Clicks" value={totalClicks.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Active Campaigns" value={mockCampaigns.filter(c => c.status === "Sending" || c.status === "Scheduled").length} className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "campaigns"} onClick={() => setActiveTab("campaigns")}>Campaigns</Tab>
              <Tab active={activeTab === "audiences"} onClick={() => setActiveTab("audiences")}>Audiences</Tab>
              <Tab active={activeTab === "templates"} onClick={() => setActiveTab("templates")}>Templates</Tab>
            </TabsList>

            <TabPanel active={activeTab === "campaigns"}>
              <Stack gap={4}>
                <Stack direction="horizontal" className="justify-between">
                  <Input type="search" placeholder="Search campaigns..." className="w-64" />
                  <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create Campaign</Button>
                </Stack>

                <Table className="border-2 border-black">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Audience</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Delivered</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCampaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <Stack gap={1}>
                            <Body className="font-bold">{campaign.name}</Body>
                            {campaign.eventName && <Label size="xs" className="text-ink-500">{campaign.eventName}</Label>}
                          </Stack>
                        </TableCell>
                        <TableCell><Label className={getStatusColor(campaign.status)}>{campaign.status}</Label></TableCell>
                        <TableCell>{campaign.audienceSize.toLocaleString()}</TableCell>
                        <TableCell>{campaign.sentCount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Stack gap={0}>
                            <Label>{campaign.deliveredCount.toLocaleString()}</Label>
                            {campaign.sentCount > 0 && <Label size="xs" className="text-ink-500">{((campaign.deliveredCount / campaign.sentCount) * 100).toFixed(1)}%</Label>}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack gap={0}>
                            <Label>{campaign.clickCount.toLocaleString()}</Label>
                            {campaign.deliveredCount > 0 && <Label size="xs" className="text-ink-500">{((campaign.clickCount / campaign.deliveredCount) * 100).toFixed(1)}% CTR</Label>}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="horizontal" gap={2}>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedCampaign(campaign)}>View</Button>
                            {campaign.status === "Draft" && <Button variant="outline" size="sm">Send</Button>}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "audiences"}>
              <Grid cols={3} gap={4}>
                {audienceSegments.map((segment) => (
                  <Card key={segment.id} className="border-2 border-black p-4">
                    <Stack gap={3}>
                      <Body className="font-bold">{segment.name}</Body>
                      <Label className="text-h5-md font-mono">{segment.count.toLocaleString()}</Label>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Export</Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
                <Card className="border-2 border-dashed border-ink-300 p-4 flex items-center justify-center cursor-pointer hover:border-black">
                  <Stack gap={2} className="text-center">
                    <Label className="text-ink-500">+ Create Segment</Label>
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "templates"}>
              <Grid cols={2} gap={4}>
                {[
                  { name: "Event Reminder", message: "Don't forget! [EVENT] is tomorrow. Gates open at [TIME]. See you there!" },
                  { name: "Flash Sale", message: "FLASH SALE! [DISCOUNT]% off tickets for the next [HOURS] hours only. Shop now: [LINK]" },
                  { name: "VIP Upgrade", message: "Upgrade to VIP for [EVENT]! Get exclusive perks for just $[PRICE] more: [LINK]" },
                  { name: "Last Chance", message: "Last chance! Only [COUNT] tickets left for [EVENT]. Get yours now: [LINK]" },
                ].map((template, idx) => (
                  <Card key={idx} className="border border-ink-200 p-4">
                    <Stack gap={3}>
                      <Body className="font-bold">{template.name}</Body>
                      <Body className="text-ink-600 text-body-sm">{template.message}</Body>
                      <Button variant="outline" size="sm">Use Template</Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>
          </Tabs>

          <Button variant="outline" onClick={() => router.push("/admin/marketing")}>Back to Marketing</Button>
        </Stack>
      </Container>

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
              <Body className="font-bold text-body-md">{selectedCampaign.name}</Body>
              <Card className="p-3 bg-ink-100 border border-ink-200">
                <Body className="text-body-sm">{selectedCampaign.message}</Body>
              </Card>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Status</Label><Label className={getStatusColor(selectedCampaign.status)}>{selectedCampaign.status}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Audience</Label><Label>{selectedCampaign.audienceSize.toLocaleString()}</Label></Stack>
              </Grid>
              <Grid cols={3} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Sent</Label><Label className="font-mono">{selectedCampaign.sentCount.toLocaleString()}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Delivered</Label><Label className="font-mono">{selectedCampaign.deliveredCount.toLocaleString()}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Clicks</Label><Label className="font-mono">{selectedCampaign.clickCount.toLocaleString()}</Label></Stack>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedCampaign(null)}>Close</Button>
        </ModalFooter>
      </Modal>
    </Section>
  );
}
