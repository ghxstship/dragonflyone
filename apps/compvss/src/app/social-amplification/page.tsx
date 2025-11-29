"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompvssAppLayout } from "../../components/app-layout";
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Input,
  Select,
  Button,
  Card,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

interface ArtistProfile {
  id: string;
  name: string;
  genre: string;
  followers: number;
  platforms: { name: string; handle: string; followers: number }[];
  scheduledPosts: number;
  engagement: number;
  status: "Active" | "Pending" | "Inactive";
}

interface AmplificationCampaign {
  id: string;
  name: string;
  eventName: string;
  artists: string[];
  startDate: string;
  endDate: string;
  status: "Active" | "Scheduled" | "Completed";
  reach: number;
  engagement: number;
  posts: number;
}

const mockArtists: ArtistProfile[] = [
  { id: "ART-001", name: "The Headliners", genre: "Rock", followers: 2500000, platforms: [{ name: "Instagram", handle: "@theheadliners", followers: 1500000 }, { name: "Twitter", handle: "@headliners", followers: 800000 }, { name: "TikTok", handle: "@theheadliners", followers: 200000 }], scheduledPosts: 5, engagement: 4.2, status: "Active" },
  { id: "ART-002", name: "DJ Pulse", genre: "Electronic", followers: 850000, platforms: [{ name: "Instagram", handle: "@djpulse", followers: 500000 }, { name: "Twitter", handle: "@djpulse", followers: 350000 }], scheduledPosts: 3, engagement: 5.1, status: "Active" },
  { id: "ART-003", name: "Indie Collective", genre: "Indie", followers: 320000, platforms: [{ name: "Instagram", handle: "@indiecollective", followers: 200000 }, { name: "TikTok", handle: "@indiecollective", followers: 120000 }], scheduledPosts: 0, engagement: 3.8, status: "Pending" },
];

const mockCampaigns: AmplificationCampaign[] = [
  { id: "CAMP-001", name: "Summer Fest Launch", eventName: "Summer Fest 2024", artists: ["The Headliners", "DJ Pulse"], startDate: "2024-11-01", endDate: "2024-11-30", status: "Active", reach: 3200000, engagement: 156000, posts: 24 },
  { id: "CAMP-002", name: "Ticket Sale Push", eventName: "Summer Fest 2024", artists: ["The Headliners", "DJ Pulse", "Indie Collective"], startDate: "2024-12-01", endDate: "2024-12-15", status: "Scheduled", reach: 0, engagement: 0, posts: 12 },
];

export default function SocialAmplificationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("artists");
  const [selectedArtist, setSelectedArtist] = useState<ArtistProfile | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<AmplificationCampaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const totalReach = mockArtists.reduce((sum, a) => sum + a.followers, 0);
  const activeArtists = mockArtists.filter(a => a.status === "Active").length;
  const activeCampaigns = mockCampaigns.filter(c => c.status === "Active").length;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-success-400";
      case "Scheduled": return "text-info-400";
      case "Pending": return "text-warning-400";
      case "Completed": return "text-ink-400";
      default: return "text-ink-400";
    }
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Social Amplification"
        subtitle="Coordinate artist and performer social media promotion"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Social Amplification' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard value={formatNumber(totalReach)} label="Total Reach" />
              <StatCard value={activeArtists.toString()} label="Active Artists" />
              <StatCard value={activeCampaigns.toString()} label="Active Campaigns" />
              <StatCard value="4.3%" label="Avg Engagement" />
            </Grid>

            <Stack direction="horizontal" className="justify-between">
              <Tabs>
                <TabsList>
                  <Tab active={activeTab === "artists"} onClick={() => setActiveTab("artists")}>Artists</Tab>
                  <Tab active={activeTab === "campaigns"} onClick={() => setActiveTab("campaigns")}>Campaigns</Tab>
                  <Tab active={activeTab === "content"} onClick={() => setActiveTab("content")}>Content Library</Tab>
                </TabsList>
              </Tabs>
              <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create Campaign</Button>
            </Stack>

            <TabPanel active={activeTab === "artists"}>
              <Grid cols={3} gap={4}>
                {mockArtists.map((artist) => (
                  <Card key={artist.id} className="p-6">
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="items-start justify-between">
                        <Stack gap={1}>
                          <Body className="font-display">{artist.name}</Body>
                          <Badge variant="outline">{artist.genre}</Badge>
                        </Stack>
                        <Badge variant={artist.status === "Active" ? "solid" : "outline"}>{artist.status}</Badge>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm">Total Followers</Body>
                        <Body className="text-h6-md">{formatNumber(artist.followers)}</Body>
                      </Stack>
                      <Stack gap={2}>
                        <Body className="text-body-sm">Platforms</Body>
                        {artist.platforms.map((p) => (
                          <Stack key={p.name} direction="horizontal" className="justify-between">
                            <Body className="text-body-sm">{p.name}</Body>
                            <Body className="text-body-sm">{formatNumber(p.followers)}</Body>
                          </Stack>
                        ))}
                      </Stack>
                      <Grid cols={2} gap={4}>
                        <Stack gap={1}>
                          <Body className="text-body-sm">Scheduled</Body>
                          <Body>{artist.scheduledPosts} posts</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm">Engagement</Body>
                          <Body>{artist.engagement}%</Body>
                        </Stack>
                      </Grid>
                      <Button variant="outline" size="sm" onClick={() => setSelectedArtist(artist)}>Manage</Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "campaigns"}>
              <Stack gap={4}>
                {mockCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="p-6">
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Body className="font-display">{campaign.name}</Body>
                        <Body className="text-body-sm">{campaign.eventName}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm">Artists</Body>
                        <Body>{campaign.artists.length}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm">Duration</Body>
                        <Body className="text-body-sm">{campaign.startDate} - {campaign.endDate}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm">Reach</Body>
                        <Body>{formatNumber(campaign.reach)}</Body>
                      </Stack>
                      <Badge variant={campaign.status === "Active" ? "solid" : "outline"}>{campaign.status}</Badge>
                      <Button variant="outline" size="sm" onClick={() => setSelectedCampaign(campaign)}>Details</Button>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "content"}>
              <Grid cols={4} gap={4}>
                {["Promo Graphics", "Video Clips", "Story Templates", "Post Captions", "Hashtag Sets", "Bio Links", "Press Photos", "Logo Pack"].map((item, idx) => (
                  <Card key={idx} className="cursor-pointer p-4">
                    <Stack gap={2} className="text-center">
                      <Body className="text-h3-md">{["🖼️", "🎬", "📱", "📝", "#️⃣", "🔗", "📷", "🎨"][idx]}</Body>
                      <Body>{item}</Body>
                      <Body className="text-body-sm">{Math.floor(Math.random() * 20) + 5} items</Body>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <Grid cols={3} gap={4}>
              <Button variant="outline">Analytics</Button>
              <Button variant="outline" onClick={() => router.push("/marketing")}>Marketing</Button>
              <Button variant="outline" onClick={() => router.push("/projects")}>Projects</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={!!selectedArtist} onClose={() => setSelectedArtist(null)}>
        <ModalHeader><H3>{selectedArtist?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedArtist && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between">
                <Badge variant="outline">{selectedArtist.genre}</Badge>
                <Badge variant={selectedArtist.status === "Active" ? "solid" : "outline"}>{selectedArtist.status}</Badge>
              </Stack>
              <Stack gap={1}>
                <Body className="text-body-sm">Total Reach</Body>
                <Body className="text-h5-md">{formatNumber(selectedArtist.followers)}</Body>
              </Stack>
              <Stack gap={2}>
                <Body className="font-display">Platform Breakdown</Body>
                {selectedArtist.platforms.map((p) => (
                  <Card key={p.name} className="p-3">
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack gap={0}>
                        <Body>{p.name}</Body>
                        <Body className="text-body-sm">{p.handle}</Body>
                      </Stack>
                      <Body>{formatNumber(p.followers)}</Body>
                    </Stack>
                  </Card>
                ))}
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="text-body-sm">Scheduled Posts</Body>
                  <Body>{selectedArtist.scheduledPosts}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-body-sm">Avg Engagement</Body>
                  <Body>{selectedArtist.engagement}%</Body>
                </Stack>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedArtist(null)}>Close</Button>
          <Button variant="solid">Schedule Post</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Campaign</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Campaign name" />
            <Select>
              <option value="">Select Event...</option>
              <option value="EVT-001">Summer Fest 2024</option>
            </Select>
            <Grid cols={2} gap={4}>
              <Input type="date" />
              <Input type="date" />
            </Grid>
            <Textarea placeholder="Campaign description..." rows={3} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Create</Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
