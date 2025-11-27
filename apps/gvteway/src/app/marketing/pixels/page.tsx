"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, Alert,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface TrackingPixel {
  id: string;
  name: string;
  platform: "Facebook" | "Google Ads" | "TikTok" | "LinkedIn" | "Twitter" | "Snapchat";
  pixelId: string;
  status: "Active" | "Inactive" | "Error";
  eventsTracked: number;
  lastFired?: string;
  events: string[];
}

interface ConversionEvent {
  id: string;
  name: string;
  type: "PageView" | "Purchase" | "AddToCart" | "InitiateCheckout" | "Lead" | "Custom";
  count: number;
  value: number;
  lastTriggered: string;
}

const mockPixels: TrackingPixel[] = [
  { id: "PX-001", name: "Facebook Pixel", platform: "Facebook", pixelId: "123456789012345", status: "Active", eventsTracked: 15420, lastFired: "2 min ago", events: ["PageView", "Purchase", "AddToCart", "InitiateCheckout"] },
  { id: "PX-002", name: "Google Ads", platform: "Google Ads", pixelId: "AW-987654321", status: "Active", eventsTracked: 12350, lastFired: "5 min ago", events: ["PageView", "Purchase", "Lead"] },
  { id: "PX-003", name: "TikTok Pixel", platform: "TikTok", pixelId: "CTIKTOK123456", status: "Active", eventsTracked: 8920, lastFired: "10 min ago", events: ["PageView", "Purchase"] },
  { id: "PX-004", name: "LinkedIn Insight", platform: "LinkedIn", pixelId: "12345678", status: "Inactive", eventsTracked: 0, events: ["PageView"] },
];

const mockEvents: ConversionEvent[] = [
  { id: "EVT-001", name: "Page View", type: "PageView", count: 45230, value: 0, lastTriggered: "Just now" },
  { id: "EVT-002", name: "Purchase", type: "Purchase", count: 1245, value: 186750, lastTriggered: "3 min ago" },
  { id: "EVT-003", name: "Add to Cart", type: "AddToCart", count: 3420, value: 0, lastTriggered: "1 min ago" },
  { id: "EVT-004", name: "Initiate Checkout", type: "InitiateCheckout", count: 2180, value: 0, lastTriggered: "5 min ago" },
  { id: "EVT-005", name: "Lead Capture", type: "Lead", count: 890, value: 0, lastTriggered: "15 min ago" },
];

export default function PixelsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pixels");
  const [selectedPixel, setSelectedPixel] = useState<TrackingPixel | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const activePixels = mockPixels.filter(p => p.status === "Active").length;
  const totalEvents = mockPixels.reduce((s, p) => s + p.eventsTracked, 0);
  const totalConversions = mockEvents.find(e => e.type === "Purchase")?.count || 0;
  const totalValue = mockEvents.find(e => e.type === "Purchase")?.value || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-success-600";
      case "Inactive": return "text-grey-600";
      case "Error": return "text-error-600";
      default: return "text-grey-600";
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Facebook": return "📘";
      case "Google Ads": return "🔍";
      case "TikTok": return "🎵";
      case "LinkedIn": return "💼";
      case "Twitter": return "🐦";
      case "Snapchat": return "👻";
      default: return "📊";
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  return (
    <UISection className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>RETARGETING PIXELS</H1>
            <Body className="text-grey-600">Manage tracking pixels and conversion events</Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Active Pixels" value={activePixels} className="border-2 border-black" />
            <StatCard label="Events Tracked" value={totalEvents.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Conversions" value={totalConversions.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Conversion Value" value={formatCurrency(totalValue)} className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "pixels"} onClick={() => setActiveTab("pixels")}>Pixels</Tab>
              <Tab active={activeTab === "events"} onClick={() => setActiveTab("events")}>Events</Tab>
              <Tab active={activeTab === "audiences"} onClick={() => setActiveTab("audiences")}>Audiences</Tab>
            </TabsList>

            <TabPanel active={activeTab === "pixels"}>
              <Stack gap={4}>
                <Stack direction="horizontal" className="justify-end">
                  <Button variant="solid" onClick={() => setShowAddModal(true)}>Add Pixel</Button>
                </Stack>
                <Grid cols={2} gap={4}>
                  {mockPixels.map((pixel) => (
                    <Card key={pixel.id} className="border-2 border-black p-6">
                      <Stack gap={4}>
                        <Stack direction="horizontal" className="justify-between">
                          <Stack direction="horizontal" gap={3}>
                            <Label className="text-h4-md">{getPlatformIcon(pixel.platform)}</Label>
                            <Stack gap={1}>
                              <Body className="font-bold">{pixel.name}</Body>
                              <Label className="font-mono text-grey-500">{pixel.pixelId}</Label>
                            </Stack>
                          </Stack>
                          <Label className={getStatusColor(pixel.status)}>{pixel.status}</Label>
                        </Stack>
                        <Grid cols={2} gap={4}>
                          <Stack gap={1}>
                            <Label className="text-grey-500">Events Tracked</Label>
                            <Label className="font-mono">{pixel.eventsTracked.toLocaleString()}</Label>
                          </Stack>
                          <Stack gap={1}>
                            <Label className="text-grey-500">Last Fired</Label>
                            <Label>{pixel.lastFired || "Never"}</Label>
                          </Stack>
                        </Grid>
                        <Stack direction="horizontal" gap={2} className="flex-wrap">
                          {pixel.events.map((event, idx) => (
                            <Badge key={idx} variant="outline">{event}</Badge>
                          ))}
                        </Stack>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="outline" size="sm" onClick={() => setSelectedPixel(pixel)}>Configure</Button>
                          <Button variant="ghost" size="sm">Test</Button>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "events"}>
              <Table className="border-2 border-black">
                <TableHeader>
                  <TableRow className="bg-black text-white">
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Last Triggered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell><Label className="font-medium">{event.name}</Label></TableCell>
                      <TableCell><Badge variant="outline">{event.type}</Badge></TableCell>
                      <TableCell><Label className="font-mono">{event.count.toLocaleString()}</Label></TableCell>
                      <TableCell><Label className="font-mono">{event.value > 0 ? formatCurrency(event.value) : "-"}</Label></TableCell>
                      <TableCell><Label className="text-grey-500">{event.lastTriggered}</Label></TableCell>
                      <TableCell><Button variant="ghost" size="sm">Edit</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={activeTab === "audiences"}>
              <Stack gap={4}>
                {[
                  { name: "All Website Visitors", size: 45230, retention: "180 days" },
                  { name: "Cart Abandoners", size: 2175, retention: "30 days" },
                  { name: "Past Purchasers", size: 1245, retention: "365 days" },
                  { name: "High-Value Customers", size: 312, retention: "365 days" },
                ].map((audience, idx) => (
                  <Card key={idx} className="border-2 border-black p-4">
                    <Grid cols={4} gap={4} className="items-center">
                      <Body className="font-bold">{audience.name}</Body>
                      <Stack gap={1}>
                        <Label className="text-grey-500">Audience Size</Label>
                        <Label className="font-mono">{audience.size.toLocaleString()}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label className="text-grey-500">Retention</Label>
                        <Label>{audience.retention}</Label>
                      </Stack>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm">Export</Button>
                      </Stack>
                    </Grid>
                  </Card>
                ))}
                <Button variant="outline">Create Custom Audience</Button>
              </Stack>
            </TabPanel>
          </Tabs>

          <Alert variant="info">
            Ensure your privacy policy is updated to reflect the use of tracking pixels and retargeting.
          </Alert>

          <Button variant="outline" onClick={() => router.push("/marketing")}>Back to Marketing</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedPixel} onClose={() => setSelectedPixel(null)}>
        <ModalHeader><H3>Configure Pixel</H3></ModalHeader>
        <ModalBody>
          {selectedPixel && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={3}>
                <Label className="text-h4-md">{getPlatformIcon(selectedPixel.platform)}</Label>
                <Stack gap={1}>
                  <Body className="font-bold">{selectedPixel.name}</Body>
                  <Badge variant="outline">{selectedPixel.platform}</Badge>
                </Stack>
              </Stack>
              <Input defaultValue={selectedPixel.pixelId} placeholder="Pixel ID" className="border-2 border-black font-mono" />
              <Stack gap={2}>
                <Label className="text-grey-500">Events to Track</Label>
                <Grid cols={2} gap={2}>
                  {["PageView", "Purchase", "AddToCart", "InitiateCheckout", "Lead", "ViewContent"].map((event) => (
                    <Stack key={event} direction="horizontal" gap={2}>
                      <Input type="checkbox" defaultChecked={selectedPixel.events.includes(event)} className="w-4 h-4" />
                      <Label>{event}</Label>
                    </Stack>
                  ))}
                </Grid>
              </Stack>
              <Stack gap={2}>
                <Label className="text-grey-500">Status</Label>
                <Select defaultValue={selectedPixel.status} className="border-2 border-black">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedPixel(null)}>Cancel</Button>
          <Button variant="outline" className="text-error-600">Remove</Button>
          <Button variant="solid" onClick={() => setSelectedPixel(null)}>Save</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Add Tracking Pixel</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select className="border-2 border-black">
              <option value="">Select Platform...</option>
              <option value="facebook">Facebook Pixel</option>
              <option value="google">Google Ads</option>
              <option value="tiktok">TikTok Pixel</option>
              <option value="linkedin">LinkedIn Insight Tag</option>
              <option value="twitter">Twitter Pixel</option>
              <option value="snapchat">Snapchat Pixel</option>
            </Select>
            <Input placeholder="Pixel Name" className="border-2 border-black" />
            <Input placeholder="Pixel ID" className="border-2 border-black font-mono" />
            <Textarea placeholder="Paste pixel code (optional)..." rows={3} className="border-2 border-black font-mono" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAddModal(false)}>Add Pixel</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
