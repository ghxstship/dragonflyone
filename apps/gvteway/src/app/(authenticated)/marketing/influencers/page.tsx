"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
// Layout provided by route group
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Card, Tabs, TabsList, Tab, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, ProgressBar, Kicker,
} from "@ghxstship/ui";

import {
  DEMO_INFLUENCERS,
  type DemoInfluencer as Influencer,
} from "@/lib/demo-data";

const mockInfluencers = DEMO_INFLUENCERS;

function InfluencersPageContent() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useTabState({
    defaultTab: 'all',
    validTabs: ['all', 'active', 'pending', 'completed'],
  });
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const totalReach = mockInfluencers.reduce((s, i) => s + i.followers, 0);
  const totalRevenue = mockInfluencers.reduce((s, i) => s + i.revenue, 0);
  const activeCount = mockInfluencers.filter(i => i.status === "Active").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-success-600";
      case "Pending": return "text-warning-600";
      case "Completed": return "text-ink-500";
      default: return "text-ink-600";
    }
  };

  const filteredInfluencers = activeTab === "all" ? mockInfluencers : mockInfluencers.filter(i => i.status.toLowerCase() === activeTab);

  return (
    <>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Marketing</Kicker>
              <H2 size="lg" className="text-white">Influencer Partnerships</H2>
              <Body className="text-on-dark-muted">Track and manage influencer marketing campaigns</Body>
            </Stack>

          <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Reach" value={formatNumber(totalReach)} className="border-2 border-black" />
            <StatCard label="Active Partners" value={activeCount} className="border-2 border-black" />
            <StatCard label="Total Revenue" value={`$${formatNumber(totalRevenue)}`} className="border-2 border-black" />
            <StatCard label="Avg Engagement" value="5.0%" className="border-2 border-black" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={isActive('all')} onClick={() => setActiveTab('all')}>All</Tab>
                <Tab active={isActive('active')} onClick={() => setActiveTab('active')}>Active</Tab>
                <Tab active={isActive('pending')} onClick={() => setActiveTab('pending')}>Pending</Tab>
                <Tab active={isActive('completed')} onClick={() => setActiveTab('completed')}>Completed</Tab>
              </TabsList>
            </Tabs>
            <Button variant="solid" onClick={() => setShowAddModal(true)}>Add Influencer</Button>
          </Stack>

          <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
            {filteredInfluencers.map((influencer) => (
              <Card key={influencer.id} className="border-2 border-black p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between">
                    <Stack gap={1}>
                      <Body className="font-weight-bold">{influencer.name}</Body>
                      <Label className="text-ink-500">{influencer.handle}</Label>
                    </Stack>
                    <Stack gap={1} className="text-right">
                      <Badge variant="outline">{influencer.platform}</Badge>
                      <Label className={getStatusColor(influencer.status)}>{influencer.status}</Label>
                    </Stack>
                  </Stack>
                  <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
                    <Stack gap={1}><Label size="xs" className="text-ink-600">Followers</Label><Label className="font-mono">{formatNumber(influencer.followers)}</Label></Stack>
                    <Stack gap={1}><Label size="xs" className="text-ink-600">Engagement</Label><Label className="font-mono">{influencer.engagement}%</Label></Stack>
                    <Stack gap={1}><Label size="xs" className="text-ink-600">Niche</Label><Badge variant="outline">{influencer.niche}</Badge></Stack>
                  </Grid>
                  <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                    <Stack gap={1}><Label size="xs" className="text-ink-600">Campaigns</Label><Label className="font-mono">{influencer.campaigns}</Label></Stack>
                    <Stack gap={1}><Label size="xs" className="text-ink-600">Revenue</Label><Label className="font-mono">${formatNumber(influencer.revenue)}</Label></Stack>
                  </Grid>
                  <Button variant="outline" size="sm" onClick={() => setSelectedInfluencer(influencer)}>View Details</Button>
                </Stack>
              </Card>
            ))}
          </Grid>

          <Button variant="outlineInk" onClick={() => router.push("/marketing")}>Back to Marketing</Button>
          </Stack>

      <Modal open={!!selectedInfluencer} onClose={() => setSelectedInfluencer(null)}>
        <ModalHeader><H3>{selectedInfluencer?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedInfluencer && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between">
                <Label className="text-ink-500">{selectedInfluencer.handle}</Label>
                <Badge variant="outline">{selectedInfluencer.platform}</Badge>
              </Stack>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}><Label className="text-ink-600">Followers</Label><Label className="font-mono text-h6-md">{formatNumber(selectedInfluencer.followers)}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-600">Engagement</Label><Label className="font-mono text-h6-md">{selectedInfluencer.engagement}%</Label></Stack>
              </Grid>
              <Stack gap={2}>
                <Label className="text-ink-600">Performance</Label>
                <ProgressBar value={selectedInfluencer.engagement * 10} className="h-2" />
              </Stack>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}><Label className="text-ink-600">Campaigns</Label><Label className="font-mono">{selectedInfluencer.campaigns}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-600">Revenue Generated</Label><Label className="font-mono">${formatNumber(selectedInfluencer.revenue)}</Label></Stack>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedInfluencer(null)}>Close</Button>
          <Button variant="solid">Create Campaign</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Add Influencer</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Name" className="border-2 border-black" />
            <Input placeholder="Handle (e.g., @username)" className="border-2 border-black" />
            <Select className="border-2 border-black">
              <option value="">Platform...</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="YouTube">YouTube</option>
              <option value="Twitter">Twitter</option>
            </Select>
            <Input type="number" placeholder="Followers" className="border-2 border-black" />
            <Select className="border-2 border-black">
              <option value="">Niche...</option>
              <option value="Music">Music</option>
              <option value="Festivals">Festivals</option>
              <option value="Concerts">Concerts</option>
              <option value="EDM">EDM</option>
            </Select>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAddModal(false)}>Add</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default function InfluencersPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <InfluencersPageContent />
    </Suspense>
  );
}
