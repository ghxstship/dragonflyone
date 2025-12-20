"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Card, Tabs, TabsList, Tab, Badge, ProgressBar,
  Modal, ModalHeader, ModalBody, ModalFooter, Kicker,
} from "@ghxstship/ui";

import {
  DEMO_MARKETING_EARLY_BIRD_CAMPAIGNS,
  type DemoMarketingEarlyBirdCampaign as EarlyBirdCampaign,
} from "@/lib/demo-data";

const mockCampaigns = DEMO_MARKETING_EARLY_BIRD_CAMPAIGNS;

function EarlyBirdPageContent() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useTabState({
    defaultTab: 'active',
    validTabs: ['active', 'scheduled', 'ended', 'all'],
  });
  const [selectedCampaign, setSelectedCampaign] = useState<EarlyBirdCampaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeCampaigns = mockCampaigns.filter(c => c.status === "Active" || c.status === "Ending Soon");
  const totalRevenue = mockCampaigns.reduce((s, c) => s + (c.ticketsSold * c.discountedPrice), 0);
  const totalSaved = mockCampaigns.reduce((s, c) => s + (c.ticketsSold * (c.originalPrice - c.discountedPrice)), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-success-600";
      case "Ending Soon": return "text-warning-600";
      case "Scheduled": return "text-info-600";
      case "Ended": return "text-ink-600";
      default: return "text-ink-600";
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const filteredCampaigns = activeTab === "all" ? mockCampaigns :
    activeTab === "active" ? mockCampaigns.filter(c => c.status === "Active" || c.status === "Ending Soon") :
    mockCampaigns.filter(c => c.status.toLowerCase() === activeTab);

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Marketing</Kicker>
              <H2 size="lg" className="text-white">Early Bird Campaigns</H2>
              <Body className="text-on-dark-muted">Manage early bird pricing with countdown timers</Body>
            </Stack>

          <Card className="border-2 border-black p-6 bg-warning-50">
            <Stack gap={4}>
              <H3>Active Campaign Countdown</H3>
              <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Days", value: countdown.days },
                  { label: "Hours", value: countdown.hours },
                  { label: "Minutes", value: countdown.minutes },
                  { label: "Seconds", value: countdown.seconds },
                ].map((item) => (
                  <Card key={item.label} className="p-4 border-2 border-black text-center bg-white">
                    <Label className="font-mono text-h3-md">{String(item.value).padStart(2, "0")}</Label>
                    <Label className="text-ink-500">{item.label}</Label>
                  </Card>
                ))}
              </Grid>
              <Label className="text-ink-600 text-center">Until Super Early Bird ends for Summer Music Festival 2025</Label>
            </Stack>
          </Card>

          <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Active Campaigns" value={activeCampaigns.length} className="border-2 border-black" />
            <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} className="border-2 border-black" />
            <StatCard label="Customer Savings" value={formatCurrency(totalSaved)} className="border-2 border-black" />
            <StatCard label="Tickets Sold" value={mockCampaigns.reduce((s, c) => s + c.ticketsSold, 0)} className="border-2 border-black" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={isActive('active')} onClick={() => setActiveTab('active')}>Active</Tab>
                <Tab active={isActive('scheduled')} onClick={() => setActiveTab('scheduled')}>Scheduled</Tab>
                <Tab active={isActive('ended')} onClick={() => setActiveTab('ended')}>Ended</Tab>
                <Tab active={isActive('all')} onClick={() => setActiveTab('all')}>All</Tab>
              </TabsList>
            </Tabs>
            <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create Campaign</Button>
          </Stack>

          <Stack gap={4}>
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className={`border-2 ${campaign.status === "Ending Soon" ? "border-warning-500" : "border-black"} p-6`}>
                <Grid cols={6} gap={4} className="items-center">
                  <Stack gap={1}>
                    <Body className="font-weight-bold">{campaign.eventName}</Body>
                    <Badge variant="outline">{campaign.tierName}</Badge>
                  </Stack>
                  <Stack gap={1}>
                    <Stack direction="horizontal" gap={2}>
                      <Label className="line-through text-ink-600">{formatCurrency(campaign.originalPrice)}</Label>
                      <Label className="font-weight-bold text-success-600">{formatCurrency(campaign.discountedPrice)}</Label>
                    </Stack>
                    <Badge variant="solid" className="bg-success-600">{campaign.discountPercent}% OFF</Badge>
                  </Stack>
                  <Stack gap={1}>
                    <Label className="text-ink-500">Period</Label>
                    <Label>{campaign.startDate} - {campaign.endDate}</Label>
                  </Stack>
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="justify-between">
                      <Label className="text-ink-500">Sold</Label>
                      <Label>{campaign.ticketsSold} / {campaign.ticketsAllocated}</Label>
                    </Stack>
                    <ProgressBar value={(campaign.ticketsSold / campaign.ticketsAllocated) * 100} className="h-2" />
                  </Stack>
                  <Stack gap={1}>
                    <Label className={getStatusColor(campaign.status)}>{campaign.status}</Label>
                    {campaign.daysRemaining !== undefined && (
                      <Label className={campaign.daysRemaining <= 5 ? "text-warning-600" : "text-ink-500"}>
                        {campaign.daysRemaining} days left
                      </Label>
                    )}
                  </Stack>
                  <Button variant="outline" size="sm" onClick={() => setSelectedCampaign(campaign)}>Manage</Button>
                </Grid>
              </Card>
            ))}
          </Stack>

          <Button variant="outlineInk" onClick={() => router.push("/marketing")}>Back to Marketing</Button>
          </Stack>

      <Modal open={!!selectedCampaign} onClose={() => setSelectedCampaign(null)}>
        <ModalHeader><H3>Campaign Details</H3></ModalHeader>
        <ModalBody>
          {selectedCampaign && (
            <Stack gap={4}>
              <Body className="font-weight-bold">{selectedCampaign.eventName}</Body>
              <Badge variant="outline">{selectedCampaign.tierName}</Badge>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}><Label className="text-ink-500">Original Price</Label><Label className="line-through">{formatCurrency(selectedCampaign.originalPrice)}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-500">Discounted Price</Label><Label className="font-weight-bold text-success-600">{formatCurrency(selectedCampaign.discountedPrice)}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}><Label className="text-ink-500">Start Date</Label><Label>{selectedCampaign.startDate}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-500">End Date</Label><Label>{selectedCampaign.endDate}</Label></Stack>
              </Grid>
              <Stack gap={2}>
                <Stack direction="horizontal" className="justify-between">
                  <Label className="text-ink-500">Tickets Sold</Label>
                  <Label>{selectedCampaign.ticketsSold} / {selectedCampaign.ticketsAllocated}</Label>
                </Stack>
                <ProgressBar value={(selectedCampaign.ticketsSold / selectedCampaign.ticketsAllocated) * 100} className="h-3" />
              </Stack>
              <Stack gap={1}>
                <Label className="text-ink-500">Revenue Generated</Label>
                <Label className="font-mono text-h6-md">{formatCurrency(selectedCampaign.ticketsSold * selectedCampaign.discountedPrice)}</Label>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedCampaign(null)}>Close</Button>
          {selectedCampaign?.status === "Active" && <Button variant="outline" className="text-error-600">End Early</Button>}
          <Button variant="solid">Edit Campaign</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Early Bird Campaign</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select className="border-2 border-black">
              <option value="">Select Event...</option>
              <option value="e1">Summer Music Festival 2025</option>
              <option value="e2">Tech Conference 2025</option>
              <option value="e3">New Year Gala</option>
            </Select>
            <Input placeholder="Tier Name (e.g., Super Early Bird)" className="border-2 border-black" />
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Input type="number" placeholder="Original Price" className="border-2 border-black" />
              <Input type="number" placeholder="Discounted Price" className="border-2 border-black" />
            </Grid>
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Input type="date" placeholder="Start Date" className="border-2 border-black" />
              <Input type="date" placeholder="End Date" className="border-2 border-black" />
            </Grid>
            <Input type="number" placeholder="Tickets Allocated" className="border-2 border-black" />
            <Stack gap={2}>
              <Label className="text-ink-500">Countdown Display</Label>
              <Stack direction="horizontal" gap={2}>
                <Input type="checkbox" defaultChecked className="w-4 h-4" />
                <Label>Show countdown timer on event page</Label>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Input type="checkbox" defaultChecked className="w-4 h-4" />
                <Label>Send reminder emails before expiry</Label>
              </Stack>
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Create Campaign</Button>
        </ModalFooter>
      </Modal>
    </GvtewayAppLayout>
  );
}

export default function EarlyBirdPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <EarlyBirdPageContent />
    </Suspense>
  );
}
